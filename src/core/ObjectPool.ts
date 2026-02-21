/**
 * Generic object pool implementation for performance optimization
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 0) {
    this.factory = factory;
    this.reset = reset;
    
    // Pre-create initial objects
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  /**
   * Acquire an object from the pool
   * @returns An object from the pool
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  /**
   * Release an object back to the pool
   * @param obj The object to release
   */
  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }

  /**
   * Get the current size of the pool
   * @returns The number of available objects in the pool
   */
  get size(): number {
    return this.pool.length;
  }
}