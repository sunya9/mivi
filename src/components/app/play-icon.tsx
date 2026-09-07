import { Pause, Play } from "lucide-react";

import { useAppContext } from "@/contexts/app-context";
import { useStore } from "@/hooks/use-store";
import { isEffectivelyPlaying } from "@/lib/player/audio-playback-store";

export function PlayIcon() {
  const { audioPlaybackStore: store } = useAppContext();
  const feedbackAt = useStore(store, (snapshot) => snapshot.playFeedbackAt);
  const playing = useStore(store, isEffectivelyPlaying);
  if (feedbackAt === 0) return null;

  return (
    <div
      key={feedbackAt}
      data-slot="play-feedback"
      data-state={playing ? "playing" : "paused"}
      className="pointer-events-none absolute inset-0 flex animate-play-feedback items-center justify-center"
    >
      <span className="rounded-full bg-black/50 p-4 text-white">
        {playing ? (
          <Play strokeWidth={0.5} className="size-12" />
        ) : (
          <Pause strokeWidth={0.5} className="size-12" />
        )}
      </span>
    </div>
  );
}
