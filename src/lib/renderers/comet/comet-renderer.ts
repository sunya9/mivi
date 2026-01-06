import { MidiTrack } from "@/lib/midi/midi";
import { Renderer, RendererConfig } from "../renderer";

interface CometParticle {
  x: number;
  y: number;
  startTime: number;
  endTime: number;
  color: string;
  velocity: number;
  trackScale: number;
  spacingOffset: number;
  angleOffset: number;
}

interface CometTrail {
  positions: Array<{ x: number; y: number; timestamp: number }>;
  color: string;
  alpha: number;
}

export class CometRenderer extends Renderer {
  private activeComets = new Map<string, CometParticle>();
  private lastCurrentTime: number = 0;
  private cometAngleOffsets = new Map<string, number>();

  constructor(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    config: RendererConfig,
    backgroundImageBitmap?: ImageBitmap,
  ) {
    super(ctx, config, backgroundImageBitmap);
  }

  render(tracks: MidiTrack[], currentTime: number) {
    if (currentTime < this.lastCurrentTime) {
      this.activeComets.clear();
      this.cometAngleOffsets.clear();
    }
    this.lastCurrentTime = currentTime;

    this.renderCommonVisual();

    const {
      canvas: { width, height },
    } = this.ctx;

    const { cometConfig } = this.config;

    const isNoteInViewRange = (midi: number) => {
      const viewRangeTop = cometConfig.viewRangeTop;
      const viewRangeBottom = cometConfig.viewRangeBottom;
      return midi <= viewRangeTop && midi >= viewRangeBottom;
    };

    // Process tracks and notes
    tracks.forEach((track) => {
      if (!track.config.visible) return;

      track.notes.forEach((note) => {
        const cometKey = `${track.id}-${note.time}-${note.midi}`;

        // Check if note should trigger a comet
        if (
          currentTime >= note.time &&
          currentTime <= note.time + note.duration &&
          !this.activeComets.has(cometKey) &&
          isNoteInViewRange(note.midi)
        ) {
          // Calculate angle offset for this comet if not exists
          if (!this.cometAngleOffsets.has(cometKey)) {
            // Create deterministic angle offset based on note properties
            const pseudoRandomAngle =
              ((note.time * 54321 + note.midi * 98765) % 1000) / 1000 - 0.5;
            const randomAngleOffset =
              pseudoRandomAngle * 2 * cometConfig.angleRandomness;
            this.cometAngleOffsets.set(cometKey, randomAngleOffset);
          }

          const angleOffset = this.cometAngleOffsets.get(cometKey)!;

          // Calculate comet position based on MIDI note
          const noteRange =
            cometConfig.viewRangeTop - cometConfig.viewRangeBottom;
          // Invert normalizedMidi so high notes (high MIDI values) are at the top (low Y values)
          const normalizedMidi =
            1 - (note.midi - cometConfig.viewRangeBottom) / noteRange;

          // Start position based on startPosition settings
          const baseStartX = width * (cometConfig.startPositionX / 100);
          const baseStartY = height * (cometConfig.startPositionY / 100);

          // Apply spacing margin between notes - use deterministic offset based on note properties
          // Calculate spacing along the comet's movement direction (angle-aware)
          const finalAngle = cometConfig.fallAngle + angleOffset;
          const angleRad = (finalAngle * Math.PI) / 180;

          // Create a hash from note time and midi to ensure consistent spacing
          const noteHash = (note.time * 1000 + note.midi) % 100; // Simple hash function
          let spacingDistance = noteHash * cometConfig.spacingMargin * 0.1;

          // Apply reverse stacking logic - invert from previous implementation
          // When reverseStacking is OFF (false), we use positive spacing (reversed from before)
          // When reverseStacking is ON (true), we use negative spacing
          if (cometConfig.reverseStacking) {
            spacingDistance = -spacingDistance; // Apply negative spacing when reversed
          }

          // Apply spacing along the perpendicular direction to the fall angle
          // This creates spacing between parallel comet trajectories
          const perpendicularAngle = angleRad + Math.PI / 2; // 90 degrees offset
          const spacingOffsetX = Math.cos(perpendicularAngle) * spacingDistance;
          const spacingOffsetY = Math.sin(perpendicularAngle) * spacingDistance;

          // Create deterministic "random" offset based on note properties
          const pseudoRandom =
            ((note.time * 12345 + note.midi * 67890) % 1000) / 1000 - 0.5;
          const randomOffset = pseudoRandom * cometConfig.spacingRandomness;
          const randomOffsetX = Math.cos(perpendicularAngle) * randomOffset;
          const randomOffsetY = Math.sin(perpendicularAngle) * randomOffset;

          const startX = baseStartX + spacingOffsetX + randomOffsetX;
          const startY =
            baseStartY +
            normalizedMidi * height * 0.2 +
            spacingOffsetY +
            randomOffsetY;

          // Create comet particle with proper duration timing
          this.activeComets.set(cometKey, {
            x: startX,
            y: startY,
            startTime: note.time,
            endTime: note.time + cometConfig.fallDuration,
            color: track.config.color,
            velocity: note.velocity,
            trackScale: track.config.scale,
            spacingOffset: spacingDistance + randomOffset,
            angleOffset: angleOffset,
          });
        }
      });
    });

    // Update and render active comets
    this.activeComets.forEach((comet, key) => {
      // Skip if comet hasn't started yet
      if (currentTime < comet.startTime) return;

      const totalDuration = comet.endTime - comet.startTime;
      const progress = Math.min(
        1.0,
        (currentTime - comet.startTime) / totalDuration,
      );

      if (progress >= 1.0) {
        // Start fade out
        const fadeProgress = Math.min(
          1.0,
          (currentTime - comet.endTime) / cometConfig.fadeOutDuration,
        );
        if (fadeProgress >= 1.0) {
          this.activeComets.delete(key);
          return;
        }
      }

      // Calculate current position using the angle (with randomness) and time-based progress
      const finalAngle = cometConfig.fallAngle + comet.angleOffset;
      // Use angle directly for right-start counterclockwise rotation (0° = right, 90° = up, 180° = left, 270° = down)
      const angleRad = (finalAngle * Math.PI) / 180;

      // Calculate distance based on screen diagonal and percentage
      const screenDiagonal = Math.sqrt(width * width + height * height);
      const maxDistance =
        screenDiagonal * (cometConfig.fallDistancePercent / 100);
      const distance = progress * maxDistance;

      const currentX = comet.x + Math.cos(angleRad) * distance;
      const currentY = comet.y + Math.sin(angleRad) * distance;

      // Calculate trail positions based on current time (deterministic)
      const trail = this.calculateCometTrail(comet, currentTime);

      // Render trail
      this.renderCometTrail(trail);

      // Render comet
      this.renderComet(currentX, currentY, comet, progress, currentTime);
    });
  }

