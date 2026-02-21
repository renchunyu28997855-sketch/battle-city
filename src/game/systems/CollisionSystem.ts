import { Bullet } from '../entities/Bullet';
import { Tank } from '../entities/Tank';
import { PlayerTank } from '../entities/PlayerTank';
import { EnemyTank } from '../entities/EnemyTank';
import { MapSystem, TileType } from './MapSystem';
import { SoundManager } from '../../core/SoundManager';

export class CollisionSystem {
  private mapSystem: MapSystem;
  private soundManager: SoundManager;

  constructor(mapSystem: MapSystem) {
    this.mapSystem = mapSystem;
    this.soundManager = SoundManager.getInstance();
  }

  /**
   * Check if two rectangles collide using Axis-Aligned Bounding Box (AABB) collision
   * @param x1 X position of first rectangle
   * @param y1 Y position of first rectangle
   * @param width1 Width of first rectangle
   * @param height1 Height of first rectangle
   * @param x2 X position of second rectangle
   * @param y2 Y position of second rectangle
   * @param width2 Width of second rectangle
   * @param height2 Height of second rectangle
   * @returns True if rectangles collide
   */
  private checkAABB(x1: number, y1: number, width1: number, height1: number, 
                   x2: number, y2: number, width2: number, height2: number): boolean {
    return x1 < x2 + width2 &&
           x1 + width1 > x2 &&
           y1 < y2 + height2 &&
           y1 + height1 > y2;
  }

  /**
   * Handle bullet collision with walls and other objects
   * @param bullet Bullet to check collisions for
   * @param bulletLevel Current bullet level (determines wall destruction ability)
   */
  handleBulletCollisions(bullet: Bullet): void {
    if (!bullet.active) return;

    const bulletCenterX = bullet.x + bullet.width / 2;
    const bulletCenterY = bullet.y + bullet.height / 2;
    
    const tileX = Math.floor(bulletCenterX / 64);
    const tileY = Math.floor(bulletCenterY / 64);

    const tileType = this.mapSystem.getTile(tileX, tileY);
    
    switch (tileType) {
      case TileType.Brick:
        // 子弹可以打掉的砖块数量: powerLevel + 1
        // powerLevel 0 = 1块, powerLevel 1 = 2块, powerLevel 2 = 3块, powerLevel 3 = 4块
        const bricksDestroyed = bullet.powerLevel + 1;
        // 简化处理：每发子弹打掉1块砖
        this.mapSystem.setTile(tileX, tileY, TileType.Empty);
        bullet.active = false;
        return;
        
      case TileType.Steel:
        // 只有 powerLevel >= 3 (4颗星/手枪) 才能穿透钢铁
        if (bullet.isSteel) {
          this.mapSystem.setTile(tileX, tileY, TileType.Empty);
        } else {
          this.soundManager.playMetalHit();
        }
        bullet.active = false;
        return;
        
      case TileType.Water:
        bullet.active = false;
        return;
        
      case TileType.Base:
        bullet.active = false;
        return;
        
      case TileType.Eagle:
        bullet.active = false;
        (window as any).eagleDestroyed = true;
        return;
        
      case TileType.Forest:
      case TileType.Floor:
      case TileType.Empty:
      default:
        break;
    }
  }

  /**
   * Handle bullet collision with tanks
   * @param bullet Bullet to check collisions for
   * @param tanks List of tanks to check against
   * @returns True if bullet hit a tank, false otherwise
   */
  handleBulletTankCollisions(bullet: Bullet, tanks: (Tank | PlayerTank | EnemyTank)[]): boolean {
    if (!bullet.active) return false;

    const bulletWidth = 8;
    const bulletHeight = 8;
    const bulletX = bullet.x;
    const bulletY = bullet.y;

    for (const tank of tanks) {
      // Skip dead tanks
      if (tank.health <= 0) continue;
      
      // Check if bullet collides with tank
      const tankX = tank.x;
      const tankY = tank.y;
      const tankWidth = tank.width;
      const tankHeight = tank.height;

      if (this.checkAABB(bulletX, bulletY, bulletWidth, bulletHeight, 
                        tankX, tankY, tankWidth, tankHeight)) {
        // Damage tank
        tank.health--;
        bullet.active = false;
        
        // If tank dies, it's removed from the game
        if (tank.health <= 0) {
          return true; // Tank destroyed
        }
      }
    }

    return false;
  }
}