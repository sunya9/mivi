import { brightenHexColor } from "@/lib/colors/hex";
import { RendererConfig, RendererFactory } from "@/lib/renderers/renderer";
import { findFirstVisibleNoteIndex } from "@/lib/renderers/shared/find-first-visible-note";
import { NoiseTextureRenderer } from "@/lib/renderers/shared/noise-texture-renderer";
import { computePressOffset } from "@/lib/renderers/shared/note-press";
import { drawRipple } from "@/lib/renderers/shared/ripple";
import { drawRoughRect } from "@/lib/renderers/shared/rough-rect-drawer";

// Keeps a note "touched" for a few pixels past its right edge so short notes still register
const PLAYHEAD_TOUCH_SLACK_PX = 20;

const OVERFLOW_FACTOR = 0.5;

interface RippleState {
  noteStart: number;
  noteEnd: number;
  x: number;
  y: number;
  color: string;
}

interface NoteFlashState {
  noteStart: number;
  color: string;
  isDurationMode: boolean;
  hasCompleted: boolean;
  wasTouchingPlayhead: boolean;
}

type PianoRollConfig = RendererConfig["pianoRollConfig"];

function noteToY(midi: number, height: number, cfg: PianoRollConfig): number {
  const noteHeight = Math.max(height / 127, cfg.noteHeight);
  const viewRangeSize = cfg.viewRangeTop - cfg.viewRangeBottom;
  return height * ((cfg.viewRangeTop - midi) / viewRangeSize) - noteHeight / 2;
}

