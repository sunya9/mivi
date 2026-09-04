import { brightenHexColor } from "@/lib/colors/hex";
import { MidiNote, MidiTrack } from "@/lib/midi/midi";
import { Renderer, RendererConfig } from "@/lib/renderers/renderer";
import { findFirstNoteIndexFrom } from "@/lib/renderers/shared/find-first-note-from";
import { NoiseTextureRenderer } from "@/lib/renderers/shared/noise-texture-renderer";
import { drawRipple } from "@/lib/renderers/shared/ripple";
import { RoughRectDrawer } from "@/lib/renderers/shared/rough-rect-drawer";

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

interface PendingRipple {
  x: number;
  progress: number;
  color: string;
}

export class VerticalPianoRollRenderer extends Renderer {
  #noiseTextureRenderer: NoiseTextureRenderer;
  #roughRectDrawer: RoughRectDrawer;
  #layout?: KeyboardLayout;
  #layoutKey = "";
  #maxDurations = new WeakMap<MidiNote[], number>();
  #pressedColors: (string | undefined)[] = Array.from({ length: 128 });
  #pressedOpacities: number[] = Array.from({ length: 128 });
  #pendingRipples: PendingRipple[] = [];

  constructor(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    config: RendererConfig,
  ) {
    super(ctx, config);
    this.#noiseTextureRenderer = new NoiseTextureRenderer(ctx);
    this.#roughRectDrawer = new RoughRectDrawer(ctx);
  }

  render(tracks: MidiTrack[], currentTime: number) {
    const { width, height } = this.config.resolution;
    const cfg = this.config.verticalPianoRollConfig;

    this.#updateNoiseTexture();
    const layout = this.#getLayout(width);
    const hitLineY = height * (1 - cfg.keyboardHeight / 100);
    const pxPerSec = hitLineY / cfg.timeWindow;
    const timeToY = (time: number) => hitLineY - (time - currentTime) * pxPerSec;

    this.#pressedColors.fill(undefined);
    this.#pressedOpacities.fill(0);
    this.#pendingRipples.length = 0;

    if (cfg.showKeyLines) {
      this.#drawLaneLines(layout, hitLineY, cfg.keyLineColor, cfg.keyLineOpacity, () => true);
    }
    if (cfg.showOctaveLines) {
      this.#drawLaneLines(
        layout,
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

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, 0, width, hitLineY);
    this.ctx.clip();

    // Reverse iteration so first track in list appears on top (drawn last) and wins the key color
    for (let ti = tracks.length - 1; ti >= 0; ti--) {
      const track = tracks[ti];
      if (!track.config.visible) continue;

      const maxDuration = this.#getMaxDuration(track.notes);
      const startIdx = findFirstNoteIndexFrom(track.notes, currentTime - lookback - maxDuration);

      // Black keys sit in front of white keys, so their notes are drawn in a second pass on top
      for (const drawBlackKeys of [false, true]) {
        for (let ni = startIdx; ni < track.notes.length; ni++) {
          const note = track.notes[ni];
          if (note.time > topEdgeTime) break;

          const key = layout.byMidi[note.midi];
          if (!key) continue;

          const noteEnd = note.time + note.duration;

          if (!drawBlackKeys && isKeyPressed(note.time, noteEnd, currentTime)) {
            this.#pressedColors[note.midi] = track.config.color;
            this.#pressedOpacities[note.midi] = track.config.opacity;
          }

          if (!drawBlackKeys && cfg.showRippleEffect) {
            const progress = computeRippleProgress(cfg.rippleDuration, note.time, currentTime);
            if (progress !== null) {
              this.#pendingRipples.push({
                x: key.x + key.width / 2,
                progress,
                color: cfg.useCustomRippleColor ? cfg.rippleColor : track.config.color,
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
          this.ctx.fillStyle =
            flashIntensity > 0 ? brightenHexColor(baseColor, flashIntensity) : baseColor;
          this.ctx.globalAlpha = track.config.opacity;

          const seed = note.time * 1000 + note.midi;
          if (cfg.showRoughEdge) {
            this.#roughRectDrawer.draw(
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
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, noteWidth, visibleHeight, cornerRadius);
          }
          this.ctx.fill();

          if (cfg.showNoiseTexture) {
            this.#noiseTextureRenderer.apply(baseColor, x, y, seed);
          }

          this.ctx.fillStyle = `rgba(255, 255, 255, ${note.velocity * 0.3})`;
          this.ctx.fill();
        }
      }
    }

    this.ctx.globalAlpha = 1;
    this.ctx.restore();

    this.#drawKeyboard(layout, hitLineY, height - hitLineY);

    if (cfg.showHitLine) {
      // Anchored to the keyboard top so a thicker line grows upward instead of covering the keys
      this.ctx.save();
      this.ctx.fillStyle = cfg.hitLineColor;
      this.ctx.globalAlpha = cfg.hitLineOpacity;
      this.ctx.fillRect(0, hitLineY - cfg.hitLineWidth, width, cfg.hitLineWidth);
      this.ctx.restore();
    }

    for (const ripple of this.#pendingRipples) {
      drawRipple(
        this.ctx,
        ripple.x,
        hitLineY,
        cfg.rippleRadius * ripple.progress,
        ripple.color,
        0.4 * (1 - ripple.progress),
      );
    }
  }

  #getLayout(width: number): KeyboardLayout {
    const { viewRangeBottom, viewRangeTop } = this.config.verticalPianoRollConfig;
    const key = `${width}:${viewRangeBottom}:${viewRangeTop}`;
    if (!this.#layout || this.#layoutKey !== key) {
      this.#layout = createKeyboardLayout(viewRangeBottom, viewRangeTop, width);
      this.#layoutKey = key;
    }
    return this.#layout;
  }

