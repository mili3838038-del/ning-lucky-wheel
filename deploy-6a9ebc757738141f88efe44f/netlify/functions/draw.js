const crypto = require('crypto');

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const body = JSON.parse(event.body);
        const username = body.username.trim();
        const code = body.code.trim();

        // 1. 取得今日日期 (設定為亞洲時區，確保換日時間正確)
        const today = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');

        // 2. 核心防弊：將「日期 + 帳號 + 代碼」組合成唯一金鑰
        const uniqueKey = `${today}-${username}-${code}`;
        
        // 3. 透過 MD5 雜湊演算法取代 Math.random()，確保同一天的結果絕對固定
        const hash = crypto.createHash('md5').update(uniqueKey).digest('hex');
        const rand = parseInt(hash.substring(0, 8), 16) / 0xffffffff;

        // 4. 計算機率 (今日內不管抽幾次，prizeIndex 都會一樣)
        let prizeIndex = 0;
        let prizeName = "8元";

        if (rand < 0.001) { prizeIndex = 4; prizeName = "388元"; }
        else if (rand < 0.01) { prizeIndex = 3; prizeName = "188元"; }
        else if (rand < 0.05) { prizeIndex = 2; prizeName = "88元"; }
        else if (rand < 0.20) { prizeIndex = 1; prizeName = "38元"; }
        else { prizeIndex = 0; prizeName = "8元"; }

        // 5. 組合網址並背景紀錄至 Google 試算表
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUd3pEdG9Ljxt3L12NjI0cmid1hiLUDXaKRRSeksQdojX_WiArW04yJ6e7M6CKttSgCA/exec";
        const fetchUrl = `${GOOGLE_SCRIPT_URL}?username=${encodeURIComponent(username)}&code=${encodeURIComponent(code)}&prize=${encodeURIComponent(prizeName)}&t=${Date.now()}`;

        const fetchPromise = fetch(fetchUrl, { method: 'GET' }).catch(() => {});
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
        await Promise.race([fetchPromise, timeoutPromise]);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                prizeIndex: prizeIndex,
                prizeName: prizeName
            })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Server Error" }) };
    }
}
