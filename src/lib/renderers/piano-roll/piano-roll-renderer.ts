import { MidiTrack } from "@/lib/midi/midi";
import { Renderer, RendererConfig } from "../renderer";

export class PianoRollRenderer extends Renderer {
  private readonly overflowFactor = 0.5;

  private lastCurrentTime: number = 0;

  private rippleStates = new Map<
    string,
    {
      noteStart: number;
      noteEnd: number;
      x: number;
      y: number;
      color: string;
    }
  >();

  private noteFlashStates = new Map<
    string,
    {
      noteStart: number;
      color: string;
      isDurationMode: boolean;
      hasCompleted: boolean;
      wasTouchingPlayhead: boolean;
    }
  >();

  private pressStates = new Map<
    string,
    {
      startTime: number;
      isPressed: boolean;
    }
  >();

  private noisePatternLight: CanvasPattern | null = null;
  private noisePatternDark: CanvasPattern | null = null;
  private cachedNoiseIntensity: number = 0;
  private cachedNoiseGrainSize: number = 0;
  private cachedNoiseColorVariance: number = 0;

  constructor(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    config: RendererConfig,
    backgroundImageBitmap?: ImageBitmap,
  ) {
    super(ctx, config, backgroundImageBitmap);
  }

  private noteToY(midi: number) {
    const {
      canvas: { height },
    } = this.ctx;
    const noteHeight = Math.max(
      height / 127,
      this.config.pianoRollConfig.noteHeight,
    );

    const viewRangeTop = this.config.pianoRollConfig.viewRangeTop;
    const viewRangeBottom = this.config.pianoRollConfig.viewRangeBottom;
    const viewRangeSize = viewRangeTop - viewRangeBottom;

    return height * ((viewRangeTop - midi) / viewRangeSize) - noteHeight / 2;
  }
  render(tracks: MidiTrack[], currentTime: number) {
    if (currentTime < this.lastCurrentTime) {
      this.rippleStates.clear();
      this.noteFlashStates.clear();
      this.pressStates.clear();
    }
    this.lastCurrentTime = currentTime;

    this.renderCommonVisual();
    this.ensureNoisePattern();
    const {
      canvas: { width, height },
    } = this.ctx;

    const isNoteInViewRange = (midi: number) => {
      const viewRangeTop = this.config.pianoRollConfig.viewRangeTop;
      const viewRangeBottom = this.config.pianoRollConfig.viewRangeBottom;
      return midi <= viewRangeTop && midi >= viewRangeBottom;
    };

    const playheadPosition = this.config.pianoRollConfig.playheadPosition / 100;
    const playheadX = width * playheadPosition;

    const startTime =
      currentTime - this.config.pianoRollConfig.timeWindow * playheadPosition;
    const endTime = startTime + this.config.pianoRollConfig.timeWindow;

    const timeToX = (time: number, scale: number = 1) => {
      const timeFromPlayhead = time - currentTime;
      const scaledTimeFromPlayhead = timeFromPlayhead * scale;
      const adjustedTime = currentTime + scaledTimeFromPlayhead;

      return (
        width *
        ((adjustedTime - startTime) / this.config.pianoRollConfig.timeWindow)
      );
    };

    tracks.forEach((track) => {
      if (!track.config.visible) return;

      track.notes.forEach((note) => {
        const noteStart = note.time;
        const noteEnd = note.time + note.duration;

        if (
          noteEnd <
            startTime -
              this.config.pianoRollConfig.timeWindow * this.overflowFactor ||
          noteStart >
            endTime +
              this.config.pianoRollConfig.timeWindow * this.overflowFactor ||
          !isNoteInViewRange(note.midi)
        )
          return;

        const x = timeToX(noteStart, track.config.scale);
        const rawNoteWidth = timeToX(noteEnd, track.config.scale) - x;
        const baseNoteHeight = Math.max(
          height / 127,
          this.config.pianoRollConfig.noteHeight,
        );
        const verticalMargin = this.config.pianoRollConfig.noteVerticalMargin;
        const noteHeight =
          Math.max(0, baseNoteHeight - verticalMargin * 2) * track.config.scale;

        const noteMargin = this.config.pianoRollConfig.noteMargin;
        let noteWidth;
        if (track.config.staccato) {
          noteWidth = noteHeight;
        } else {
          noteWidth = Math.max(0, rawNoteWidth - noteMargin * 2);
        }

        const y = this.noteToY(note.midi) + verticalMargin;

        const noteKey = `${track.id}-${note.time}-${note.midi}`;
        const isTouchingPlayhead =
          Math.abs(x - playheadX) < noteWidth + 20 && playheadX > x;
        const wasNotTouchingPlayhead = !this.noteFlashStates.has(noteKey);

        // Update press state
        if (!this.pressStates.has(noteKey)) {
          this.pressStates.set(noteKey, {
            startTime: currentTime,
            isPressed: isTouchingPlayhead,
          });
        } else if (
          this.pressStates.get(noteKey)!.isPressed !== isTouchingPlayhead
        ) {
          this.pressStates.set(noteKey, {
            startTime: currentTime,
            isPressed: isTouchingPlayhead,
          });
        }

        // Draw note with effects
        this.ctx.fillStyle = track.config.color;
        this.ctx.globalAlpha = track.config.opacity;

        // Calculate press offset with animation
        let pressOffset = 0;
        if (this.config.pianoRollConfig.showNotePressEffect) {
          const pressState = this.pressStates.get(noteKey)!;
          const pressProgress = Math.min(
            1,
            (currentTime - pressState.startTime) /
              this.config.pianoRollConfig.pressAnimationDuration,
          );
          const targetOffset = this.config.pianoRollConfig.notePressDepth;
          const currentOffset = pressState.isPressed
            ? pressProgress * targetOffset
            : targetOffset * (1 - pressProgress);
          pressOffset = -currentOffset;
        }

        if (
          this.config.pianoRollConfig.showNoteFlash &&
          isTouchingPlayhead &&
          wasNotTouchingPlayhead
        ) {
          this.noteFlashStates.set(noteKey, {
            noteStart: currentTime,
            color: track.config.color,
            isDurationMode:
              this.config.pianoRollConfig.noteFlashMode === "duration",
            hasCompleted: false,
            wasTouchingPlayhead: true,
          });
        }

        const flashState = this.noteFlashStates.get(noteKey);
        if (flashState) {
          const fadeOutDuration =
            this.config.pianoRollConfig.noteFlashFadeOutDuration;
          const flashDuration = this.config.pianoRollConfig.noteFlashDuration;
          const timeSinceStart = currentTime - flashState.noteStart;

          let intensity = 0;

          if (this.config.pianoRollConfig.noteFlashMode === "on") {
            if (isTouchingPlayhead) {
              intensity = this.config.pianoRollConfig.noteFlashIntensity;
              flashState.noteStart = currentTime; // Reset fade out timer while touching
            } else {
              // Fade out
              const fadeProgress = Math.min(
                1,
                timeSinceStart / fadeOutDuration,
              );
              intensity =
                this.config.pianoRollConfig.noteFlashIntensity *
                (1 - fadeProgress);
            }
          } else {
            // duration mode
            if (!flashState.hasCompleted) {
              const progress = Math.min(1, timeSinceStart / flashDuration);
              intensity =
                this.config.pianoRollConfig.noteFlashIntensity * (1 - progress);

              if (progress >= 1) {
                flashState.hasCompleted = true;
              }
            }
          }

          if (intensity > 0) {
            this.ctx.fillStyle = this.adjustColorBrightness(
              track.config.color,
              intensity,
            );
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
            this.noteFlashStates.delete(noteKey);
          }
        }

        if (this.config.pianoRollConfig.showRoughEdge) {
          const roughSeed = note.time * 1000 + note.midi;
          this.drawRoughRect(
            x + noteMargin,
            y - pressOffset,
            noteWidth,
            noteHeight,
            this.config.pianoRollConfig.noteCornerRadius,
            this.config.pianoRollConfig.roughEdgeIntensity,
            this.config.pianoRollConfig.roughEdgeSegmentLength,
            roughSeed,
          );
        } else {
          this.ctx.beginPath();
          this.ctx.roundRect(
            x + noteMargin,
            y - pressOffset,
            noteWidth,
            noteHeight,
            this.config.pianoRollConfig.noteCornerRadius,
          );
        }
        this.ctx.fill();

        if (this.config.pianoRollConfig.showNoiseTexture) {
          // Choose dark noise for light colors, light noise for dark colors
          const luminance = this.getColorLuminance(track.config.color);
          const noisePattern =
            luminance > 0.5 ? this.noisePatternDark : this.noisePatternLight;

          if (noisePattern) {
            this.ctx.save();
            // Use source-atop to blend noise only on the note (not background)
            this.ctx.globalCompositeOperation = "source-atop";
            // Generate unique offset per note for pattern variation
            const noteSeed = note.time * 1000 + note.midi;
            const uniqueOffsetX = this.seededRandom(noteSeed) * 256;
            const uniqueOffsetY = this.seededRandom(noteSeed + 12345) * 256;
            // Transform the pattern itself to move with the note
            noisePattern.setTransform(
              new DOMMatrix().translate(
                x + noteMargin + uniqueOffsetX,
                y - pressOffset + uniqueOffsetY,
              ),
            );
            this.ctx.fillStyle = noisePattern;
            this.ctx.fill();
            this.ctx.restore();
          }
        }

        const velocityAlpha = note.velocity / 127;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${velocityAlpha * 0.3})`;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;

        if (
          this.config.pianoRollConfig.showRippleEffect &&
          isTouchingPlayhead &&
          wasNotTouchingPlayhead &&
          !this.rippleStates.has(noteKey)
        ) {
          this.rippleStates.set(noteKey, {
            noteStart: noteStart,
            noteEnd: noteEnd,
            x: playheadX,
            y: y - pressOffset + noteHeight / 2,
            color: this.config.pianoRollConfig.useCustomRippleColor
              ? this.config.pianoRollConfig.rippleColor
              : track.config.color,
          });
        }
      });

      this.ctx.shadowColor = "transparent";
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetY = 0;
    });

    this.rippleStates.forEach((state, noteKey) => {
      const rippleProgress = Math.min(
        1,
        (currentTime - state.noteStart) /
          this.config.pianoRollConfig.rippleDuration,
      );

      this.drawRippleEffect(
        state.x,
        state.y,
        state.color,
        rippleProgress,
        rippleProgress,
      );

      if (
        currentTime >=
        state.noteStart + this.config.pianoRollConfig.rippleDuration
      ) {
        this.rippleStates.delete(noteKey);
      }
    });

    this.ctx.beginPath();
    if (this.config.pianoRollConfig.showPlayhead) {
      this.ctx.save();
      this.ctx.strokeStyle = this.config.pianoRollConfig.playheadColor;
      this.ctx.globalAlpha = this.config.pianoRollConfig.playheadOpacity;
      this.ctx.lineWidth = this.config.pianoRollConfig.playheadWidth;
      this.ctx.moveTo(playheadX, 0);
      this.ctx.lineTo(playheadX, height);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private drawRippleEffect(
    x: number,
    y: number,
    color: string,
    radiusProgress: number,
    fadeProgress: number,
  ) {
    const maxRipples = 1;

    for (let i = 0; i < maxRipples; i++) {
      const radius = Math.max(
        0,
        this.config.pianoRollConfig.rippleRadius * radiusProgress,
      );
      const alpha = 0.4 * (1 - fadeProgress);

      if (alpha <= 0) return;

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = alpha;
      this.ctx.stroke();
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  private adjustColorBrightness(color: string, intensity: number): string {
    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Brighten the color
    const brightenValue = intensity * 255;
    const newR = Math.min(255, r + brightenValue);
    const newG = Math.min(255, g + brightenValue);
    const newB = Math.min(255, b + brightenValue);

    return `rgb(${newR}, ${newG}, ${newB})`;
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  private generateNoisePattern(
    intensity: number,
    grainSize: number,
    colorVariance: number,
    dark: boolean,
  ): CanvasPattern | null {
    const size = 256;
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    const colorValue = dark ? 0 : 255;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const grainX = Math.floor(x / grainSize);
        const grainY = Math.floor(y / grainSize);
        const grainIndex = grainY * Math.ceil(size / grainSize) + grainX;

        // Generate subtle alpha noise for crayon-like effect
        const noiseAlpha =
          this.seededRandom(grainIndex) * intensity * colorVariance;

        const i = (y * size + x) * 4;
        data[i] = colorValue;
        data[i + 1] = colorValue;
        data[i + 2] = colorValue;
        data[i + 3] = Math.floor(noiseAlpha);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return this.ctx.createPattern(canvas, "repeat");
  }

  private getColorLuminance(hexColor: string): number {
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  private drawRoughRect(
    x: number,
    y: number,
    width: number,
    height: number,
    cornerRadius: number,
    intensity: number,
    segmentLength: number,
    seed: number,
  ): void {
    const cr = Math.min(cornerRadius, width / 2, height / 2);

    this.ctx.beginPath();

    // Top edge (left to right)
    this.ctx.moveTo(x + cr, y + this.getRoughOffset(seed, 0, intensity));
    const topSegments = Math.ceil((width - cr * 2) / segmentLength);
    for (let i = 1; i <= topSegments; i++) {
      const px = x + cr + ((width - cr * 2) * i) / topSegments;
      const py = y + this.getRoughOffset(seed, i, intensity);
      this.ctx.lineTo(px, py);
    }

    // Top-right corner (no offset on arcTo control points)
    this.ctx.arcTo(x + width, y, x + width, y + cr, cr);

    // Right edge (top to bottom)
    const rightSegments = Math.ceil((height - cr * 2) / segmentLength);
    for (let i = 1; i <= rightSegments; i++) {
      const px = x + width + this.getRoughOffset(seed, 200 + i, intensity);
      const py = y + cr + ((height - cr * 2) * i) / rightSegments;
      this.ctx.lineTo(px, py);
    }

    // Bottom-right corner
    this.ctx.arcTo(x + width, y + height, x + width - cr, y + height, cr);

    // Bottom edge (right to left)
    const bottomSegments = Math.ceil((width - cr * 2) / segmentLength);
    for (let i = 1; i <= bottomSegments; i++) {
      const px = x + width - cr - ((width - cr * 2) * i) / bottomSegments;
      const py = y + height + this.getRoughOffset(seed, 400 + i, intensity);
      this.ctx.lineTo(px, py);
    }

    // Bottom-left corner
    this.ctx.arcTo(x, y + height, x, y + height - cr, cr);

    // Left edge (bottom to top)
    const leftSegments = Math.ceil((height - cr * 2) / segmentLength);
    for (let i = 1; i <= leftSegments; i++) {
      const px = x + this.getRoughOffset(seed, 600 + i, intensity);
      const py = y + height - cr - ((height - cr * 2) * i) / leftSegments;
      this.ctx.lineTo(px, py);
    }

    // Top-left corner
    this.ctx.arcTo(x, y, x + cr, y, cr);

    this.ctx.closePath();
  }

  private getRoughOffset(
    seed: number,
    index: number,
    intensity: number,
  ): number {
    return (this.seededRandom(seed + index * 7.31) - 0.5) * 2 * intensity;
  }

  private ensureNoisePattern(): void {
    const {
      showNoiseTexture,
      noiseIntensity,
      noiseGrainSize,
      noiseColorVariance,
    } = this.config.pianoRollConfig;

    if (!showNoiseTexture) {
      this.noisePatternLight = null;
      this.noisePatternDark = null;
      this.cachedNoiseIntensity = 0;
      this.cachedNoiseGrainSize = 0;
      this.cachedNoiseColorVariance = 0;
      return;
    }

    if (
      this.cachedNoiseIntensity !== noiseIntensity ||
      this.cachedNoiseGrainSize !== noiseGrainSize ||
      this.cachedNoiseColorVariance !== noiseColorVariance ||
      this.noisePatternLight === null ||
      this.noisePatternDark === null
    ) {
      this.noisePatternLight = this.generateNoisePattern(
        noiseIntensity,
        noiseGrainSize,
        noiseColorVariance,
        false,
      );
      this.noisePatternDark = this.generateNoisePattern(
        noiseIntensity,
        noiseGrainSize,
        noiseColorVariance,
        true,
      );
      this.cachedNoiseIntensity = noiseIntensity;
      this.cachedNoiseGrainSize = noiseGrainSize;
      this.cachedNoiseColorVariance = noiseColorVariance;
    }
  }
}
