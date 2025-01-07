import { Renderer } from "../types/renderer";
import { MidiTrack } from "../types/midi";
import { PlaybackState } from "@/types/player";

export class PianoRollRenderer extends Renderer {
  private readonly timeWindow = 5;

  private readonly overflowFactor = 0.5;

  private noteToY(midi: number) {
    const {
      canvas: { height },
    } = this.ctx;
    return height * ((127 - midi) / 127);
  }
  render(tracks: MidiTrack[], playbackState: PlaybackState) {
    this.clear();
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
      });

      this.ctx.shadowColor = "transparent";
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetY = 0;
    });

    const playheadX = width * 0.2;
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
}
