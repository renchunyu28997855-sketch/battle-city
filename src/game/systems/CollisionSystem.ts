import { Bullet } from '../entities/Bullet';
import { Tank } from '../entities/Tank';
import { PlayerTank } from '../entities/PlayerTank';
import { EnemyTank } from '../entities/EnemyTank';
import { MapSystem, TileType } from './MapSystem';
import { SoundManager } from '../../core/SoundManager';
import { Vector2D } from '../utils/Vector2D';

export enum CollisionFace {
  Top,
  Bottom,
  Left,
  Right,
  None
}

export class CollisionSystem {
  private mapSystem: MapSystem;
  private soundManager: SoundManager;
  private readonly TILE_SIZE = 64;

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
   * 识别子弹与矩形碰撞的面
   * @param bulletPrevX 子弹上一帧的X位置
   * @param bulletPrevY 子弹上一帧的Y位置
   * @param bulletCurrX 子弹当前的X位置
   * @param bulletCurrY 子弹当前的Y位置
   * @param bulletWidth 子弹宽度
   * @param bulletHeight 子弹高度
   * @param rectX 矩形左边界
   * @param rectY 矩形上边界
   * @param rectWidth 矩形宽度
   * @param rectHeight 矩形高度
   * @returns 碰撞的面
   */
  private detectCollisionFace(
    bulletPrevX: number, bulletPrevY: number,
    bulletCurrX: number, bulletCurrY: number,
    bulletWidth: number, bulletHeight: number,
    rectX: number, rectY: number, rectWidth: number, rectHeight: number
  ): CollisionFace {
    const prevLeft = bulletPrevX;
    const prevTop = bulletPrevY;
    const prevRight = bulletPrevX + bulletWidth;
    const prevBottom = bulletPrevY + bulletHeight;

    const currLeft = bulletCurrX;
    const currTop = bulletCurrY;
    const currRight = bulletCurrX + bulletWidth;
    const currBottom = bulletCurrY + bulletHeight;

    const rectLeft = rectX;
    const rectTop = rectY;
    const rectRight = rectX + rectWidth;
    const rectBottom = rectY + rectHeight;

    // 判断碰撞面（从上方进入）
    if (prevBottom <= rectTop && currBottom > rectTop) {
      return CollisionFace.Top;
    }
    
    // 判断碰撞面（从下方进入）
    if (prevTop >= rectBottom && currTop < rectBottom) {
      return CollisionFace.Bottom;
    }
    
    // 判断碰撞面（从左方进入）
    if (prevRight <= rectLeft && currRight > rectLeft) {
      return CollisionFace.Left;
    }
    
    // 判断碰撞面（从右方进入）
    if (prevLeft >= rectRight && currLeft < rectRight) {
      return CollisionFace.Right;
    }

    return CollisionFace.None;
  }

  /**
   * 根据碰撞面计算反射向量
   * @param face 碰撞的面
   * @param incomingVector 入射向量
   * @returns 反射向量
   */
  private getReflectionVector(face: CollisionFace, incomingVector: Vector2D): Vector2D {
    let normalVector: Vector2D;

    switch (face) {
      case CollisionFace.Top:
      case CollisionFace.Bottom:
        // Y方向反转（水平砖块面）
        normalVector = new Vector2D(0, face === CollisionFace.Top ? 1 : -1);
        break;
      case CollisionFace.Left:
      case CollisionFace.Right:
        // X方向反转（竖直砖块面）
        normalVector = new Vector2D(face === CollisionFace.Left ? 1 : -1, 0);
        break;
      default:
        return incomingVector;
    }

    // 使用反射公式计算反射向量: r = v - 2(v·n)n
    return incomingVector.reflect(normalVector);
  }

