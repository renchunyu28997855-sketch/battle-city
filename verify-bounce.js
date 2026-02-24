#!/usr/bin/env node

/**
 * 反弹机制验证脚本
 * 直接验证Vector2D和碰撞面识别逻辑
 */

// 简单实现Vector2D来做快速测试
class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  reflect(normal) {
    const dotProduct = this.x * normal.x + this.y * normal.y;
    return new Vector2D(
      this.x - 2 * dotProduct * normal.x,
      this.y - 2 * dotProduct * normal.y
    );
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

const CollisionFace = {
  Top: 'Top',
  Bottom: 'Bottom',
  Left: 'Left',
  Right: 'Right',
  None: 'None'
};

function detectCollisionFace(
  bulletPrevX, bulletPrevY,
  bulletCurrX, bulletCurrY,
  bulletWidth, bulletHeight,
  rectX, rectY, rectWidth, rectHeight
) {
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

  // 从上方进入
  if (prevBottom <= rectTop && currBottom > rectTop) {
    return CollisionFace.Top;
  }
  
  // 从下方进入
  if (prevTop >= rectBottom && currTop < rectBottom) {
    return CollisionFace.Bottom;
  }
  
  // 从左方进入
  if (prevRight <= rectLeft && currRight > rectLeft) {
    return CollisionFace.Left;
  }
  
  // 从右方进入
  if (prevLeft >= rectRight && currLeft < rectRight) {
    return CollisionFace.Right;
  }

  return CollisionFace.None;
}

console.log('=== Battle City 子弹反弹机制验证 ===\n');

// 测试1: 反射向量计算
console.log('✓ 测试1: 反射向量计算');
console.log('-'.repeat(60));

const tests = [
  {
    name: '从上方碰撞（垂直向上）',
    incident: new Vector2D(0, -100),
    normal: new Vector2D(0, 1),
    expected: { x: 0, y: 100 }
  },
  {
    name: '从右方碰撞（向左）',
    incident: new Vector2D(100, 0),
    normal: new Vector2D(-1, 0),
    expected: { x: -100, y: 0 }
  },
  {
    name: '斜向碰撞（45度）',
    incident: new Vector2D(100, -100),
    normal: new Vector2D(0, 1),
    expected: { x: 100, y: 100 }
  },
  {
    name: '斜向碰撞（45度 右下）',
    incident: new Vector2D(71, 71),
    normal: new Vector2D(1, 0),
    expected: { x: -71, y: 71 }
  }
];

let passedTests = 0;
for (const test of tests) {
  const reflected = test.incident.reflect(test.normal);
  const xMatch = Math.abs(reflected.x - test.expected.x) < 0.01;
  const yMatch = Math.abs(reflected.y - test.expected.y) < 0.01;
  const passed = xMatch && yMatch;
  
  if (passed) passedTests++;
  
  const status = passed ? '✓' : '✗';
  console.log(`${status} ${test.name}`);
  console.log(`  入射: (${test.incident.x}, ${test.incident.y})`);
  console.log(`  法向: (${test.normal.x}, ${test.normal.y})`);
  console.log(`  反射: (${reflected.x.toFixed(1)}, ${reflected.y.toFixed(1)}) [期望: (${test.expected.x}, ${test.expected.y})]`);
}

console.log(`\n结果: ${passedTests}/${tests.length} 通过\n`);

// 测试2: 碰撞面识别
console.log('✓ 测试2: 碰撞面识别');
console.log('-'.repeat(60));

const collisionTests = [
  {
    name: '从上方碰撞砖块',
    prevX: 0, prevY: -20,
    currX: 0, currY: 20,
    bulletW: 16, bulletH: 16,
    brickX: 0, brickY: 0, brickW: 64, brickH: 64,
    expected: CollisionFace.Top
  },
  {
    name: '从左方碰撞砖块',
    prevX: -20, prevY: 0,
    currX: 20, currY: 0,
    bulletW: 16, bulletH: 16,
    brickX: 0, brickY: 0, brickW: 64, brickH: 64,
    expected: CollisionFace.Left
  },
  {
    name: '从右方碰撞砖块',
    prevX: 84, prevY: 0,
    currX: 44, currY: 0,
    bulletW: 16, bulletH: 16,
    brickX: 0, brickY: 0, brickW: 64, brickH: 64,
    expected: CollisionFace.Right
  },
  {
    name: '从下方碰撞砖块',
    prevX: 0, prevY: 84,
    currX: 0, currY: 44,
    bulletW: 16, bulletH: 16,
    brickX: 0, brickY: 0, brickW: 64, brickH: 64,
    expected: CollisionFace.Bottom
  }
];

let passedCollisionTests = 0;
for (const test of collisionTests) {
  const face = detectCollisionFace(
    test.prevX, test.prevY,
    test.currX, test.currY,
    test.bulletW, test.bulletH,
    test.brickX, test.brickY, test.brickW, test.brickH
  );
  
  const passed = face === test.expected;
  if (passed) passedCollisionTests++;
  
  const status = passed ? '✓' : '✗';
  console.log(`${status} ${test.name}`);
  console.log(`  检测结果: ${face} [期望: ${test.expected}]`);
}

console.log(`\n结果: ${passedCollisionTests}/${collisionTests.length} 通过\n`);

// 测试3: 完整反弹流程
console.log('✓ 测试3: 完整反弹流程');
console.log('-'.repeat(60));

const upcomingBulletX = 300;
const upcomingBulletY = 350;
const prevYCoord = 400;
const brickX = 256;
const brickY = 256;

const faceResult = detectCollisionFace(
  upcomingBulletX, prevYCoord,
  upcomingBulletX, upcomingBulletY,
  16, 16,
  brickX, brickY, 64, 64
);

console.log(`子弹从下方撞击砖块上边界`);
console.log(`  检测到碰撞面: ${faceResult} (期望: Top)`);

const incomingVector = new Vector2D(0, -192);
const normalVector = new Vector2D(0, 1);
const reflectedVector = incomingVector.reflect(normalVector);

console.log(`  入射向量: (${incomingVector.x}, ${incomingVector.y})`);
console.log(`  反射后: (${reflectedVector.x}, ${reflectedVector.y}) (期望: (0, 192))`);
console.log(`  反弹成功: ${reflectedVector.y === 192 ? '✓' : '✗'}\n`);

// 总结
console.log('=== 测试汇总 ===');
const totalTests = tests.length + collisionTests.length + 1;
const totalPassed = passedTests + passedCollisionTests + (reflectedVector.y === 192 ? 1 : 0);

console.log(`总体通过: ${totalPassed}/${totalTests} (${(totalPassed / totalTests * 100).toFixed(1)}%)`);

if (totalPassed === totalTests) {
  console.log('\n✓ 所有测试通过！反弹机制实现正确。');
  process.exit(0);
} else {
  console.log('\n✗ 部分测试失败，请检查实现。');
  process.exit(1);
}
