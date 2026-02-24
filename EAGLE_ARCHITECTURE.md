# Eagle 基地保护系统 - 架构设计

## 当前系统流程图

```
游戏主循环 (main.ts)
│
├─→ 更新敌人射击
│   └─→ 敌人子弹生成
│       └─→ bullets[] 数组
│
├─→ 更新玩家射击
│   └─→ 玩家子弹生成
│       └─→ bullets[] 数组
│
├─→ 碰撞检测 (CollisionSystem)
│   ├─→ handleBulletCollisions(bullet)
│   │   ├─ 检查 TileType.Brick ──→ 销毁 ──→ setTile(Empty)
│   │   ├─ 检查 TileType.Steel ──→ 根据子弹等级销毁
│   │   └─ 检查 TileType.Eagle ──→ window.eagleDestroyed = true ❌ 一次击中立即销毁
│   │
│   └─→ handleBulletTankCollisions(bullet, tanks)
│
├─→ 游戏状态检查
│   ├─ if (window.eagleDestroyed) → GameState.GameOver
│   └─ if (playerTank.health <= 0) → GameState.GameOver
│
└─→ 渲染 (Renderer)
    └─→ drawEagle() ──→ 金色几何老鹰图案（无生命值显示）
```

## 需要实现的新系统流程

```
Eagle 生命值系统
│
├─ 初始化阶段
│  └─ new Eagle() {
│      health: 3,
│      isArmored: false,
│      isExposed: false
│    }
│
├─ 游戏更新循环
│  ├─ eagle.update(deltaTime)
│  │  └─ 更新装甲计时器 (armorTimer)
│  │
│  └─ CollisionSystem 改进
│     ├─ 检测到 Eagle 被击中
│     │  └─ const damage = bullet.powerLevel >= 2 ? 2 : 1
│     │     eagle.takeDamage(damage)
│     │
│     └─ 检测到保护砖块被击碎
│        └─ checkEagleBrickExposure()
│           ├─ 如果周围砖块全破坏
│           │  └─ eagle.isExposed = true
│           └─ 如果还有砖块保护
│              └─ eagle.isExposed = false
│
├─ 装甲管理
│  └─ PowerUpManager - SHOVEL
│     ├─ eagle.activateArmor(20秒)
│     │  └─ 转换周围砖块为钢铁
│     │
│     └─ 20秒后 eagle.deactivateArmor()
│        └─ 转换回砖块
│
├─ 游戏结束条件
│  └─ if (eagle.isDestroyed()) → GameState.GameOver
│     └─ eagle.isDestroyed() = (eagle.health <= 0)
│
└─ 渲染改进
   └─ drawEagle(state)
      ├─ state.health = 3 → 完好状态（蓝色盾牌）
      ├─ state.health = 2 → 损伤状态（黄色/橙色盾牌）
      ├─ state.health = 1 → 重伤状态（红色盾牌）
      ├─ state.isExposed = true → 移除保护动画
      └─ state.isArmored = true → 钢铁纹理覆盖
```

## Eagle 类设计

```typescript
/**
 * Eagle 基地类 - 管理基地的生命值和保护状态
 */
export class Eagle {
    // 基本属性
    x: number;                    // 瓦片坐标 X（总是 6）
    y: number;                    // 瓦片坐标 Y（总是 12）
    health: number = 3;           // 生命值（初始 3）
    maxHealth: number = 3;        // 最大生命值
    
    // 保护状态
    isExposed: boolean = false;   // 是否暴露（砖块全破坏）
    isArmored: boolean = false;   // 是否有装甲（铁锹道具）
    armorTimer: number = 0;       // 装甲剩余时间
    
    // 动画相关
    lastDamageTime: number = 0;   // 最后被击中的时间
    damageFlashDuration: number = 300; // 闪烁持续时间
    
    /**
     * 造成伤害
     * @param amount 伤害数量
     * @returns 是否被销毁
     */
    takeDamage(amount: number): boolean {
        if (this.isArmored) {
            // 装甲状态下伤害减半
            amount = Math.ceil(amount / 2);
        }
        this.health -= amount;
        this.lastDamageTime = Date.now();
        return this.health <= 0;
    }
    
    /**
     * 激活装甲（铁锹道具）
     * @param duration 装甲持续时间（毫秒）
     */
    activateArmor(duration: number): void {
        this.isArmored = true;
        this.armorTimer = duration;
    }
    
    /**
     * 停用装甲
     */
    deactivateArmor(): void {
        this.isArmored = false;
        this.armorTimer = 0;
    }
    
    /**
     * 更新装甲计时器
     */
    update(deltaTime: number): void {
        if (this.isArmored && this.armorTimer > 0) {
            this.armorTimer -= deltaTime * 1000;
            if (this.armorTimer <= 0) {
                this.deactivateArmor();
            }
        }
    }
    
    /**
     * 是否已销毁
     */
    isDestroyed(): boolean {
        return this.health <= 0;
    }
    
    /**
     * 获取当前状态（用于渲染）
     */
    getState() {
        return {
            health: this.health,
            isExposed: this.isExposed,
            isArmored: this.isArmored,
            isDamaged: Date.now() - this.lastDamageTime < this.damageFlashDuration
        };
    }
}
```

