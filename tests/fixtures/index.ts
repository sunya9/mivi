import * as fs from "node:fs";
import * as path from "node:path";
import { MidiTracks } from "@/types/midi";
import { RendererConfig } from "@/types/renderer";
import { getDefaultRendererConfig } from "@/types/renderer";
import { appContextValue } from "@/lib/appContextValue";

const midiFilename = "test.mid";
const midiFilepath = path.resolve(__dirname, midiFilename);
const midiBuffer = fs.readFileSync(midiFilepath);

const midiFile = new File([midiBuffer], midiFilename, {
  type: "audio/midi",
});

const expectedMidiTracks: MidiTracks = {
  duration: 4,
  minNote: 60,
  maxNote: 72,
  name: "test.mid",
  tracks: [
    {
      config: {
        color: "#000000",
        name: "Acoustic Piano - Full",
        opacity: 1,
        scale: 1,
        staccato: false,
        visible: true,
      },
      id: "0",
      notes: [
        {
          duration: 0.5,
          durationTicks: 480,
          midi: 60,
          name: "C4",
          ticks: 0,
          time: 0,
          velocity: 1,
        },
        {
          duration: 0.5,
          durationTicks: 480,
          midi: 62,
          name: "D4",
          ticks: 480,
          time: 0.5,
          velocity: 1,
        },
        {
          duration: 0.5,
          durationTicks: 480,
          midi: 64,
          name: "E4",
          ticks: 960,
          time: 1,
          velocity: 1,
        },
        {
          duration: 0.5,
          durationTicks: 480,
          midi: 65,
          name: "F4",
          ticks: 1440,
          time: 1.5,
          velocity: 1,
        },
        {
          duration: 0.5,
          durationTicks: 480,
          midi: 67,
          name: "G4",
          ticks: 1920,
          time: 2,
          velocity: 1,
        },
        {
          duration: 0.5,
          durationTicks: 480,
          midi: 69,
          name: "A4",
          ticks: 2400,
          time: 2.5,
          velocity: 1,
        },
        {
          duration: 0.5,
          durationTicks: 480,
          midi: 71,
          name: "B4",
          ticks: 2880,
          time: 3,
          velocity: 1,
        },
        {
          duration: 0.5,
          durationTicks: 480,
          midi: 72,
          name: "C5",
          ticks: 3360,
          time: 3.5,
          velocity: 1,
        },
      ],
    },
  ],
};

const audioFilename = "test.mp3";
const audioFilepath = path.resolve(__dirname, audioFilename);
const audioData = fs.readFileSync(audioFilepath);

const audioFile = new File([audioData], audioFilename, {
  type: "audio/mpeg",
});

const invalidData = "This is not a valid audio file content";
const invalidFile = new File([invalidData], "test.mp3", {
  type: "audio/mpeg",
});

const { audioContext } = appContextValue;
const audioBuffer = audioContext.createBuffer(2, 22050, 44100);

const rendererConfig: RendererConfig = getDefaultRendererConfig();

export {
  midiFile,
  expectedMidiTracks,
  audioFile,
  invalidFile,
  rendererConfig,
  audioBuffer,
};
