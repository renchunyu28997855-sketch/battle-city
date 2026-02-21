import { ObjectPool } from "../../core/ObjectPool";
import { Bullet } from "./Bullet";

/**
 * Bullet pool for performance optimization
 */
export class BulletPool {
  private static instance: BulletPool;
  private pool: ObjectPool<Bullet>;

  private constructor() {
    this.pool = new ObjectPool<Bullet>(
      () => new Bullet(),
      (bullet) => bullet.reset(),
      50 // Pre-create 50 bullets
    );
  }

  /**
   * Get the singleton instance of BulletPool
   * @returns BulletPool instance
   */
  static getInstance(): BulletPool {
    if (!BulletPool.instance) {
      BulletPool.instance = new BulletPool();
    }
    return BulletPool.instance;
  }

  /**
   * Acquire a bullet from the pool
   * @returns A bullet ready to be fired
   */
  acquire(): Bullet {
    return this.pool.acquire();
  }

  /**
   * Release a bullet back to the pool
   * @param bullet The bullet to release
   */
  release(bullet: Bullet): void {
    this.pool.release(bullet);
  }

  /**
   * Get current pool size
   * @returns Number of available bullets in the pool
   */
  get size(): number {
    return this.pool.size;
  }
}