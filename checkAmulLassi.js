import axios from "axios";
import cheerio from "cheerio";

const PRODUCT_URL =
  "https://shop.amul.com/en/product/amul-high-protein-plain-lassi-200-ml-or-pack-of-30";

const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const CHAT_ID = process.env.TG_CHAT_ID;

async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await axios.post(url, {
    chat_id: CHAT_ID,
    text: message,
    parse_mode: "HTML",
  });
}

async function checkAvailability() {
  const { data } = await axios.get(PRODUCT_URL, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const $ = cheerio.load(data);
  const pageText = $("body").text();

  if (pageText.includes("Add to Cart")) {
    await sendTelegramMessage(
      `🔥 <b>Amul High Protein Lassi is AVAILABLE!</b>\n\n${PRODUCT_URL}`
    );
  } else {
    console.log("Still out of stock");
  }
}

checkAvailability();
