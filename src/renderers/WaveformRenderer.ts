import { Renderer } from "../types/renderer";
import { MidiTrack } from "../types/midi";
import { PlaybackState } from "../types/player";

export class WaveformRenderer extends Renderer {
  render(tracks: MidiTrack[], playbackState: PlaybackState) {
    this.clear();
    const {
      canvas: { width, height },
    } = this.ctx;
    this.ctx.strokeStyle = "#2196f3";
    this.ctx.lineWidth = 2;

    tracks.forEach((track) => {
      this.ctx.beginPath();

      track.notes.forEach((note, i) => {
        const x = (note.time / playbackState.duration) * width;
        const y = height - ((note.midi - 21) / 88) * height;

        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      });

      this.ctx.stroke();
    });

    const playheadX =
      (playbackState.currentTime / playbackState.duration) * width;
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#ff4081";
    this.ctx.moveTo(playheadX, 0);
    this.ctx.lineTo(playheadX, height);
    this.ctx.stroke();
  }
}
