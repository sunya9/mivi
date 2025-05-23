abstract class BaseRecordingState {
  abstract readonly type: string;
  abstract readonly isRecording: boolean;
}

export class ReadyState extends BaseRecordingState {
  readonly type = "ready";
  readonly isRecording = false;
}

export class RecordingState extends BaseRecordingState {
  readonly type = "recording";
  readonly isRecording = true;
  constructor(
    readonly progress: number, // 0 ~ 1
  ) {
    super();
  }
}
export type RecordingStatus = ReadyState | RecordingState;
