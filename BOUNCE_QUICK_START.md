# 子弹反弹机制 - 快速参考

## ⚡ 5分钟快速启动

### 核心概念
- **反弹** = 子弹碰到砖块后改变方向而不停止
- **物理** = 遵循镜像反射定律 `r = v - 2(v·n)n`
- **衰减** = 每次反弹速度逐渐降低

### 文件修改清单
```
✅ src/game/entities/Bullet.ts        (+80行)
✅ src/game/utils/Vector2D.ts          (+49行)
✅ src/game/systems/CollisionSystem.ts (+120行)
```

---

## 🔑 关键类和方法

### Bullet 类

**新属性：**
```typescript
speedVector: Vector2D;           // 速度向量
previousX, previousY: number;    // 上一帧位置（碰撞检测用）
bounceCount: number;             // 当前反弹次数
maxBounces: number = 3;          // 最大反弹次数
bounceEnergyLoss: number = 1.0;  // 能量衰减率
```

**新方法：**
```typescript
setReflection(vector: Vector2D): void  // 设置反弹
canStillBounce(): boolean             // 能否继续反弹
```

### Vector2D 类

**新方法：**
```typescript
reflect(normal: Vector2D): Vector2D   // 计算反射向量
dot(other: Vector2D): number          // 点积
```

### CollisionSystem 类

**新枚举：**
```typescript
enum CollisionFace { Top, Bottom, Left, Right, None }
```

**新方法：**
```typescript
detectCollisionFace(...): CollisionFace    // 识别碰撞面
getReflectionVector(...): Vector2D         // 计算反射向量
```

---

## 🧪 工作流程

```
子弹update()
  ├─ 保存上一帧位置 previousX, previousY
  ├─ 根据 speedVector 更新位置
  └─ 出界检查

碰撞检测
  ├─ 扫描覆盖的瓦片
  ├─ 如果碰到砖块：
  │  ├─ 检测碰撞面 (Top/Bottom/Left/Right)
  │  ├─ 如果 canStillBounce() ✓
  │  │  ├─ 计算反射向量
  │  │  ├─ 调用 setReflection()
  │  │  └─ 销毁砖块
  │  └─ 否则 ✗
  │     └─ 销毁砖块，子弹停止
  └─ 继续遍历
```

---

## 📊 测试结果

```
=== 测试汇总 ===
总体通过: 9/9 (100.0%)

✅ 反射向量计算: 4/4
✅ 碰撞面识别: 4/4
✅ 完整反弹流程: 1/1

✓ 所有测试通过！
```

运行验证：
```bash
node verify-bounce.js
```

---

## 🎮 游戏调试

### 启用/禁用反弹
```typescript
bullet.maxBounces = 0;  // 禁用反弹
bullet.maxBounces = 5;  // 启用，最多反弹5次
```

### 调整反弹强度
```typescript
bullet.bounceEnergyLoss = 1.0;   // 完美弹性（每次100%速度）
bullet.bounceEnergyLoss = 0.9;   // 自然（每次90%速度）
bullet.bounceEnergyLoss = 0.7;   // 阻尼大（每次70%速度）
```

### 观察反弹状态
```typescript
console.log(`反弹次数: ${bullet.bounceCount}/${bullet.maxBounces}`);
console.log(`是否活跃: ${bullet.active}`);
console.log(`速度: (${bullet.speedVector.x}, ${bullet.speedVector.y})`);
```

---

## ⚠️ 常见问题

**Q: 子弹为什么不反弹？**
A: 检查 `bullet.maxBounces > 0` 和 `bullet.canStillBounce()` 返回值

**Q: 反弹后速度太快/太慢？**
A: 调整 `bounceEnergyLoss` 参数 (0-1)

**Q: 碰撞面识别错误？**
A: 确认 `previousX/previousY` 在 update() 前正确保存

**Q: 子弹卡住了？**
A: 增加 `maxBounces` 或减小 `bounceEnergyLoss`

---

## 📈 性能

| 操作 | 复杂度 | 说明 |
|------|--------|------|
| 反弹检测 | O(1) | 简单比较 |
| 反射计算 | O(1) | 向量数学 |
| 碰撞处理 | O(n) | n=覆盖的瓦片数 |

**优化建议：**
- 碰撞时才计算反射（已实现）
- 能量衰减防止无限循环（已实现）
- 避免三角函数（已使用向量）

---

## 🔗 相关文件

- 详细实现: `BOUNCE_IMPLEMENTATION.md`
- 验证脚本: `verify-bounce.js`
- 测试脚本: `test/bounce-mechanism.test.ts`

---

## 💡 下一步

1. 在实际游戏中测试
2. 调整参数以获得最佳游戏感
3. 考虑添加音效/特效
4. 优化性能（如需要）

**快速测试：**
```bash
npm run build
npm run dev
# 进入游戏，射击砖块观察反弹效果
```
