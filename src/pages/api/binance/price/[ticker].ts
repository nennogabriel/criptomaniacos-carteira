import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

interface PriceProps {
  [k: string]: string;
}

var prices: PriceProps = {};

const pricesUrlApi = "https://api.binance.com/api/v3/ticker/price";

const priceUpdateInterval = 30000;
var lastPriceDataUpdate = 0;

async function updatePrices() {
  if (new Date().getTime() < lastPriceDataUpdate + priceUpdateInterval) return;
  const responsePrices = await axios.get(pricesUrlApi);

  prices = Object.fromEntries(
    responsePrices.data.map((item) => [item.symbol.toUpperCase(), item.price])
  );

  console.log("prices cache updated.");

  lastPriceDataUpdate = new Date().getTime();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let ticker = req.query.ticker as string;
  ticker = ticker.toUpperCase();

  updatePrices().then(() => {
    const tickerPrice = prices[ticker];
    if (tickerPrice) {
      return res.status(200).json(tickerPrice);
    } else {
      return res.status(404).json("ticker not found");
    }
  });
}