## 砖块保护检查系统

```typescript
/**
 * 检查 Eagle 周围的保护砖块是否完整
 */
interface EagleBrickConfig {
    position: { x: number; y: number };  // Eagle 位置
    protectionBricks: Array<{ x: number; y: number }>;  // 保护砖块列表
}

const EAGLE_BRICK_CONFIG: EagleBrickConfig = {
    position: { x: 6, y: 12 },
    protectionBricks: [
        { x: 5, y: 12 },  // 左
        { x: 7, y: 12 },  // 右
        { x: 6, y: 11 },  // 上
        { x: 5, y: 11 },  // 左上
        { x: 7, y: 11 }   // 右上
    ]
};

/**
 * 检查 Eagle 是否暴露
 * @param mapSystem 地图系统
 * @param eagle Eagle 实例
 */
function checkEagleExposure(mapSystem: MapSystem, eagle: Eagle): void {
    let exposeCount = 0;
    
    for (const brick of EAGLE_BRICK_CONFIG.protectionBricks) {
        const tile = mapSystem.getTile(brick.x, brick.y);
        // 如果这个位置不是砖块，计数 +1
        if (tile !== TileType.Brick) {
            exposeCount++;
        }
    }
    
    // 如果有超过 2 个位置被破坏，Eagle 就暴露了
    eagle.isExposed = exposeCount >= 3;
}
```

## 子弹伤害模型

```
子弹等级对 Eagle 的伤害量:

┌─────────────────────────────────────────┐
│ 一级子弹 (普通)                          │
│ ├─ Eagle 伤害: 1 HP                    │
│ ├─ 砖块穿透: 否                         │
│ └─ 钢铁穿透: 否                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 二级子弹 (增强)                          │
│ ├─ Eagle 伤害: 1 HP                    │
│ ├─ 砖块穿透: 是 (1块)                   │
│ └─ 钢铁穿透: 否                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 三级子弹 (最强/穿透)                     │
│ ├─ Eagle 伤害: 2 HP                    │
│ ├─ 砖块穿透: 是 (2块)                   │
│ ├─ 钢铁穿透: 是 (1块)                   │
│ └─ 非装甲坦克: 穿透击杀                 │
└─────────────────────────────────────────┘

WITH ARMOR:
├─ 伤害减半 (四舍五入向上)
└─ 一级: 1 → 1 HP, 二级: 1 → 1 HP, 三级: 2 → 1 HP
```

## 铁锹道具与 Eagle 的交互

```
SHOVEL PowerUp (持续 20 秒)
│
├─ 被激活时
│  ├─ 取得 Eagle 周围的砖块列表
│  ├─ 将砖块转换为钢铁 (TileType.Steel)
│  └─ eagle.activateArmor(20000ms)
│
├─ 效果持续期间
│  ├─ Eagle 伤害减半
│  ├─ Eagle.isArmored = true
│  └─ 子弹无法直接摧毁钢铁（需要三级子弹）
│
└─ 效果结束时
   ├─ eagle.deactivateArmor()
   ├─ 将钢铁转换回砖块 OR 保持钢铁
   │  （规则待定：回复砖块更符合经典）
   └─ Eagle 恢复易伤性
```

## 渲染状态树

```
drawEagle(state)
│
├─ 基础状态 (state.health === 3 && !state.isExposed)
│  └─ 蓝色盾牌 + 金色老鹰 (原始样式)
│
├─ 轻伤状态 (state.health === 2)
│  └─ 黄色/橙色盾牌 + 淡化老鹰 + 边界裂纹
│
├─ 重伤状态 (state.health === 1)
│  └─ 红色盾牌 + 暗淡老鹰 + 明显裂纹
│
├─ 暴露状态 (state.isExposed === true)
│  ├─ 移除盾牌背景
│  ├─ 老鹰闪烁（每 200ms 切换）
│  └─ 警告光环（红色脉冲）
│
├─ 装甲状态 (state.isArmored === true)
│  ├─ 盾牌上覆盖钢铁纹理
│  ├─ 钢灰色边框
│  └─ 可选：齿轮图案装饰
│
└─ 被击中状态 (state.isDamaged === true)
   └─ 白色闪烁效果 (0.3s 内)
```

## 集成点检查清单

```
☐ 创建 Eagle 类 (src/game/entities/Eagle.ts)
☐ MapSystem 中添加 eagle 实例管理
☐ CollisionSystem 修改 handleBulletCollisions 的 Eagle 逻辑
☐ CollisionSystem 添加 checkEagleExposure() 方法
☐ main.ts 中创建 eagle 全局实例
☐ main.ts update() 中调用 eagle.update(deltaTime)
☐ main.ts 中改进 SHOVEL 道具处理
☐ main.ts 改进游戏结束条件 (改为 eagle.isDestroyed())
☐ Renderer 改进 drawEagle() 实现多个状态渲染
☐ HUD 显示 Eagle 当前生命值
☐ 测试伤害模型
☐ 测试装甲机制
☐ 测试砖块破坏检测
```

---

*设计完成。建议按照集成点清单依次实现。*
