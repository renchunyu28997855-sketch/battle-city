import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 访问游戏
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // 截图
  await page.screenshot({ path: 'tmp/game.png' });
  
  // 获取页面标题
  const title = await page.title();
  console.log('Page title:', title);
  
  // 获取canvas
  const canvas = await page.$('canvas');
  console.log('Canvas found:', !!canvas);
  
  // 获取游戏画面内容
  const gameContent = await page.evaluate(() => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return 'Canvas not found';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'Canvas context not found';
    
    // 获取画布尺寸
    return `Canvas size: ${canvas.width}x${canvas.height}`;
  });
  
  console.log('Game content:', gameContent);
  
  // 模拟按键测试 - 按 Enter 开始游戏
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  
  // 截图
  await page.screenshot({ path: 'tmp/game-running.png' });
  
  console.log('测试完成！截图已保存到 tmp/game.png 和 tmp/game-running.png');
  
  await browser.close();
}

test().catch(console.error);
