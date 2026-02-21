import { Bullet } from '../entities/Bullet';
import { Tank } from '../entities/Tank';
import { PlayerTank } from '../entities/PlayerTank';
import { EnemyTank } from '../entities/EnemyTank';
import { MapSystem, TileType } from './MapSystem';

export class CollisionSystem {
  private mapSystem: MapSystem;

  constructor(mapSystem: MapSystem) {
    this.mapSystem = mapSystem;
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

    const bulletX = bullet.x;
    const bulletY = bullet.y;

    // Check collision with map tiles
    const tileX = Math.floor(bulletX / 64);
    const tileY = Math.floor(bulletY / 64);

    // Check surrounding tiles for potential collisions
    const checkTiles = [
      {x: tileX, y: tileY},
      {x: tileX + 1, y: tileY},
      {x: tileX, y: tileY + 1},
      {x: tileX + 1, y: tileY + 1}
    ];

    for (const tile of checkTiles) {
      const tileType = this.mapSystem.getTile(tile.x, tile.y);
      
      switch (tileType) {
        case TileType.Brick:
          this.mapSystem.setTile(tile.x, tile.y, TileType.Empty);
          bullet.active = false;
          return;
          
        case TileType.Steel:
          if (bullet.isSteel || bullet.powerLevel >= 2) {
            this.mapSystem.setTile(tile.x, tile.y, TileType.Empty);
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