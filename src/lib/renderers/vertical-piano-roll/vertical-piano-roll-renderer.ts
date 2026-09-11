import { brightenHexColor } from "@/lib/colors/hex";
import { MidiNote } from "@/lib/midi/midi";
import { RendererConfig, RendererContext, RendererFactory } from "@/lib/renderers/renderer";
import { findFirstNoteIndexFrom } from "@/lib/renderers/shared/find-first-note-from";
import { NoiseTextureRenderer } from "@/lib/renderers/shared/noise-texture-renderer";
import { drawRipple } from "@/lib/renderers/shared/ripple";
import { drawRoughRect } from "@/lib/renderers/shared/rough-rect-drawer";

import {
  MIN_PRESS_DURATION,
  computeFlashIntensity,
  computeRippleProgress,
  isKeyPressed,
  resolveNoteBaseColor,
} from "./note-effects";
import { KeyboardLayout, createKeyboardLayout } from "./piano-keyboard-layout";

const BLACK_KEY_HEIGHT_RATIO = 0.62;
const MIN_NOTE_HEIGHT = 2;
const KEY_BORDER_OPACITY = 0.3;
const OCTAVE_LABEL_OPACITY = 0.6;

type VerticalPianoRollConfig = RendererConfig["verticalPianoRollConfig"];

interface PendingRipple {
  x: number;
  progress: number;
  color: string;
  opacity: number;
}

interface PressedKeys {
  colors: (string | undefined)[];
  opacities: number[];
}

function drawLaneLines(
  ctx: RendererContext,
  layout: KeyboardLayout,
  hitLineY: number,
  color: string,
  opacity: number,
  filter: (midi: number) => boolean,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const key of layout.keys) {
    if (key.isBlack || key.x === 0 || !filter(key.midi)) continue;
    // Snap to the pixel center so a 1px line does not blur across two columns
    const x = Math.round(key.x) + 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, hitLineY);
  }
  ctx.stroke();
  ctx.restore();
}

function drawKeyboard(
  ctx: RendererContext,
  cfg: VerticalPianoRollConfig,
  width: number,
  layout: KeyboardLayout,
  pressed: PressedKeys,
  top: number,
  keyboardHeight: number,
) {
  const blackKeyHeight = keyboardHeight * BLACK_KEY_HEIGHT_RATIO;

  ctx.save();

  ctx.fillStyle = cfg.whiteKeyColor;
  ctx.fillRect(0, top, width, keyboardHeight);

  if (cfg.showKeyPressHighlight) {
    for (const key of layout.keys) {
      if (key.isBlack) continue;
      const color = pressed.colors[key.midi];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.globalAlpha = cfg.keyPressOpacity * pressed.opacities[key.midi];
      ctx.fillRect(key.x, top, key.width, keyboardHeight);
    }
  }

  ctx.fillStyle = cfg.blackKeyColor;
  ctx.globalAlpha = KEY_BORDER_OPACITY;
  for (const key of layout.keys) {
    if (key.isBlack || key.x === 0) continue;
    ctx.fillRect(key.x, top, 1, keyboardHeight);
  }

  ctx.globalAlpha = 1;
  for (const key of layout.keys) {
    if (!key.isBlack) continue;
    ctx.fillStyle = cfg.blackKeyColor;
    ctx.globalAlpha = 1;
    ctx.fillRect(key.x, top, key.width, blackKeyHeight);

    const color = cfg.showKeyPressHighlight ? pressed.colors[key.midi] : undefined;
    if (!color) continue;
    ctx.fillStyle = color;
    ctx.globalAlpha = cfg.keyPressOpacity * pressed.opacities[key.midi];
    ctx.fillRect(key.x, top, key.width, blackKeyHeight);
  }

  if (cfg.showOctaveLabels) {
    const fontSize = Math.max(6, Math.min(14, layout.whiteKeyWidth * 0.5));
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = cfg.blackKeyColor;
    ctx.globalAlpha = OCTAVE_LABEL_OPACITY;
    for (const key of layout.keys) {
      if (key.isBlack || key.midi % 12 !== 0) continue;
      const octave = Math.floor(key.midi / 12) - 1;
      ctx.fillText(`C${octave}`, key.x + key.width / 2, top + keyboardHeight - fontSize / 2);
    }
  }

  ctx.restore();
}

