import puppeteer from "puppeteer";

const PRODUCT_URL =
  "https://shop.amul.com/en/product/amul-kool-protein-milkshake-or-vanilla-180-ml-or-pack-of-30";

const PINCODE = "560012";
const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const CHAT_ID = process.env.TG_CHAT_ID;

async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "HTML",
    }),
  });
}

async function checkAvailability() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(PRODUCT_URL, { waitUntil: "networkidle2" });

  // Enter pincode
  await page.waitForSelector("input[type='text']", { timeout: 20000 });
  await page.type("input[type='text']", PINCODE, { delay: 100 });
  await page.keyboard.press("Enter");

  // Wait for Amul API response to update UI
  await new Promise(resolve => setTimeout(resolve, 7000));

  // 🔥 RELIABLE STOCK CHECK
  const isAvailable = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.some(btn =>
      btn.innerText.toLowerCase().includes("add") &&
      !btn.disabled
    );
  });

  if (isAvailable) {
    await sendTelegramMessage(
      `🔥 <b>AMUL LASSI AVAILABLE</b>\n📍 Pincode: ${PINCODE}\n\n${PRODUCT_URL}`
    );
  } else {
    await sendTelegramMessage(
      `❌ <b>OUT OF STOCK</b>\n📍 Pincode: ${PINCODE}\n\nChecked successfully`
    );
  }

  await browser.close();
}

checkAvailability().catch(err => {
  console.error(err);
  process.exit(1);
});