export const createPianoRollRenderer: RendererFactory = (ctx) => {
  const noiseTextureRenderer = new NoiseTextureRenderer(ctx);
  const rippleStates = new Map<number, RippleState>();
  const noteFlashStates = new Map<number, NoteFlashState>();
  let lastCurrentTime = 0;

  const updateNoiseTexture = (cfg: PianoRollConfig) => {
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
    if (currentTime < lastCurrentTime) {
      rippleStates.clear();
      noteFlashStates.clear();
    }
    lastCurrentTime = currentTime;

    const cfg = config.pianoRollConfig;
    updateNoiseTexture(cfg);
    const { width, height } = config.resolution;

    const isNoteInViewRange = (midi: number) =>
      midi <= cfg.viewRangeTop && midi >= cfg.viewRangeBottom;

    const playheadPosition = cfg.playheadPosition / 100;
    const playheadX = width * playheadPosition;

    const startTime = currentTime - cfg.timeWindow * playheadPosition;
    const endTime = startTime + cfg.timeWindow;

    const timeToX = (time: number, scale: number = 1) => {
      const timeFromPlayhead = time - currentTime;
      const scaledTimeFromPlayhead = timeFromPlayhead * scale;
      const adjustedTime = currentTime + scaledTimeFromPlayhead;

      return width * ((adjustedTime - startTime) / cfg.timeWindow);
    };

    // Reverse iteration so first track in list appears on top (drawn last)
    for (let ti = tracks.length - 1; ti >= 0; ti--) {
      const track = tracks[ti];
      if (!track.config.visible) continue;

      // Calculate actual time corresponding to screen edges, accounting for scale
      const scale = track.config.scale;
      const leftEdgeTime = currentTime + (startTime - currentTime) / scale;
      const rightEdgeTime = currentTime + (endTime - currentTime) / scale;
      const scaledOverflow = (cfg.timeWindow * OVERFLOW_FACTOR) / scale;
      const pxPerSecond = (width * scale) / cfg.timeWindow;

      // Binary search to skip notes that end before the visible range
      const startIdx = findFirstVisibleNoteIndex(track.notes, leftEdgeTime - scaledOverflow);

      for (let ni = startIdx; ni < track.notes.length; ni++) {
        const note = track.notes[ni];
        const noteStart = note.time;
        const noteEnd = note.time + note.duration;

        // Notes are sorted by time; if start exceeds right edge, all remaining are off-screen
        if (noteStart > rightEdgeTime + scaledOverflow) break;

        if (!isNoteInViewRange(note.midi)) continue;

        const x = timeToX(noteStart, track.config.scale);
        const rawNoteWidth = timeToX(noteEnd, track.config.scale) - x;
        const baseNoteHeight = Math.max(height / 127, cfg.noteHeight);
        const verticalMargin = cfg.noteVerticalMargin;
        const noteHeight = Math.max(0, baseNoteHeight - verticalMargin * 2) * track.config.scale;

        const noteMargin = cfg.noteMargin;
        let noteWidth;
        if (track.config.staccato) {
          noteWidth = noteHeight;
        } else {
          noteWidth = Math.max(0, rawNoteWidth - noteMargin * 2);
        }

        const y = noteToY(note.midi, height, cfg) + verticalMargin;

        const noteKey = note.id;
        const touchEnd = noteStart + (noteWidth + PLAYHEAD_TOUCH_SLACK_PX) / pxPerSecond;
        const isTouchingPlayhead = currentTime > noteStart && currentTime < touchEnd;
        const wasNotTouchingPlayhead = !noteFlashStates.has(noteKey);

        // Draw note with effects
        ctx.fillStyle = track.config.color;
        ctx.globalAlpha = track.config.opacity;

        const pressOffset = cfg.showNotePressEffect
          ? -computePressOffset(
              noteStart,
              touchEnd,
              cfg.pressAnimationDuration,
              cfg.notePressDepth,
              currentTime,
            )
          : 0;

        if (cfg.showNoteFlash && isTouchingPlayhead && wasNotTouchingPlayhead) {
          noteFlashStates.set(noteKey, {
            noteStart: currentTime,
            color: track.config.color,
            isDurationMode: cfg.noteFlashMode === "duration",
            hasCompleted: false,
            wasTouchingPlayhead: true,
          });
        }

        const flashState = noteFlashStates.get(noteKey);
        if (flashState) {
          const fadeOutDuration = cfg.noteFlashFadeOutDuration;
          const flashDuration = cfg.noteFlashDuration;
          const timeSinceStart = currentTime - flashState.noteStart;

          let intensity = 0;

          if (cfg.noteFlashMode === "on") {
            if (isTouchingPlayhead) {
              intensity = cfg.noteFlashIntensity;
              flashState.noteStart = currentTime; // Reset fade out timer while touching
            } else {
              // Fade out
              const fadeProgress = Math.min(1, timeSinceStart / fadeOutDuration);
              intensity = cfg.noteFlashIntensity * (1 - fadeProgress);
            }
          } else {
            // duration mode
            if (!flashState.hasCompleted) {
              const progress = Math.min(1, timeSinceStart / flashDuration);
              intensity = cfg.noteFlashIntensity * (1 - progress);

              if (progress >= 1) {
                flashState.hasCompleted = true;
              }
            }
          }

          if (intensity > 0) {
            ctx.fillStyle = brightenHexColor(track.config.color, intensity);
          }

          // Update touch state
          if (isTouchingPlayhead !== flashState.wasTouchingPlayhead) {
            flashState.wasTouchingPlayhead = isTouchingPlayhead;
            if (!isTouchingPlayhead) {
              flashState.noteStart = currentTime; // Start fade out timer
            }
          }

          // Remove effect if fade out is complete
          if (!isTouchingPlayhead && timeSinceStart >= fadeOutDuration) {
            noteFlashStates.delete(noteKey);
          }
        }

        if (cfg.showRoughEdge) {
          const roughSeed = note.time * 1000 + note.midi;
          drawRoughRect(
            ctx,
            x + noteMargin,
            y - pressOffset,
            noteWidth,
            noteHeight,
            cfg.noteCornerRadius,
            cfg.roughEdgeIntensity,
            cfg.roughEdgeSegmentLength,
            roughSeed,
          );
        } else {
          ctx.beginPath();
          ctx.roundRect(
            x + noteMargin,
            y - pressOffset,
            noteWidth,
            noteHeight,
            cfg.noteCornerRadius,
          );
        }
        ctx.fill();

        if (cfg.showNoiseTexture) {
          const noteSeed = note.time * 1000 + note.midi;
          noiseTextureRenderer.apply(track.config.color, x + noteMargin, y - pressOffset, noteSeed);
        }

        const velocityAlpha = note.velocity / 127;
        ctx.fillStyle = `rgba(255, 255, 255, ${velocityAlpha * 0.3})`;
        ctx.fill();
        ctx.globalAlpha = 1;

        if (
          cfg.showRippleEffect &&
          isTouchingPlayhead &&
          wasNotTouchingPlayhead &&
          !rippleStates.has(noteKey)
        ) {
          rippleStates.set(noteKey, {
            noteStart: noteStart,
            noteEnd: noteEnd,
            x: playheadX,
            y: y - pressOffset + noteHeight / 2,
            color: cfg.useCustomRippleColor ? cfg.rippleColor : track.config.color,
          });
        }
      }

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }

    rippleStates.forEach((state, noteKey) => {
      const rippleProgress = Math.min(1, (currentTime - state.noteStart) / cfg.rippleDuration);
      const radius = Math.max(0, cfg.rippleRadius * rippleProgress);
      const alpha = 0.4 * (1 - rippleProgress);
      drawRipple(ctx, state.x, state.y, radius, state.color, alpha);

      if (currentTime >= state.noteStart + cfg.rippleDuration) {
        rippleStates.delete(noteKey);
      }
    });

    ctx.beginPath();
    if (cfg.showPlayhead) {
      ctx.save();
      ctx.strokeStyle = cfg.playheadColor;
      ctx.globalAlpha = cfg.playheadOpacity;
      ctx.lineWidth = cfg.playheadWidth;
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
      ctx.restore();
    }
  };
};
