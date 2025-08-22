// Simple semaphore for concurrency control
export class Semaphore {
  private count: number;
  private queue: Array<() => void> = [];

  constructor(count: number) {
    this.count = Math.max(1, count);
  }

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const tryAcquire = (): void => {
        if (this.count > 0) {
          this.count -= 1;
          resolve((): void => {
            this.count += 1;
            const next = this.queue.shift();
            if (next) next();
          });
        } else {
          this.queue.push(tryAcquire);
        }
      };
      tryAcquire();
    });
  }
}
