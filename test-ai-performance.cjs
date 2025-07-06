const puppeteer = require('puppeteer');

async function testAIPerformance() {
  console.log('启动AI性能测试...');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100, // 稍微放慢速度以便观察
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
    
    // 启动AI自动游戏
    console.log('启动AI自动游戏...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const aiButton = buttons.find(btn => btn.textContent.includes('AI自动游戏'));
      if (aiButton) {
        aiButton.click();
      } else {
        throw new Error('找不到AI自动游戏按钮');
      }
    });
    
    // 等待AI开始
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 设置AI速度为快速
    try {
      await page.select('.speed-control select', '100');
    } catch (error) {
      console.log('设置AI速度失败:', error.message);
    }
    
    console.log('AI开始自动游戏，观察性能...');
    
    // 监控游戏状态
    let lastScore = 0;
    let lastMaxTile = 0;
    let moveCount = 0;
    
    const monitorInterval = setInterval(async () => {
      try {
        const currentScore = await page.$eval('.score-value', el => parseInt(el.textContent) || 0);
        const cells = await page.$$eval('.board-cell', cells => 
          cells.map(cell => parseInt(cell.textContent) || 0)
        );
        const maxTile = Math.max(...cells);
        
        if (currentScore > lastScore) {
          console.log(`得分: ${currentScore} (+${currentScore - lastScore})`);
          lastScore = currentScore;
        }
        
        if (maxTile > lastMaxTile) {
          console.log(`最大数字: ${maxTile}`);
          lastMaxTile = maxTile;
        }
        
        moveCount++;
        
        // 检查游戏是否结束
        const gameOver = await page.$('.game-over-overlay');
        if (gameOver) {
          clearInterval(monitorInterval);
          console.log(`游戏结束！最终得分: ${currentScore}`);
          console.log(`总移动次数: ${moveCount}`);
          console.log(`最大数字: ${maxTile}`);
          
          // 等待一下以便观察最终结果
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // 如果移动次数过多，停止测试
        if (moveCount > 1000) {
          clearInterval(monitorInterval);
          console.log('达到最大移动次数限制，停止测试');
        }
        
      } catch (error) {
        console.error('监控过程中出现错误:', error);
        clearInterval(monitorInterval);
      }
    }, 1000);
    
    // 等待游戏结束或超时
    await new Promise(resolve => {
      setTimeout(() => {
        clearInterval(monitorInterval);
        resolve();
      }, 300000); // 5分钟超时
    });
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  } finally {
    await browser.close();
    console.log('浏览器已关闭');
  }
}

// 运行测试
testAIPerformance().catch(console.error); 