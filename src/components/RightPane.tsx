import { useState } from "react";
import { MidiVisualizer } from "./MidiVisualizer";
import { VisualizerSettings } from "@/types/visualizerSettings";
import { PianoRollRenderer } from "@/renderers/PianoRollRenderer";
import { WaveformRenderer } from "@/renderers/WaveformRenderer";
import { ParticlesRenderer } from "@/renderers/ParticlesRenderer";
import { AudioHandler } from "@/lib/AudioHandler";
import { RendererCreator } from "@/lib/RendererCreator";
import { MidiState } from "@/types/midi";

interface Props {
  onRecordingStart: () => void;
  onRecordingStop: () => void;
  midiState: MidiState;
  audioHandler?: AudioHandler;
}

export const RightPane = ({
  onRecordingStart,
  onRecordingStop,
  midiState,
  audioHandler,
}: Props) => {
  const [rendererCreator, setRendererCreator] = useState(
    new RendererCreator(
      (ctx: CanvasRenderingContext2D) => new PianoRollRenderer(ctx),
    ),
  );

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-4 flex-1 rounded bg-black">
        <MidiVisualizer
          midiState={midiState}
          rendererCreator={rendererCreator}
          audioHandler={audioHandler}
        />
      </div>
      <div className="rounded bg-white p-4 shadow">
        <h3 className="mb-4 text-lg font-bold">Visualizer Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="block">
              Visualization Style:
              <select
                className="ml-2 rounded border p-1"
                onChange={(e) => {
                  const style = e.target.value as VisualizerSettings["style"];
                  switch (style) {
                    case "pianoRoll":
                      setRendererCreator(
                        new RendererCreator(
                          (ctx) => new PianoRollRenderer(ctx),
                        ),
                      );
                      break;
                    case "waveform":
                      setRendererCreator(
                        new RendererCreator((ctx) => new WaveformRenderer(ctx)),
                      );
                      break;
                    case "particles":
                      setRendererCreator(
                        new RendererCreator(
                          (ctx) => new ParticlesRenderer(ctx),
                        ),
                      );
                      break;
                  }
                }}
              >
                <option value="pianoRoll">Piano Roll</option>
                <option value="waveform">Waveform</option>
                <option value="particles">Particles</option>
              </select>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onRecordingStart}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              録画開始
            </button>
            <button
              onClick={onRecordingStop}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              録画停止
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
