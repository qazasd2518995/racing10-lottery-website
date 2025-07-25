// 测试开奖网 API 连接的脚本

async function testAPIConnection() {
  console.log('=== 测试开奖网 API 连接 ===\n');
  
  // 1. 测试本地 API
  console.log('1. 测试本地 game-state API...');
  try {
    const localResponse = await fetch('http://localhost:3002/api/game-state');
    const localData = await localResponse.json();
    console.log('✅ 本地 API 回应:', JSON.stringify(localData, null, 2));
  } catch (error) {
    console.error('❌ 本地 API 错误:', error.message);
  }
  
  console.log('\n2. 测试主游戏 API...');
  try {
    const gameResponse = await fetch('https://bet-game-vcje.onrender.com/api/game-data');
    const gameData = await gameResponse.json();
    console.log('✅ 主游戏 API 回应:');
    console.log('- 期号:', gameData.gameData?.currentPeriod);
    console.log('- 倒数:', gameData.gameData?.countdownSeconds, '秒');
    console.log('- 状态:', gameData.gameData?.status);
    console.log('- 有 serverTime?', !!gameData.gameData?.serverTime);
    console.log('- 有 nextDrawTime?', !!gameData.gameData?.nextDrawTime);
  } catch (error) {
    console.error('❌ 主游戏 API 错误:', error.message);
  }
  
  console.log('\n3. 测试开奖网是否正确获取主游戏数据...');
  setTimeout(async () => {
    try {
      const response = await fetch('http://localhost:3002/api/game-state');
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ 开奖网成功获取数据:');
        console.log('- 期号:', data.data.current_period);
        console.log('- 倒数:', data.data.countdown_seconds, '秒');
        console.log('- 状态:', data.data.status);
        console.log('- 最后结果:', data.data.last_result);
      } else {
        console.log('❌ 获取失败:', data.message);
      }
    } catch (error) {
      console.error('❌ 请求错误:', error.message);
    }
  }, 2000);
}

// 执行测试
testAPIConnection();