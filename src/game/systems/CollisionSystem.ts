import { Bullet } from '../entities/Bullet';
import { getBrickPenetrationCount } from '../config/BulletConfig';
import { Tank } from '../entities/Tank';
import { PlayerTank } from '../entities/PlayerTank';
import { EnemyTank } from '../entities/EnemyTank';
import { MapSystem, TileType } from './MapSystem';
import { SoundManager } from '../../core/SoundManager';

export enum CollisionFace {
  Top,
  Bottom,
  Left,
  Right
}

export class CollisionSystem {
  private mapSystem: MapSystem;
  private soundManager: SoundManager;
  private readonly TILE_SIZE = 80;

  constructor(mapSystem: MapSystem) {
    this.mapSystem = mapSystem;
    this.soundManager = SoundManager.getInstance();
  }

  private checkAABB(x1: number, y1: number, width1: number, height1: number,
                   x2: number, y2: number, width2: number, height2: number): boolean {
    return x1 < x2 + width2 &&
           x1 + width1 > x2 &&
           y1 < y2 + height2 &&
           y1 + height1 > y2;
  }

  private detectCollisionFace(
    bulletPrevX: number, bulletPrevY: number,
    bulletCurrX: number, bulletCurrY: number,
    bulletWidth: number, bulletHeight: number,
    rectX: number, rectY: number, rectWidth: number, rectHeight: number
  ): CollisionFace {
    const prevLeft = bulletPrevX;
    const prevTop = bulletPrevY;
    const currLeft = bulletCurrX;
    const currTop = bulletCurrY;
    const rectLeft = rectX;
    const rectTop = rectY;
    const rectRight = rectX + rectWidth;
    const rectBottom = rectY + rectHeight;

    // 简化逻辑：检测子弹是否从砖块边缘穿过
    // 如果子弹中心点穿过砖块边缘，则返回对应的碰撞面
    const prevCenterX = prevLeft + bulletWidth / 2;
    const prevCenterY = prevTop + bulletHeight / 2;
    const currCenterX = currLeft + bulletWidth / 2;
    const currCenterY = currTop + bulletHeight / 2;

    // 检测Y方向的运动
    if (prevCenterY <= rectTop && currCenterY > rectTop) {
      return CollisionFace.Top;
    }
    if (prevCenterY >= rectBottom && currCenterY < rectBottom) {
      return CollisionFace.Bottom;
    }
    if (prevCenterX <= rectLeft && currCenterX > rectLeft) {
      return CollisionFace.Left;
    }
    if (prevCenterX >= rectRight && currCenterX < rectRight) {
      return CollisionFace.Right;
    }
    
    // 如果没有穿过，返回默认碰撞面
    return CollisionFace.Top;
  }