export const createVerticalPianoRollRenderer: RendererFactory = (ctx) => {
  const noiseTextureRenderer = new NoiseTextureRenderer(ctx);
  const maxDurations = new WeakMap<MidiNote[], number>();
  const pressed: PressedKeys = {
    colors: Array.from({ length: 128 }),
    opacities: Array.from({ length: 128 }),
  };
  const pendingRipples: PendingRipple[] = [];
  let layout: KeyboardLayout | undefined;
  let layoutKey = "";

  const getLayout = (width: number, cfg: VerticalPianoRollConfig): KeyboardLayout => {
    const key = `${width}:${cfg.viewRangeBottom}:${cfg.viewRangeTop}`;
    if (!layout || layoutKey !== key) {
      layout = createKeyboardLayout(cfg.viewRangeBottom, cfg.viewRangeTop, width);
      layoutKey = key;
    }
    return layout;
  };

  const getMaxDuration = (notes: MidiNote[]): number => {
    let max = maxDurations.get(notes);
    if (max === undefined) {
      max = 0;
      for (const note of notes) {
        if (note.duration > max) max = note.duration;
      }
      maxDurations.set(notes, max);
    }
    return max;
  };

  const updateNoiseTexture = (cfg: VerticalPianoRollConfig) => {
    if (!cfg.showNoiseTexture) {
      noiseTextureRenderer.clearPatterns();
      return;
    }
    noiseTextureRenderer.updatePatterns({
      intensity: cfg.noiseIntensity,
      grainSize: cfg.noiseGrainSize,
      colorVariance: cfg.noiseColorVariance,
    });
  };

  return (tracks, currentTime, config) => {
    const { width, height } = config.resolution;
    const cfg = config.verticalPianoRollConfig;

    updateNoiseTexture(cfg);
    const keyboard = getLayout(width, cfg);
    const hitLineY = height * (1 - cfg.keyboardHeight / 100);
    const pxPerSec = hitLineY / cfg.timeWindow;
    const timeToY = (time: number) => hitLineY - (time - currentTime) * pxPerSec;

    pressed.colors.fill(undefined);
    pressed.opacities.fill(0);
    pendingRipples.length = 0;

    if (cfg.showKeyLines) {
      drawLaneLines(ctx, keyboard, hitLineY, cfg.keyLineColor, cfg.keyLineOpacity, () => true);
    }
    if (cfg.showOctaveLines) {
      drawLaneLines(
        ctx,
        keyboard,
        hitLineY,
        cfg.octaveLineColor,
        cfg.octaveLineOpacity,
        (midi) => midi % 12 === 0,
      );
    }

    // Effects of a note are a function of time since it hit the keyboard, so notes that already
    // ended must still be visited for as long as any effect can be visible
    const lookback = Math.max(
      cfg.rippleDuration,
      cfg.noteFlashDuration + cfg.noteFlashFadeOutDuration,
      MIN_PRESS_DURATION,
    );
    const topEdgeTime = currentTime + cfg.timeWindow;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, hitLineY);
    ctx.clip();

    // Black keys sit in front of white keys, so black-key notes of every track are drawn in a
    // second pass on top. Within a pass the first track in the list is drawn last (on top) and
    // wins the key color.
    for (const drawBlackKeys of [false, true]) {
      for (let ti = tracks.length - 1; ti >= 0; ti--) {
        const track = tracks[ti];
        if (!track.config.visible) continue;

        const maxDuration = getMaxDuration(track.notes);
        const startIdx = findFirstNoteIndexFrom(track.notes, currentTime - lookback - maxDuration);

        for (let ni = startIdx; ni < track.notes.length; ni++) {
          const note = track.notes[ni];
          if (note.time > topEdgeTime) break;

          const key = keyboard.byMidi[note.midi];
          if (!key) continue;

          const noteEnd = note.time + note.duration;

          if (!drawBlackKeys && isKeyPressed(note.time, noteEnd, currentTime)) {
            pressed.colors[note.midi] = track.config.color;
            pressed.opacities[note.midi] = track.config.opacity;
          }

          if (!drawBlackKeys && cfg.showRippleEffect) {
            const progress = computeRippleProgress(cfg.rippleDuration, note.time, currentTime);
            if (progress !== null) {
              pendingRipples.push({
                x: key.x + key.width / 2,
                progress,
                color: cfg.useCustomRippleColor ? cfg.rippleColor : track.config.color,
                opacity: track.config.opacity,
              });
            }
          }

          if (key.isBlack !== drawBlackKeys) continue;

          const noteWidth = Math.max(0, key.width - cfg.noteMargin * 2);
          const bottom = timeToY(note.time) - cfg.noteVerticalMargin;
          const noteHeight = Math.max(
            MIN_NOTE_HEIGHT,
            track.config.staccato ? noteWidth : bottom - timeToY(noteEnd) - cfg.noteVerticalMargin,
          );
          const y = bottom - noteHeight;
          if (y >= hitLineY) continue;

          const x = key.x + cfg.noteMargin;
          // Anything below the hit line is clipped anyway; keep just enough for the corners
          const visibleHeight = Math.min(
            noteHeight,
            hitLineY - y + cfg.noteCornerRadius + cfg.roughEdgeIntensity,
          );
          const cornerRadius = Math.min(cfg.noteCornerRadius, noteWidth / 2, visibleHeight / 2);

          const baseColor = resolveNoteBaseColor(track.config.color, key.isBlack, cfg);
          const flashIntensity = cfg.showNoteFlash
            ? computeFlashIntensity(cfg, note.time, noteEnd, currentTime)
            : 0;
          ctx.fillStyle =
            flashIntensity > 0 ? brightenHexColor(baseColor, flashIntensity) : baseColor;
          ctx.globalAlpha = track.config.opacity;

          const seed = note.time * 1000 + note.midi;
          if (cfg.showRoughEdge) {
            drawRoughRect(
              ctx,
              x,
              y,
              noteWidth,
              visibleHeight,
              cornerRadius,
              cfg.roughEdgeIntensity,
              cfg.roughEdgeSegmentLength,
              seed,
            );
          } else {
            ctx.beginPath();
            ctx.roundRect(x, y, noteWidth, visibleHeight, cornerRadius);
          }
          ctx.fill();

          if (cfg.showNoiseTexture) {
            noiseTextureRenderer.apply(baseColor, x, y, seed);
          }

          ctx.fillStyle = `rgba(255, 255, 255, ${note.velocity * 0.3})`;
          ctx.fill();
        }
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();

    drawKeyboard(ctx, cfg, width, keyboard, pressed, hitLineY, height - hitLineY);

    if (cfg.showHitLine) {
      // Anchored to the keyboard top so a thicker line grows upward instead of covering the keys
      ctx.save();
      ctx.fillStyle = cfg.hitLineColor;
      ctx.globalAlpha = cfg.hitLineOpacity;
      ctx.fillRect(0, hitLineY - cfg.hitLineWidth, width, cfg.hitLineWidth);
      ctx.restore();
    }

    for (const ripple of pendingRipples) {
      drawRipple(
        ctx,
        ripple.x,
        hitLineY,
        cfg.rippleRadius * ripple.progress,
        ripple.color,
        0.4 * (1 - ripple.progress) * ripple.opacity,
      );
    }
  };
};
