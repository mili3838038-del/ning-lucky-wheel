exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const body = JSON.parse(event.body);
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUd3pEdG9Ljxt3L12NjI0cmid1hiLUDXaKRRSeksQdojX_WiArW04yJ6e7M6CKttSgCA/exec";

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // 新增這行確保 Google 讀得到資料
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Server Error" }) };
    }
}