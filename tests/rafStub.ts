// https://duglaser.dev/articles/DAlWhCgc9camewosk12x
export class RafStub {
  private index = 0;
  private time = 0;
  private que: { fn: FrameRequestCallback; index: number }[] = [];

  private readonly duration: number = 1000 / 60;

  readonly requestAnimationFrame = (fn: FrameRequestCallback) => {
    this.que.push({ fn, index: this.index });
    this.index += 1;
    return this.index;
  };

  readonly step = () => {
    const q = this.que.shift();
    this.time += this.duration;
    q?.fn(this.time);
  };

  readonly cancelAnimationFrame = (id: number) => {
    this.que = this.que.filter((q) => q.index !== id);
  };

  reset = () => {
    this.que = [];
    this.index = 0;
    this.time = 0;
  };
}
