// GameLoop.ts - Game loop with deltaTime for Battle City
export class GameLoop {
  private lastTime = 0;
  private running = false;
  private updateFn: (dt: number) => void;
  private renderFn: () => void;

  constructor(updateFn: (dt: number) => void, renderFn: () => void) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  stop(): void {
    this.running = false;
  }

  private loop = (timestamp: number): void => {
    if (!this.running) return;

    // Calculate deltaTime in seconds, cap at 0.1s to prevent jumps
    const deltaTime = Math.min(0.1, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    this.updateFn(deltaTime);
    this.renderFn();

    requestAnimationFrame(this.loop);
  };
}
