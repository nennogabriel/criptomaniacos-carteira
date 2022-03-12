import axios from "axios";

export const binanceApi = axios.create({
  baseURL: "https://api.binance.com/api/v3",
});