  /**
   * 处理子弹与砖块的碰撞（支持反弹）
   * @param bullet 子弹对象
   */
  handleBulletCollisions(bullet: Bullet): void {
    if (!bullet.active) return;
    
    const brickPenetrationCount = bullet.brickPenetrationCount;
    const maxBricksToDestroy = (brickPenetrationCount !== undefined && brickPenetrationCount !== null) ? brickPenetrationCount : 1;
    const canPenetrateBrick = bullet.canPenetrateBrick;
    const powerLevel = bullet.powerLevel;
    
    console.log(`[Bullet Collision] powerLevel=${powerLevel}, brickPenetrationCount=${brickPenetrationCount}, maxBricksToDestroy=${maxBricksToDestroy}, canPenetrateBrick=${canPenetrateBrick}`);
    
    // 计算子弹覆盖的矩形范围(像素坐标)
    const bulletLeft = bullet.x;
    const bulletTop = bullet.y;
    const bulletRight = bullet.x + bullet.width;
    const bulletBottom = bullet.y + bullet.height;
    
    // 转换为瓦片坐标范围
    const minTileX = Math.floor(bulletLeft / this.TILE_SIZE);
    const maxTileX = Math.floor((bulletRight - 1) / this.TILE_SIZE);
    const minTileY = Math.floor(bulletTop / this.TILE_SIZE);
    const maxTileY = Math.floor((bulletBottom - 1) / this.TILE_SIZE);
    
    // 记录已破坏的砖块和钢铁数量
    let bricksDestroyed = 0;
    let steelDestroyed = 0;
    
    // 记录碰撞的砖块（用于反弹逻辑）
    let firstBrickCollision: { face: CollisionFace, tileX: number, tileY: number } | null = null;
    
    // 按瓦片坐标顺序处理(先Y后X)
    for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
      for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
        const tileType = this.mapSystem.getTile(tileX, tileY);
        
        switch (tileType) {
          case TileType.Brick:
            // 检测碰撞面
            const tilePixelX = tileX * this.TILE_SIZE;
            const tilePixelY = tileY * this.TILE_SIZE;
            const face = this.detectCollisionFace(
              bullet.previousX, bullet.previousY,
              bullet.x, bullet.y,
              bullet.width, bullet.height,
              tilePixelX, tilePixelY,
              this.TILE_SIZE, this.TILE_SIZE
            );

            // 如果支持反弹且还能反弹，则触发反弹
            if (bullet.canStillBounce() && face !== CollisionFace.None) {
              if (!firstBrickCollision) {
                firstBrickCollision = { face, tileX, tileY };
              }
            } else {
              // 破坏砖块
              this.mapSystem.setTile(tileX, tileY, TileType.Empty);
              bricksDestroyed++;
              
              // 检查是否已达穿透上限
              if (bricksDestroyed >= maxBricksToDestroy) {
                bullet.active = false;
                return;
              }
            }
            break;
            
          case TileType.Steel:
            // 检测碰撞面
            const steelPixelX = tileX * this.TILE_SIZE;
            const steelPixelY = tileY * this.TILE_SIZE;
            const steelFace = this.detectCollisionFace(
              bullet.previousX, bullet.previousY,
              bullet.x, bullet.y,
              bullet.width, bullet.height,
              steelPixelX, steelPixelY,
              this.TILE_SIZE, this.TILE_SIZE
            );

            if (bullet.isSteel) {
              this.mapSystem.setTile(tileX, tileY, TileType.Empty);
              steelDestroyed++;
              // 三级子弹一次打1块钢铁，打完后继续穿透
              if (steelDestroyed >= 1) {
                bullet.active = false;
                return;
              }
            } else {
              // 普通子弹打钢铁上反弹或停止
              if (bullet.canStillBounce() && steelFace !== CollisionFace.None) {
                if (!firstBrickCollision) {
                  firstBrickCollision = { face: steelFace, tileX, tileY };
                }
              } else {
                bullet.active = false;
                this.soundManager.playMetalHit();
                return;
              }
            }
            break;
            
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

    // 处理反弹逻辑
    if (firstBrickCollision && bullet.canStillBounce()) {
      const reflectedVector = this.getReflectionVector(
        firstBrickCollision.face,
        bullet.speedVector
      );
      bullet.setReflection(reflectedVector);
      
      // 销毁碰撞的砖块
      const { tileX, tileY } = firstBrickCollision;
      this.mapSystem.setTile(tileX, tileY, TileType.Empty);
      console.log(`[Bounce] Bullet bounced off brick at (${tileX}, ${tileY})`);
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
