import { Renderer } from "./Renderer";
import { MidiTrack } from "../types/midi";
import { PlaybackState } from "@/types/player";

export class PianoRollRenderer extends Renderer {
  private readonly timeWindow = 5;

  private readonly overflowFactor = 0.5;

  private readonly rippleRadius = 100;

  private rippleStates = new Map<
    string,
    {
      startTime: number;
      isPlaying: boolean;
      x: number;
      y: number;
      color: string;
    }
  >();

  private noteToY(midi: number) {
    const {
      canvas: { height },
    } = this.ctx;
    return height * ((127 - midi) / 127);
  }
  render(tracks: MidiTrack[], playbackState: PlaybackState) {
    this.clear();
    this.ctx.fillStyle = "rgba(200, 200, 200, 0.1)";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    const {
      canvas: { width, height },
    } = this.ctx;

    const currentTime = playbackState.currentTime;

    const startTime = currentTime - this.timeWindow * 0.2;
    const endTime = startTime + this.timeWindow * (1 + this.overflowFactor);

    const timeToX = (time: number) => {
      return width * ((time - startTime) / this.timeWindow);
    };

    this.drawGrid(startTime, endTime, width, height);

    const playheadX = width * 0.2;

    tracks.forEach((track) => {
      if (!track.settings.visible) return;

      track.notes.forEach((note) => {
        const noteStart = note.time;
        const noteEnd = note.time + note.duration;

        if (
          noteEnd < startTime - this.timeWindow * this.overflowFactor ||
          noteStart > endTime + this.timeWindow * this.overflowFactor
        )
          return;

        const x = timeToX(noteStart);
        const noteWidth = timeToX(noteEnd) - x;
        const y = this.noteToY(note.midi);
        const noteHeight = Math.max(height / 127, 4);

        this.ctx.fillStyle = track.settings.color;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, noteWidth, noteHeight);
        this.ctx.fill();

        const velocityAlpha = note.velocity / 127;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${velocityAlpha * 0.3})`;
        this.ctx.fill();

        const noteKey = `${track.id}-${note.time}-${note.midi}`;
        const isTouchingPlayhead =
          Math.abs(x - playheadX) < noteWidth + 20 && playheadX > x;
        const rippleState = this.rippleStates.get(noteKey);

        if (isTouchingPlayhead) {
          if (!rippleState) {
            this.rippleStates.set(noteKey, {
              startTime: currentTime,
              isPlaying: true,
              x: playheadX,
              y: y + noteHeight / 2,
              color: track.settings.color,
            });
          }
        }
      });

      this.ctx.shadowColor = "transparent";
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetY = 0;
    });

    this.rippleStates.forEach((state, noteKey) => {
      const elapsedTime = currentTime - state.startTime;
      const progress = Math.min(elapsedTime, 2.0);

      this.drawRippleEffect(state.x, state.y, state.color, progress);

      if (progress >= 1.0 && !state.isPlaying) {
        this.rippleStates.delete(noteKey);
      }
    });

    this.ctx.beginPath();
    this.ctx.strokeStyle = "#ff4081";
    this.ctx.lineWidth = 2;
    this.ctx.moveTo(playheadX, 0);
    this.ctx.lineTo(playheadX, height);
    this.ctx.stroke();
  }

  private drawGrid(
    startTime: number,
    endTime: number,
    width: number,
    height: number,
  ) {
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    this.ctx.lineWidth = 1;

    const beatInterval = 0.5;
    for (
      let time = Math.ceil(startTime / beatInterval) * beatInterval;
      time <= endTime;
      time += beatInterval
    ) {
      const x = width * ((time - startTime) / this.timeWindow);
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    for (let midi = 0; midi <= 127; midi += 12) {
      const y = this.noteToY(midi);
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
  }

  private drawRippleEffect(
    x: number,
    y: number,
    color: string,
    elapsedTime: number,
  ) {
    const maxRipples = 1;
    const rippleDuration = 0.5;
    const fadeOutStart = 0.3;

    for (let i = 0; i < maxRipples; i++) {
      const rippleProgress = Math.min(
        1,
        (elapsedTime + i * 0.3) / rippleDuration,
      );
      const radius = this.rippleRadius * (rippleProgress * 0.7);

      let fadeOutProgress = 0;
      if (elapsedTime > fadeOutStart) {
        fadeOutProgress = Math.min(
          1,
          (elapsedTime - fadeOutStart) / (rippleDuration - fadeOutStart),
        );
      }
      const alpha = 0.7 * (1 - fadeOutProgress);

      if (alpha <= 0) continue;

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.strokeStyle = color;
      this.ctx.globalAlpha = alpha;
      this.ctx.stroke();
      this.ctx.fill();
      this.ctx.restore();
    }
  }
}
