interface BaseRecordingState {
  readonly type: string;
  readonly isRecording: boolean;
}

export class ReadyState implements BaseRecordingState {
  readonly type = "ready";
  readonly isRecording = false;
}

export class RecordingState implements BaseRecordingState {
  readonly type = "recording";
  readonly isRecording = true;
  constructor(
    readonly progress: number, // 0 ~ 1
  ) {}
}
export type RecordingStatus = ReadyState | RecordingState;
