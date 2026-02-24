const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 监听控制台消息
  page.on('console', msg => {
    console.log('Console:', msg.text());
  });
  
  console.log('打开游戏...');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // 截图菜单
  await page.screenshot({ path: 'tmp/menu.png' });
  console.log('菜单截图: tmp/menu.png');
  
  // 按 2 选择双人模式
  console.log('按 2 选择双人模式...');
  await page.keyboard.press('Digit2');
  await page.waitForTimeout(300);
  
  // 按 Enter 开始游戏
  console.log('按 Enter 开始游戏...');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  
  // 截图游戏画面
  await page.screenshot({ path: 'tmp/two-player.png' });
  console.log('双人模式截图: tmp/two-player.png');
  
  // 测试玩家2移动 (IJKL)
  console.log('测试玩家2移动 (IJKL)...');
  await page.keyboard.down('KeyI'); // 上
  await page.waitForTimeout(300);
  await page.keyboard.up('KeyI');
  await page.keyboard.down('KeyL'); // 右
  await page.waitForTimeout(300);
  await page.keyboard.up('KeyL');
  
  // 测试玩家2射击 (Enter)
  console.log('测试玩家2射击...');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  
  await page.screenshot({ path: 'tmp/two-player-test.png' });
  console.log('测试后截图: tmp/two-player-test.png');
  
  console.log('双人模式测试完成！');
  await browser.close();
})();
