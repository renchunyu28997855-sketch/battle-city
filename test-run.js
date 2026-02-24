const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('打开游戏...');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // 截图
  await page.screenshot({ path: 'tmp/menu.png' });
  console.log('菜单截图已保存: tmp/menu.png');
  
  // 按 Enter 开始游戏
  console.log('按 Enter 开始游戏...');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  
  // 截图游戏画面
  await page.screenshot({ path: 'tmp/game.png' });
  console.log('游戏截图已保存: tmp/game.png');
  
  // 测试移动
  console.log('测试移动...');
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(500);
  
  // 测试射击
  console.log('测试射击...');
  await page.keyboard.press('Space');
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'tmp/after-shot.png' });
  console.log('射击后截图已保存: tmp/after-shot.png');
  
  // 获取控制台日志
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console Error:', msg.text());
    }
  });
  
  console.log('测试完成！');
  await browser.close();
})();
