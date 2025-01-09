import { Renderer } from "./Renderer";
import { MidiTrack } from "../types/midi";
import { PlaybackState } from "../types/player";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

export class ParticlesRenderer extends Renderer {
  private particles: Particle[] = [];

  private createParticle(note: number, velocity: number): Particle {
    const {
      canvas: { width, height },
    } = this.ctx;
    const y = height - ((note - 21) / 88) * height;

    return {
      x: width * 0.1,
      y,
      vx: (Math.random() * 2 + 2) * (velocity / 127),
      vy: (Math.random() - 0.5) * 2,
      radius: Math.random() * 3 + 2,
      color: `hsl(${note * 2}, 70%, 50%)`,
      life: 1.0,
      maxLife: 1.0,
    };
  }

  render(tracks: MidiTrack[], playbackState: PlaybackState) {
    this.clear();

    tracks.forEach((track) => {
      const currentNotes = track.notes.filter((note) => {
        const noteStart = note.time;
        const noteEnd = note.time + note.duration;
        return (
          playbackState.currentTime >= noteStart &&
          playbackState.currentTime <= noteEnd
        );
      });

      currentNotes.forEach((note) => {
        this.particles.push(this.createParticle(note.midi, note.velocity));
      });
    });

    this.particles = this.particles.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.01;

      if (particle.life <= 0) return false;

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color.replace(")", `, ${particle.life})`);
      this.ctx.fill();

      return true;
    });
  }
}
