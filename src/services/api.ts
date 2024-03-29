import axios from "axios";

axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.patch["Content-Type"] = "application/json";
axios.defaults.headers.put["Content-Type"] = "application/json";
axios.defaults.timeout = 2000;

const api = axios.create({
  baseURL: `/api`,
});

const binance = axios.create({
  baseURL: "https://api.binance.us/api/v3",
});

const coinGecko = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
});

export { api, binance, coinGecko };
