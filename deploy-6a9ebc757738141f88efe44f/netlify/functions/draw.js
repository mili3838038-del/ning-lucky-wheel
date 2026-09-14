exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const body = JSON.parse(event.body);

        // 你的 Google 網址
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUd3pEdG9Ljxt3L12NjI0cmid1hiLUDXaKRRSeksQdojX_WiArW04yJ6e7M6CKttSgCA/exec";

        // 關鍵修改：將資料綁在網址後面，改用 GET 請求，徹底避開 Google 的 POST 轉址卡死 Bug
        const fetchUrl = `${GOOGLE_SCRIPT_URL}?username=${encodeURIComponent(body.username)}&code=${encodeURIComponent(body.code)}`;

        const response = await fetch(fetchUrl, {
            method: 'GET'
        });

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Server Error", details: error.message }) };
    }
}
