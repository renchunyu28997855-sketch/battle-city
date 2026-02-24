# Battle City 项目开发规范

本文档定义 Battle City 坦克大战游戏的开发规范。

---

## 1. 项目架构

### 1.1 目录结构

```
src/
├── core/           # 核心系统
│   ├── GameLoop.ts     # 游戏循环
│   ├── Renderer.ts     # 渲染器
│   ├── InputManager.ts # 输入管理
│   ├── SoundManager.ts # 音效管理
│   └── ObjectPool.ts  # 对象池
├── game/           # 游戏逻辑
│   ├── entities/       # 实体
│   │   ├── Tank.ts         # 坦克基类
│   │   ├── PlayerTank.ts   # 玩家坦克
│   │   ├── EnemyTank.ts    # 敌人坦克
│   │   ├── Bullet.ts       # 子弹
│   │   └── BulletPool.ts   # 子弹池
│   ├── enemies/          # 敌人类型
│   │   ├── NormalTank.ts
│   │   ├── LightTank.ts
│   │   ├── HeavyTank.ts
│   │   ├── FastTank.ts
│   │   ├── ArmoredCar.ts
│   │   └── AntiTankGun.ts
│   ├── systems/         # 游戏系统
│   │   ├── MapSystem.ts      # 地图系统
│   │   ├── CollisionSystem.ts # 碰撞检测
│   │   ├── PowerUpManager.ts  # 道具管理
│   │   ├── ScoreManager.ts   # 分数管理
│   │   └── LevelManager.ts   # 关卡管理
│   ├── config/          # 配置
│   │   └── BulletConfig.ts   # 子弹配置
│   └── utils/           # 工具
│       └── Vector2D.ts
├── ui/             # UI 系统
│   ├── Screens.ts      # 各种界面
│   └── HUD.ts          # 抬头显示
├── data/           # 数据
│   └── levels.json    # 关卡数据
└── main.ts          # 游戏入口
```

---

## 2. 子弹系统规范

### 2.1 威力等级

| 等级 | 名称 | 穿透砖块 | 穿透钢铁 | 穿透坦克 |
|------|------|----------|----------|----------|
| 1 | 普通 | 否 | 否 | 否 |
| 2 | 增强 | 是 | 否 | 否 |
| 3 | 最强 | 是 (2块) | 是 (1块) | 是 (非装甲) |

### 2.2 子弹配置

- **一级子弹**: 白色，速度 192，冷却 900ms，一次打 1 块砖
- **二级子弹**: 银色，速度 256，冷却 700ms，一次打 1 块砖，可穿透砖块
- **三级子弹**: 金色，速度 320，冷却 500ms，一次打 2 块砖 / 1 块钢铁，可穿透所有非装甲坦克

---

## 3. 敌人系统规范

### 3.1 敌人类型

| 类型 | 生命 | 速度 | 子弹等级 | 分数 |
|------|------|------|----------|------|
| 装甲车 | 1 | 快 | 1 | 50 |
| 轻坦克 | 2 | 快 | 1 | 100 |
| 反坦克炮 | 2 | 慢 | 2 | 200 |
| 重坦克 | 4 | 最慢 | 3 | 400 |
| 普通坦克 | 2 | 中 | 1 | 100 |

### 3.2 刷新规则

- 每关敌人总数和刷新间隔由关卡配置 `enemy_config` 决定
- 屏幕上最多 4 个敌人
- 敌人出生后 4 秒内无敌

---

## 4. 道具系统规范

### 4.1 道具类型

| 道具 | 效果 | 持续时间 |
|------|------|----------|
| 头盔 | 无敌 | 15秒 |
| 星星 | 火力+1 | 永久 |
| 手雷 | 敌全灭 | 即时 |
| 时钟 | 敌人暂停 | 10秒 |
| 铁锹 | 基地变钢铁 | 20秒 |
| 坦克 | +1 生命 | 永久 |
| 船 | 能过海水 | 永久 |
| 枪 | 3级火力 | 永久 |

### 4.2 道具行为

- 道具生成后 15 秒消失
- 消失前 3 秒开始闪烁（每秒闪烁一次）
- 闪烁期间透明度在 30% 和 100% 之间切换

---

## 5. 代码规范

### 5.1 命名约定

| 类型 | 规则 | 示例 |
|------|------|------|
| 文件/目录 | kebab-case | `player-tank.ts` |
| 类名 | PascalCase | `PlayerTank` |
| 函数/变量 | camelCase | `moveTank` |
| 常量 | UPPER_SNAKE | `MAX_BULLETS` |

### 5.2 导入顺序

```typescript
// 1. 外部库
import React from 'react';

// 2. 内部模块
import { GameEngine } from './engine';

// 3. 相对导入
import { Bullet } from '../entities/bullet';

// 4. 类型导入
import type { GameState } from './types';
```

### 5.3 禁止事项

- ❌ 禁止使用 `as any` 绕过类型检查
- ❌ 禁止使用 `@ts-ignore` 或 `@ts-expect-error`
- ❌ 禁止删除/修改测试来让测试通过
- ❌ 禁止留下空 catch 块

---

## 6. 验证要求

- 文件修改后运行 `npm run build` 必须通过
- TypeScript 检查无错误
- ESLint 检查通过

---

## 7. 待完成功能

- [ ] 双人模式
- [ ] 音效文件集成
- [ ] 动画效果优化
