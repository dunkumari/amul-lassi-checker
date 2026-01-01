import puppeteer from "puppeteer";

const PRODUCT_URL =
  "https://shop.amul.com/en/product/amul-high-protein-plain-lassi-200-ml-or-pack-of-30";

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
  await page.waitForSelector("input[type='text']", { timeout: 15000 });
  await page.type("input[type='text']", PINCODE, { delay: 100 });
  await page.keyboard.press("Enter");

  // ✅ Proper wait (FIX)
  await new Promise(resolve => setTimeout(resolve, 5000));

  const pageText = await page.evaluate(() => document.body.innerText);

  if (pageText.includes("Add to Cart")) {
    await sendTelegramMessage(
      `🔥 <b>Amul High Protein Lassi AVAILABLE</b>\n📍 Pincode: ${PINCODE}\n\n${PRODUCT_URL}`
    );
    console.log("AVAILABLE – Telegram sent");
  } else {
    console.log("Still out of stock for pincode", PINCODE);
  }

  await browser.close();
}

checkAvailability().catch(err => {
  console.error(err);
  process.exit(1);
});
