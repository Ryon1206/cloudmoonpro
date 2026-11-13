const API_URL = "https://ryon-api-test-3.onrender.com/api/hello";

async function start() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("通信に失敗しました");

    const data = await response.json();

    document.getElementById("message").textContent = data.message;
  } catch (error) {
    document.getElementById("message").textContent = "通信エラー";
    console.error(error);
  }
}

start();