  private calculateCometTrail(
    comet: CometParticle,
    currentTime: number,
  ): CometTrail {
    const { cometConfig } = this.config;
    const {
      canvas: { width, height },
    } = this.ctx;
    const positions: Array<{ x: number; y: number; timestamp: number }> = [];

    if (currentTime < comet.startTime) {
      // Comet hasn't started yet - no trail
      return {
        positions: [],
        color: comet.color,
        alpha: 1.0,
      };
    }

    const totalDuration = comet.endTime - comet.startTime;
    const currentProgress = Math.min(
      1.0,
      (currentTime - comet.startTime) / totalDuration,
    );

    // Calculate how many trail points to generate based on trail length setting
    const trailPoints = Math.max(2, Math.floor(cometConfig.trailLength * 60));

    // Calculate the time range for the trail
    const trailDuration = cometConfig.trailLength;

    // Generate trail positions going backwards in time from current position
    const finalAngle = cometConfig.fallAngle + comet.angleOffset;
    // Use angle directly for right-start counterclockwise rotation (same as main comet movement)
    const angleRad = (finalAngle * Math.PI) / 180;

    for (let i = 0; i < trailPoints; i++) {
      const timeStep = (trailDuration / (trailPoints - 1)) * i;
      const trailTime = currentTime - timeStep;

      // Skip points before comet started
      if (trailTime < comet.startTime) break;

      // Calculate position at this time
      const progress = (trailTime - comet.startTime) / totalDuration;

      // Calculate distance based on screen diagonal and percentage
      const screenDiagonal = Math.sqrt(width * width + height * height);
      const maxDistance =
        screenDiagonal * (cometConfig.fallDistancePercent / 100);
      const distance = progress * maxDistance;

      const x = comet.x + Math.cos(angleRad) * distance;
      const y = comet.y + Math.sin(angleRad) * distance;

      positions.unshift({ x, y, timestamp: trailTime });
    }

    // Calculate alpha for fade out
    let alpha = 1.0;
    if (currentProgress >= 1.0) {
      const fadeProgress =
        (currentTime - comet.endTime) / cometConfig.fadeOutDuration;
      alpha = Math.max(0, 1.0 - fadeProgress);
    }

    return {
      positions,
      color: comet.color,
      alpha,
    };
  }

