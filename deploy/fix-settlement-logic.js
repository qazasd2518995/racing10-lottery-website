// fix-settlement-logic.js - 修復結算邏輯，防止重複結算

console.log(`
🔧 修復結算邏輯說明
===================

問題診斷：
1. 系統同時運行了兩套結算邏輯：
   - improved-settlement-system.js 的 improvedSettleBets（正確）
   - backend.js 的 legacySettleBets 中的餘額更新邏輯（導致重複）

2. 重複結算的流程：
   - improvedSettleBets 正確增加中獎金額（989元）
   - backend.js 第 2920 行又調用 UserModel.addBalance 增加餘額
   - backend.js 第 2924-2934 行調用代理系統 sync-member-balance API
   - 代理系統執行 MemberModel.setBalance，產生 "會員點數設置" 的 adjustment 交易

修復方案：
---------
請手動修改 backend.js 文件：

1. 註釋掉第 2906-2943 行的中獎處理邏輯：
   找到這段代碼：
   \`\`\`javascript
   // 如果贏了，直接增加會員餘額（不從代理扣除）
   if (isWin) {
     try {
       // ... 省略中間代碼 ...
       // 原子性增加會員餘額（增加總回報，因為下注時已扣除本金）
       const newBalance = await UserModel.addBalance(username, totalWinAmount);
       
       // 只同步餘額到代理系統（不扣代理點數）
       try {
         await fetch(\`\${AGENT_API_URL}/api/agent/sync-member-balance\`, {
           // ... 省略 ...
         });
       } catch (syncError) {
         console.warn('同步餘額到代理系統失敗，但會員餘額已更新:', syncError);
       }
       
       console.log(\`用戶 \${username} 中獎結算: ...\`);
     } catch (error) {
       console.error(\`更新用戶 \${username} 中獎餘額失敗:\`, error);
     }
   }
   \`\`\`

2. 將其替換為：
   \`\`\`javascript
   // 如果贏了，記錄日誌（餘額更新已在 improvedSettleBets 中處理）
   if (isWin) {
     console.log(\`用戶 \${username} 中獎，金額 \${winAmount}（餘額更新已在 improvedSettleBets 中處理）\`);
   }
   \`\`\`

3. 或者更簡單的方案，直接刪除整個 legacySettleBets 函數（第 2872-2958 行），
   因為它已經被標記為"備份"，實際上不應該被使用。

預防措施：
---------
1. 確保只有 improvedSettleBets 處理結算
2. 移除所有調用 sync-member-balance API 的代碼
3. 在 improved-settlement-system.js 中統一處理所有結算邏輯
4. 定期檢查是否有重複的 adjustment 交易

測試建議：
---------
修改後請進行以下測試：
1. 下注 900 元（9個號碼各 100 元）
2. 確認餘額減少 900 元
3. 等待開獎並中獎
4. 確認餘額增加 989 元（而不是 1978 元）
5. 檢查交易記錄，應該只有一筆 win 類型的交易，沒有 adjustment
`);

console.log('\n請按照上述說明手動修改 backend.js 文件。');