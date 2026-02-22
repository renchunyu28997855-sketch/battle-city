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
    
    let tilesDestroyed = 0;
    const maxBricksToDestroy = bullet.brickPenetrationCount || 1;
    const canPenetrateBrick = bullet.canPenetrateBrick;
    
    // Determine direction to check for multiple tiles
    let dx = 0, dy = 0;
    switch (bullet.direction) {
      case 0: dy = -1; break; // Up
      case 1: dy = 1; break;  // Down
      case 2: dx = -1; break; // Left
      case 3: dx = 1; break;  // Right
    }
    
    // Check current tile and tiles in bullet direction
    for (let i = 0; i <= maxBricksToDestroy; i++) {
      const checkX = Math.floor((bulletCenterX + dx * i * 64) / 64);
      const checkY = Math.floor((bulletCenterY + dy * i * 64) / 64);
      
      const tileType = this.mapSystem.getTile(checkX, checkY);
      
      switch (tileType) {
        case TileType.Brick:
          this.mapSystem.setTile(checkX, checkY, TileType.Empty);
          tilesDestroyed++;
          if (!canPenetrateBrick || tilesDestroyed >= maxBricksToDestroy) {
            bullet.active = false;
            return;
          }
          break;
          
        case TileType.Steel:
          // 只有 powerLevel >= 3 才能穿透钢铁
          if (bullet.isSteel) {
            this.mapSystem.setTile(checkX, checkY, TileType.Empty);
            bullet.active = false;
            return;
          } else {
            this.soundManager.playMetalHit();
            bullet.active = false;
            return;
          }
          
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
          // Continue checking in direction
          break;
      }
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