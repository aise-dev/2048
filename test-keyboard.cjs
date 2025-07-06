const puppeteer = require('puppeteer');

async function test2048Keyboard() {
  console.log('启动 Puppeteer 测试...');
  
  const browser = await puppeteer.launch({
    headless: false, // 设置为 false 以便观察测试过程
    slowMo: 1000, // 放慢操作速度，便于观察
  });
  
  const page = await browser.newPage();
  
  // 监听控制台日志
  page.on('console', msg => {
    console.log('浏览器控制台:', msg.text());
  });
  
  try {
    console.log('正在访问游戏页面...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    console.log('等待游戏加载...');
    await page.waitForSelector('.game-container', { timeout: 10000 });
    
    // 点击游戏容器以确保获得焦点
    console.log('点击游戏容器以获得焦点...');
    await page.click('.game-container');
    
    // 等待一下确保焦点设置完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('开始测试键盘控制...');
    
    // 测试 W 键
    console.log('测试 W 键 (向上)...');
    await page.keyboard.press('w');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 测试 A 键
    console.log('测试 A 键 (向左)...');
    await page.keyboard.press('a');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 测试 S 键
    console.log('测试 S 键 (向下)...');
    await page.keyboard.press('s');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 测试 D 键
    console.log('测试 D 键 (向右)...');
    await page.keyboard.press('d');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 再次测试 D 键
    console.log('再次测试 D 键...');
    await page.keyboard.press('d');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 测试其他键
    console.log('测试其他键 (应该被忽略)...');
    await page.keyboard.press('q');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('测试完成！');
    
    // 等待一下以便观察结果
    await new Promise(resolve => setTimeout(resolve, 3000));
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  } finally {
    await browser.close();
    console.log('浏览器已关闭');
  }
}

// 运行测试
test2048Keyboard().catch(console.error); 