  handleBulletCollisions(bullet: Bullet): void {
    if (!bullet.active) return;

    const powerLevel = bullet.powerLevel;
    const maxBricksToDestroy = getBrickPenetrationCount(powerLevel);

    // 1. 检测砖块碰撞
    const brickCollisions: { tileX: number, tileY: number, face: CollisionFace }[] = [];

    const startTileX = Math.floor(Math.min(bullet.previousX, bullet.x) / this.TILE_SIZE);
    const endTileX = Math.floor((Math.max(bullet.previousX, bullet.x) + bullet.width) / this.TILE_SIZE);
    const startTileY = Math.floor(Math.min(bullet.previousY, bullet.y) / this.TILE_SIZE);
    const endTileY = Math.floor((Math.max(bullet.previousY, bullet.y) + bullet.height) / this.TILE_SIZE);

    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const tileType = this.mapSystem.getTile(tileX, tileY);
        if (tileType === TileType.Brick) {
          const tilePixelX = tileX * this.TILE_SIZE;
          const tilePixelY = tileY * this.TILE_SIZE;
          const face = this.detectCollisionFace(
            bullet.previousX, bullet.previousY,
            bullet.x, bullet.y,
            bullet.width, bullet.height,
            tilePixelX, tilePixelY,
            this.TILE_SIZE, this.TILE_SIZE
          );
          brickCollisions.push({ tileX, tileY, face });
        }
      }
    }

    // 2. 处理砖块穿透
    const canDestroyCount = maxBricksToDestroy - bullet.brickDestroyedCount;
    const destroyCount = Math.min(brickCollisions.length, canDestroyCount);
    for (let i = 0; i < destroyCount; i++) {
      const { tileX, tileY } = brickCollisions[i];
      this.mapSystem.setTile(tileX, tileY, TileType.Empty);
      bullet.brickDestroyedCount++;
    }

    // 3. 处理砖块碰撞后的子弹状态
    if (brickCollisions.length > 0) {
      if (powerLevel < 3) {
        // 1,2级子弹：打1块砖后消失
        bullet.active = false;
      } else {
        // 3级子弹：打2块砖后消失，否则继续穿透
        if (bullet.brickDestroyedCount >= 2) {
          bullet.active = false;
        }
      }
    }

    // 4. 检测钢砖碰撞
    const steelStartX = Math.floor(Math.min(bullet.previousX, bullet.x) / this.TILE_SIZE);
    const steelEndX = Math.floor((Math.max(bullet.previousX, bullet.x) + bullet.width) / this.TILE_SIZE);
    const steelStartY = Math.floor(Math.min(bullet.previousY, bullet.y) / this.TILE_SIZE);
    const steelEndY = Math.floor((Math.max(bullet.previousY, bullet.y) + bullet.height) / this.TILE_SIZE);

    for (let tileY = steelStartY; tileY <= steelEndY; tileY++) {
      for (let tileX = steelStartX; tileX <= steelEndX; tileX++) {
        const tileType = this.mapSystem.getTile(tileX, tileY);
        if (tileType === TileType.Steel) {
          if (powerLevel === 3) {
            // 3级子弹：打掉1块钢砖后消失
            this.mapSystem.setTile(tileX, tileY, TileType.Empty);
            bullet.active = false;
            this.soundManager.playMetalHit();
          } else {
            // 1,2级子弹：碰到钢砖后立即消失
            bullet.active = false;
          }
          return;
        }
      }
    }

    // 5. 检测大本营(Eagle)碰撞
    for (let tileY = steelStartY; tileY <= steelEndY; tileY++) {
      for (let tileX = steelStartX; tileX <= steelEndX; tileX++) {
        const tileType = this.mapSystem.getTile(tileX, tileY);
        if (tileType === TileType.Eagle) {
          // 大本营被击中，标记游戏结束
          (window as any).eagleDestroyed = true;
          bullet.active = false;
          return;
        }
      }
    }
  }

  handleBulletBulletCollisions(bullet: Bullet, bullets: Bullet[]): void {
    if (!bullet.active) return;
    const bulletPower = bullet.powerLevel;
    
    for (const otherBullet of bullets) {
      if (!otherBullet.active || otherBullet === bullet) continue;
      if (bullet.powerLevel === otherBullet.powerLevel && bulletPower > 0) {
        // 1,2,3级子弹互相抵消
        bullet.active = false;
        otherBullet.active = false;
        break;
      }
    }
  }

  handleBulletTankCollisions(bullet: Bullet, tanks: (Tank | PlayerTank | EnemyTank)[]): boolean {
    if (!bullet.active) return false;

    const bulletWidth = bullet.width;
    const bulletHeight = bullet.height;
    const bulletX = bullet.x;
    const bulletY = bullet.y;

    for (const tank of tanks) {
      if (tank.health <= 0) continue;
      const tankX = tank.x;
      const tankY = tank.y;
      const tankWidth = tank.width;
      const tankHeight = tank.height;

      if (this.checkAABB(bulletX, bulletY, bulletWidth, bulletHeight,
                        tankX, tankY, tankWidth, tankHeight)) {
        tank.health--;
        bullet.active = false;
        if (tank.health <= 0) return true;
      }
    }
    return false;
  }


}
