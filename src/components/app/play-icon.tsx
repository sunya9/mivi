import { useState } from "react";
import { Pause, Play } from "lucide-react";

interface PlayIconProps {
  isPlaying: boolean;
}

export function PlayIcon({ isPlaying }: PlayIconProps) {
  const [animKey, setAnimKey] = useState({ key: 0, isPlaying: false });

  if (animKey.isPlaying !== isPlaying) {
    setAnimKey((prev) => ({ key: prev.key + 1, isPlaying }));
  }

  return (
    <div
      hidden={!animKey.key}
      key={animKey.key}
      className="pointer-events-none absolute inset-0 flex animate-play-feedback items-center justify-center"
    >
      <span className="rounded-full bg-black/50 p-4 text-white">
        {isPlaying ? (
          <Play strokeWidth={0.5} className="size-12" />
        ) : (
          <Pause strokeWidth={0.5} className="size-12" />
        )}
      </span>
    </div>
  );
}