  #getMaxDuration(notes: MidiNote[]): number {
    let max = this.#maxDurations.get(notes);
    if (max === undefined) {
      max = 0;
      for (const note of notes) {
        if (note.duration > max) max = note.duration;
      }
      this.#maxDurations.set(notes, max);
    }
    return max;
  }

  #drawLaneLines(
    layout: KeyboardLayout,
    hitLineY: number,
    color: string,
    opacity: number,
    filter: (midi: number) => boolean,
  ) {
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.globalAlpha = opacity;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for (const key of layout.keys) {
      if (key.isBlack || key.x === 0 || !filter(key.midi)) continue;
      // Snap to the pixel center so a 1px line does not blur across two columns
      const x = Math.round(key.x) + 0.5;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, hitLineY);
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  #drawKeyboard(layout: KeyboardLayout, top: number, keyboardHeight: number) {
    const cfg = this.config.verticalPianoRollConfig;
    const { width } = this.config.resolution;
    const blackKeyHeight = keyboardHeight * BLACK_KEY_HEIGHT_RATIO;

    this.ctx.save();

    this.ctx.fillStyle = cfg.whiteKeyColor;
    this.ctx.fillRect(0, top, width, keyboardHeight);

    if (cfg.showKeyPressHighlight) {
      for (const key of layout.keys) {
        if (key.isBlack) continue;
        const color = this.#pressedColors[key.midi];
        if (!color) continue;
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = cfg.keyPressOpacity * this.#pressedOpacities[key.midi];
        this.ctx.fillRect(key.x, top, key.width, keyboardHeight);
      }
    }

    this.ctx.fillStyle = cfg.blackKeyColor;
    this.ctx.globalAlpha = KEY_BORDER_OPACITY;
    for (const key of layout.keys) {
      if (key.isBlack || key.x === 0) continue;
      this.ctx.fillRect(key.x, top, 1, keyboardHeight);
    }

    this.ctx.globalAlpha = 1;
    for (const key of layout.keys) {
      if (!key.isBlack) continue;
      this.ctx.fillStyle = cfg.blackKeyColor;
      this.ctx.globalAlpha = 1;
      this.ctx.fillRect(key.x, top, key.width, blackKeyHeight);

      const color = cfg.showKeyPressHighlight ? this.#pressedColors[key.midi] : undefined;
      if (!color) continue;
      this.ctx.fillStyle = color;
      this.ctx.globalAlpha = cfg.keyPressOpacity * this.#pressedOpacities[key.midi];
      this.ctx.fillRect(key.x, top, key.width, blackKeyHeight);
    }

    if (cfg.showOctaveLabels) {
      const fontSize = Math.max(6, Math.min(14, layout.whiteKeyWidth * 0.5));
      this.ctx.font = `${fontSize}px sans-serif`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "bottom";
      this.ctx.fillStyle = cfg.blackKeyColor;
      this.ctx.globalAlpha = OCTAVE_LABEL_OPACITY;
      for (const key of layout.keys) {
        if (key.isBlack || key.midi % 12 !== 0) continue;
        const octave = Math.floor(key.midi / 12) - 1;
        this.ctx.fillText(`C${octave}`, key.x + key.width / 2, top + keyboardHeight - fontSize / 2);
      }
    }

    this.ctx.restore();
  }

  #updateNoiseTexture(): void {
    const { showNoiseTexture, noiseIntensity, noiseGrainSize, noiseColorVariance } =
      this.config.verticalPianoRollConfig;

    if (!showNoiseTexture) {
      this.#noiseTextureRenderer.clearPatterns();
      return;
    }

    this.#noiseTextureRenderer.updatePatterns({
      intensity: noiseIntensity,
      grainSize: noiseGrainSize,
      colorVariance: noiseColorVariance,
    });
  }
}
