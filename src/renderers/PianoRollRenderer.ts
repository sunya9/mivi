import { Renderer } from "./Renderer";
import { MidiTrack } from "../types/midi";
import { PlaybackState } from "@/types/player";
import { RendererConfig, RendererContext } from "../types/renderer";

export class PianoRollRenderer extends Renderer {
  private readonly overflowFactor = 0.5;

  private readonly rippleRadius = 50;

  private readonly minRippleDuration = 0.3;

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
    }
  >();

  constructor(
    ctx: RendererContext,
    readonly config: RendererConfig,
  ) {
    super(ctx, config);
  }

  private noteToY(midi: number) {
    const {
      canvas: { height },
    } = this.ctx;
    const noteHeight = Math.max(
      height / 127,
      this.config.pianoRollConfig.noteHeight,
    );

    // 表示範囲の計算
    const viewRangeTop = this.config.pianoRollConfig.viewRangeTop;
    const viewRangeBottom = this.config.pianoRollConfig.viewRangeBottom;
    const viewRangeSize = viewRangeTop - viewRangeBottom;

    // 表示範囲内でのY座標を計算
    return height * ((viewRangeTop - midi) / viewRangeSize) - noteHeight / 2;
  }
  render(tracks: MidiTrack[], playbackState: PlaybackState) {
    const currentTime = playbackState.currentTime;

    if (currentTime < this.lastCurrentTime) {
      this.rippleStates.clear();
      this.noteFlashStates.clear();
    }
    this.lastCurrentTime = currentTime;

    this.renderCommonVisual();
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

    const timeToX = (time: number) => {
      return (
        width * ((time - startTime) / this.config.pianoRollConfig.timeWindow)
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

        const x = timeToX(noteStart);
        const rawNoteWidth = timeToX(noteEnd) - x;
        const baseNoteHeight = Math.max(
          height / 127,
          this.config.pianoRollConfig.noteHeight,
        );
        const verticalMargin = this.config.pianoRollConfig.noteVerticalMargin;
        const noteHeight = Math.max(0, baseNoteHeight - verticalMargin * 2);

        const noteMargin = this.config.pianoRollConfig.noteMargin;
        const noteWidth = Math.max(0, rawNoteWidth - noteMargin * 2);

        const y = this.noteToY(note.midi) + verticalMargin;

        const noteKey = `${track.id}-${note.time}-${note.midi}`;
        const isTouchingPlayhead =
          Math.abs(x - playheadX) < noteWidth + 20 && playheadX > x;
        const wasNotTouchingPlayhead = !this.noteFlashStates.has(noteKey);

        // Draw note with flash effect
        this.ctx.fillStyle = track.config.color;
        this.ctx.globalAlpha = track.config.opacity;
        if (
          this.config.pianoRollConfig.showNoteFlash &&
          isTouchingPlayhead &&
          wasNotTouchingPlayhead &&
          !this.noteFlashStates.has(noteKey)
        ) {
          this.noteFlashStates.set(noteKey, {
            noteStart: currentTime,
            color: track.config.color,
          });
        }

        const flashState = this.noteFlashStates.get(noteKey);
        if (flashState) {
          const flashProgress = Math.min(
            1,
            (currentTime - flashState.noteStart) /
              this.config.pianoRollConfig.noteFlashDuration,
          );
          const flashIntensity =
            (1 - flashProgress) *
            this.config.pianoRollConfig.noteFlashIntensity;
          if (flashIntensity > 0) {
            this.ctx.fillStyle = this.adjustColorBrightness(
              track.config.color,
              flashIntensity,
            );
          }
        }

        this.ctx.beginPath();
        this.ctx.roundRect(
          x + noteMargin,
          y,
          noteWidth,
          noteHeight,
          this.config.pianoRollConfig.noteCornerRadius,
        );
        this.ctx.fill();

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
            y: y + noteHeight / 2,
            color: track.config.color,
          });
        }
      });

      this.ctx.shadowColor = "transparent";
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetY = 0;
    });

    this.rippleStates.forEach((state, noteKey) => {
      const noteDuration = state.noteEnd - state.noteStart;
      const normalizedProgress = Math.min(
        1,
        (currentTime - state.noteStart) / (state.noteEnd - state.noteStart),
      );

      const radiusProgress =
        noteDuration < this.minRippleDuration
          ? Math.min(normalizedProgress, noteDuration / this.minRippleDuration)
          : normalizedProgress;

      this.drawRippleEffect(
        state.x,
        state.y,
        state.color,
        radiusProgress,
        normalizedProgress,
      );

      if (currentTime >= state.noteEnd) {
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
      const radius = Math.max(0, this.rippleRadius * radiusProgress);
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
}