  private renderCometTrail(trail: CometTrail | undefined) {
    if (!trail || trail.positions.length < 2) return;

    const { cometConfig } = this.config;

    this.ctx.save();
    this.ctx.lineWidth = cometConfig.trailWidth;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    // Create a single path for the entire trail
    this.ctx.beginPath();

    // Move to the first position
    this.ctx.moveTo(trail.positions[0].x, trail.positions[0].y);

    // Create the path
    for (let i = 1; i < trail.positions.length; i++) {
      this.ctx.lineTo(trail.positions[i].x, trail.positions[i].y);
    }

    // Create gradient along the trail
    const firstPos = trail.positions[0];
    const lastPos = trail.positions[trail.positions.length - 1];

    const gradient = this.ctx.createLinearGradient(
      firstPos.x,
      firstPos.y, // Start of gradient (tail)
      lastPos.x,
      lastPos.y, // End of gradient (head)
    );

    // Parse color to extract RGB values
    const color = trail.color;
    const baseAlpha = trail.alpha * cometConfig.trailOpacity;

    // Add gradient stops with smooth alpha transition
    gradient.addColorStop(0, `${color}00`); // Fully transparent at tail
    gradient.addColorStop(
      0.5,
      `${color}${Math.floor(baseAlpha * 0.3 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    ); // 30% opacity at middle
    gradient.addColorStop(
      0.8,
      `${color}${Math.floor(baseAlpha * 0.7 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    ); // 70% opacity near head
    gradient.addColorStop(
      1,
      `${color}${Math.floor(baseAlpha * 255)
        .toString(16)
        .padStart(2, "0")}`,
    ); // Full opacity at head

    // Apply gradient and draw the path once
    this.ctx.strokeStyle = gradient;
    this.ctx.stroke();

    this.ctx.restore();
  }

  private renderComet(
    x: number,
    y: number,
    comet: CometParticle,
    progress: number,
    currentTime: number,
  ) {
    const { cometConfig } = this.config;

    this.ctx.save();

    // Calculate alpha for fade out
    let alpha = 1.0;
    if (progress >= 1.0) {
      const fadeProgress =
        (currentTime - comet.endTime) / cometConfig.fadeOutDuration;
      alpha = 1.0 - fadeProgress;
    }

    // Draw comet particle
    const radius =
      cometConfig.cometSize * (comet.velocity / 127) * comet.trackScale;

    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = comet.color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Add velocity-based glow effect
    const glowRadius = radius * 2;
    const glowGradient = this.ctx.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      glowRadius,
    );
    glowGradient.addColorStop(
      0,
      `${comet.color}${Math.floor(alpha * 128)
        .toString(16)
        .padStart(2, "0")}`,
    );
    glowGradient.addColorStop(1, `${comet.color}00`);

    this.ctx.fillStyle = glowGradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }
}
