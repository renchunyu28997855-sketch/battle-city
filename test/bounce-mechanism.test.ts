/**
 * 反弹机制测试脚本
 * 测试在不同场景下子弹的反弹行为
 */

import { Bullet, BulletDirection } from '../src/game/entities/Bullet';
import { Vector2D } from '../src/game/utils/Vector2D';

console.log('=== Battle City 子弹反弹机制测试 ===\n');

// 测试1: Vector2D反射计算
console.log('测试1: Vector2D反射计算');
console.log('-'.repeat(50));

const incidentVector = new Vector2D(100, -200); // 向下右进入
const normalTop = new Vector2D(0, 1); // 上方法向量

const reflectedVector = incidentVector.reflect(normalTop);
console.log(`入射向量: (${incidentVector.x}, ${incidentVector.y})`);
console.log(`法向量 (上方): (${normalTop.x}, ${normalTop.y})`);
console.log(`反射向量: (${reflectedVector.x}, ${reflectedVector.y})`);
console.log(`预期: X不变, Y反转 -> (100, 200)\n`);

// 测试2: 四个方向的反射
console.log('测试2: 四个方向的反射');
console.log('-'.repeat(50));

const testVectors = [
  { v: new Vector2D(0, -100), normal: new Vector2D(0, 1), face: '从上方反弹（垂直向下）' },
  { v: new Vector2D(0, 100), normal: new Vector2D(0, -1), face: '从下方反弹（垂直向上）' },
  { v: new Vector2D(-100, 0), normal: new Vector2D(1, 0), face: '从左方反弹（水平向右）' },
  { v: new Vector2D(100, 0), normal: new Vector2D(-1, 0), face: '从右方反弹（水平向左）' },
  { v: new Vector2D(71, -71), normal: new Vector2D(0, 1), face: '斜向反弹（从上方）' },
];

for (const { v, normal, face } of testVectors) {
  const reflected = v.reflect(normal);
  console.log(`${face}`);
  console.log(`  入射: (${v.x}, ${v.y}) -> 反射: (${reflected.x.toFixed(0)}, ${reflected.y.toFixed(0)})`);
}
console.log();

// 测试3: Bullet初始化和反弹状态
console.log('测试3: Bullet初始化和反弹状态');
console.log('-'.repeat(50));

const bullet = new Bullet();
const now = Date.now();

// 初始化子弹
const initSuccess = bullet.init(
  400, 300,  // 位置
  BulletDirection.Up,  // 方向
  now,
  1  // powerLevel
);

console.log(`初始化成功: ${initSuccess}`);
console.log(`子弹位置: (${bullet.x}, ${bullet.y})`);
console.log(`速度向量: (${bullet.speedVector.x}, ${bullet.speedVector.y})`);
console.log(`能否反弹: ${bullet.canStillBounce()}`);
console.log(`反弹次数: ${bullet.bounceCount}/${bullet.maxBounces}`);
console.log();

// 测试4: 反弹后的状态变化
console.log('测试4: 反弹后的状态变化');
console.log('-'.repeat(50));

const reflectionVector = new Vector2D(0, 192); // 向下反弹
bullet.setReflection(reflectionVector);

console.log(`反弹后位置: (${bullet.x}, ${bullet.y})`);
console.log(`反弹后速度向量: (${bullet.speedVector.x}, ${bullet.speedVector.y})`);
console.log(`是否处于反弹状态: ${bullet.isBounceBullet}`);
console.log(`反弹次数: ${bullet.bounceCount}/${bullet.maxBounces}`);
console.log(`能否继续反弹: ${bullet.canStillBounce()}`);
console.log();

// 测试5: 能量损失
console.log('测试5: 能量损失（阻尼）');
console.log('-'.repeat(50));

const bulletWithDamping = new Bullet();
bulletWithDamping.init(400, 300, BulletDirection.Right, now, 1);
bulletWithDamping.bounceEnergyLoss = 0.8; // 每次反弹损失20%速度

console.log(`初始速度: ${bulletWithDamping.speedVector.magnitude().toFixed(2)}`);

const testReflections = [
  new Vector2D(-192, 0),
  new Vector2D(192, 0),
  new Vector2D(-192, 0),
];

for (let i = 0; i < testReflections.length; i++) {
  bulletWithDamping.setReflection(testReflections[i]);
  const speed = bulletWithDamping.speedVector.magnitude();
  console.log(`反弹${i + 1}次: 速度 = ${speed.toFixed(2)} (能量衰减: ${Math.pow(0.8, i + 1).toFixed(3)})`);
  
  if (!bulletWithDamping.canStillBounce()) {
    console.log(`已达最大反弹次数，子弹停止活跃: ${!bulletWithDamping.active}`);
    break;
  }
}
console.log();

// 测试6: Update循环中的位置更新
console.log('测试6: Update循环中的位置更新');
console.log('-'.repeat(50));

const movingBullet = new Bullet();
movingBullet.init(400, 400, BulletDirection.Right, now, 1);
movingBullet.speedVector = new Vector2D(192, 0); // 向右，速度192像素/秒

console.log(`初始位置: (${movingBullet.x}, ${movingBullet.y})`);
console.log(`速度: (${movingBullet.speedVector.x}, ${movingBullet.speedVector.y})`);

const deltaTime = 0.1; // 100毫秒
movingBullet.update(deltaTime);

console.log(`更新后位置 (Δt=0.1s): (${movingBullet.x.toFixed(2)}, ${movingBullet.y.toFixed(2)})`);
console.log(`预期移动距离: ${(192 * deltaTime).toFixed(2)}像素`);
console.log(`实际移动距离: ${(movingBullet.x - 400).toFixed(2)}像素`);
console.log();

// 测试7: 多次反弹场景
console.log('测试7: 多次反弹场景模拟');
console.log('-'.repeat(50));

const bouncyBullet = new Bullet();
bouncyBullet.init(50, 50, BulletDirection.Down, now, 2); // 2级子弹
bouncyBullet.maxBounces = 5;
bouncyBullet.bounceEnergyLoss = 0.9;

console.log(`初始化: 位置(${bouncyBullet.x}, ${bouncyBullet.y}), 级别=${bouncyBullet.powerLevel}`);
console.log(`初始速度向量: (${bouncyBullet.speedVector.x}, ${bouncyBullet.speedVector.y})`);
console.log(`最多反弹: ${bouncyBullet.maxBounces}次\n`);

// 模拟连续反弹
const directions = [
  { reflect: new Vector2D(192, 192), face: '左下' },
  { reflect: new Vector2D(-192, 192), face: '右下' },
  { reflect: new Vector2D(-192, -192), face: '右上' },
  { reflect: new Vector2D(192, -192), face: '左上' },
  { reflect: new Vector2D(192, 192), face: '左下' },
];

for (const { reflect, face } of directions) {
  if (!bouncyBullet.canStillBounce()) break;
  
  const speedBefore = bouncyBullet.speedVector.magnitude();
  bouncyBullet.setReflection(reflect);
  const speedAfter = bouncyBullet.speedVector.magnitude();
  
  console.log(`反弹${bouncyBullet.bounceCount}: 向${face} | 速度 ${speedBefore.toFixed(0)} -> ${speedAfter.toFixed(0)} | 活跃=${bouncyBullet.active}`);
}

console.log(`\n最终状态: 反弹${bouncyBullet.bounceCount}次, 子弹活跃=${bouncyBullet.active}`);
console.log('\n=== 测试完成 ===');
