interface BaseRecordingState {
  readonly type: string;
  readonly isRecording: boolean;
}

export class ReadyState implements BaseRecordingState {
  readonly type = "ready";
  readonly isRecording = false;
}

export interface ExportPhaseInfo {
  readonly name: string;
  readonly eta: string;
}

export class RecordingState implements BaseRecordingState {
  readonly type = "recording";
  readonly isRecording = true;
  constructor(
    readonly progress: number, // 0 ~ 1
    readonly activePhase?: ExportPhaseInfo,
  ) {}
}
export type RecordingStatus = ReadyState | RecordingState;
