# Battle City Bug Fix Plan

## TL;DR

> **Quick Summary**: 修复 Battle City 游戏中的 4 个关键 bug
> 
> **修复内容**:
> - 1. 敌人坦克（白、绿、黄）出生即死问题
> - 2. 敌人坦克不会射击的问题
> - 3. 右上方增加 HUD 显示（血量、关卡、敌人数量、背景音乐开关）
> - 4. 基地（鹰）位置调整到下方中间，并用砖块包围

> **预计总工期**: ~1 小时
> **并行执行**: NO - 顺序执行（依次修复）
> **关键路径**: 敌人存活 → 射击 → HUD → 基地

---

## Context

### 用户需求
用户报告了以下问题：
1. 敌人白色，绿色，黄色的坦克一出生就死掉了，红色坦克有可能出生也不是满血的
2. 敌人的坦克也要会开子弹
3. 右上方增加显示血量，关卡，敌人数量，和背景音乐开关
4. 我方下面中间应该有鹰，被砖块围起来

### 优先级
- **P0**: 敌人存活问题（阻塞游戏核心玩法）
- **P1**: 敌人射击问题（核心玩法缺失）
- **P2**: HUD 显示（用户体验）
- **P3**: 基地位置（视觉效果）

---

## Work Objectives

### 核心目标
- 修复所有报告的问题
- 不引入新 bug
- 保持现有功能正常

### Must Have
- [x] 敌人无敌时间正确生效（3秒）
- [x] 敌人可以射击
- [x] 敌人子弹能击中玩家
- [x] HUD 正确显示在右上角
- [x] 基地位置正确且有保护

### Must NOT Have
- [x] 不改变现有正常功能
- [x] 不添加不必要的代码

---

## Verification Strategy

**测试方式**: 手动测试
- 启动游戏 `npm run dev`
- 验证每个修复点

---

## Execution Strategy

### 任务顺序
```
任务 1: 修复敌人无敌时间检查
任务 2: 修复敌人射击功能
任务 3: 添加 HUD 渲染
任务 4: 修复基地位置
```

---

## TODOs

- [x] 1. 修复敌人无敌时间检查（main.ts + EnemyTank.ts）

  **What to do**:
  - 在 main.ts 第 199-217 行的子弹-敌人碰撞检测中，添加对 `enemy.isSpawnInvincible()` 的检查
  - 如果敌人处于无敌状态，子弹应该被销毁但敌人不扣血
  - 验证修复：白色/绿色/黄色敌人应该有 3 秒无敌时间

  **References**:
  - `src/game/entities/EnemyTank.ts:110-112` - isInvincible() 方法
  - `src/main.ts:199-217` - 子弹-敌人碰撞检测逻辑

  **Acceptance Criteria**:
  - [ ] 新出生的敌人不会立即死亡
  - [ ] 3 秒后敌人变为可伤害状态

- [ ] 2. 修复敌人射击功能

  **What to do**:
  - 实现 `EnemyTank.shoot()` 方法（当前为空）
  - 在 main.ts 中添加敌人子弹击中玩家坦克的检测
  - 确保敌人射击逻辑在主循环中正确执行
  - 修复 `lastShotTime` 初始化问题（从时间戳改为计时器）

  **References**:
  - `src/game/entities/EnemyTank.ts:107-108` - 空 shoot() 方法
  - `src/main.ts:120-139` - 敌人射击逻辑
  - `src/game/entities/Bullet.ts` - 子弹类

  **Acceptance Criteria**:
  - [ ] 敌人会主动射击
  - [ ] 敌人子弹能击中玩家
  - [ ] 玩家被击中后扣血/游戏结束

- [ ] 3. 添加 HUD 渲染

  **What to do**:
  - 修改 HUD.ts 类，添加 Canvas 渲染方法
  - 在 Renderer.ts 中添加文本绘制方法（如果需要）
  - 在 main.ts 的 render() 中调用 HUD.draw()
  - 显示内容：生命值、关卡、敌人剩余数量、背景音乐开关状态
  - 位置：Canvas 右上角

  **References**:
  - `src/ui/HUD.ts` - HUD 类
  - `src/core/Renderer.ts` - 渲染器
  - `src/main.ts:252-285` - render() 函数

  **Acceptance Criteria**:
  - [ ] HUD 显示在右上角
  - [ ] 显示生命值、关卡、敌人数量
  - [ ] 显示背景音乐开关状态（BGM ON/OFF）
  - [ ] 内容随游戏状态更新

- [ ] 4. 修复基地位置

  **What to do**:
  - 修改 MapSystem.ts 中基地位置从 `[12][4]` 改为 `[12][6]`（底部中央）
  - 在基地周围添加砖块围墙
  - 确保玩家出生点不会被墙挡住
  - 更新 main.ts 中玩家坦克位置以匹配新地图

  **References**:
  - `src/game/systems/MapSystem.ts:14` - 基地位置
  - `src/main.ts:47-48` - 玩家出生位置
  - `src/main.ts:320-321` - 基地渲染

  **Acceptance Criteria**:
  - [ ] 基地在底部中央 (x=6, y=12)
  - [ ] 基地被砖块包围（类似经典坦克大战）
  - [ ] 玩家可以正常移动

---

## Success Criteria

### 验证命令
```bash
npm run dev  # 启动开发服务器，手动测试
```

### 最终检查清单
- [ ] 白/绿/黄敌人不会出生即死
- [ ] 敌人可以射击并击中玩家
- [ ] HUD 显示在右上角
- [ ] 基地在底部中央且被砖块包围
