import axios from "axios";

axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.patch["Content-Type"] = "application/json";
axios.defaults.headers.put["Content-Type"] = "application/json";
axios.defaults.timeout = 2000;

const api = axios.create({
  baseURL: `/api`,
});

const binance = axios.create({
  baseURL: "https://api.binance.com/api/v3",
});

const telegram = axios.create({
  baseURL: process.env.TELEGRAM_BOT_URL,
  headers: { Authorization: process.env.TELEGRAM_AUTH_TOKEN },
});

export { api, binance, telegram };
