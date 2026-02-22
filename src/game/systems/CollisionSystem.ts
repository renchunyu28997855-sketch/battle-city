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
    
    // 获取子弹的穿透配置
    const brickPenetrationCount = bullet.brickPenetrationCount;
    const maxBricksToDestroy = (brickPenetrationCount !== undefined && brickPenetrationCount !== null) ? brickPenetrationCount : 1;
    const canPenetrateBrick = bullet.canPenetrateBrick;
    const powerLevel = bullet.powerLevel;
    
    // 调试日志
    console.log(`[Bullet Collision] powerLevel=${powerLevel}, brickPenetrationCount=${brickPenetrationCount}, maxBricksToDestroy=${maxBricksToDestroy}, canPenetrateBrick=${canPenetrateBrick}`);
    
    const TILE_SIZE = 64;
    
    // 计算子弹覆盖的矩形范围(像素坐标)
    const bulletLeft = bullet.x;
    const bulletTop = bullet.y;
    const bulletRight = bullet.x + bullet.width;
    const bulletBottom = bullet.y + bullet.height;
    
    // 转换为瓦片坐标范围
    const minTileX = Math.floor(bulletLeft / TILE_SIZE);
    const maxTileX = Math.floor((bulletRight - 1) / TILE_SIZE);
    const minTileY = Math.floor(bulletTop / TILE_SIZE);
    const maxTileY = Math.floor((bulletBottom - 1) / TILE_SIZE);
    
    // 记录已破坏的砖块数量
    let bricksDestroyed = 0;
    
    // 按瓦片坐标顺序处理(先Y后X)
    for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
      for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
        // 已经打够指定数量立即停止
        if (bricksDestroyed >= maxBricksToDestroy) {
          bullet.active = false;
          return;
        }
        
        const tileType = this.mapSystem.getTile(tileX, tileY);
        
        switch (tileType) {
          case TileType.Brick:
            // 破坏砖块
            this.mapSystem.setTile(tileX, tileY, TileType.Empty);
            bricksDestroyed++;
            
            // 打够数量立即停止
            if (bricksDestroyed >= maxBricksToDestroy) {
              bullet.active = false;
              return;
            }
            // 不能穿透砖块则停止
            if (!canPenetrateBrick) {
              bullet.active = false;
              return;
            }
            break;
            
          case TileType.Steel:
            // 只有 powerLevel >= 3 才能穿透钢铁
            if (bullet.isSteel) {
              this.mapSystem.setTile(tileX, tileY, TileType.Empty);
            }
            bullet.active = false;
            this.soundManager.playMetalHit();
            return;
            
          case TileType.Water:
          case TileType.Base:
          case TileType.Eagle:
            bullet.active = false;
            if (tileType === TileType.Eagle) {
              (window as any).eagleDestroyed = true;
            }
            return;
            
          case TileType.Forest:
          case TileType.Floor:
          case TileType.Empty:
          default:
            // 不影响,继续
            break;
        }
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

    const bulletWidth = bullet.width;
    const bulletHeight = bullet.height;
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