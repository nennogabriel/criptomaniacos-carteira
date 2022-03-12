import axios from "axios";

export const telegramBotApi = axios.create({
  baseURL: process.env.TELEGRAM_BOT_URL,
  headers: { Authorization: process.env.TELEGRAM_AUTH_TOKEN },
});
