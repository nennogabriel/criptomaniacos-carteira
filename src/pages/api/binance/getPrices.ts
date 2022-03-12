import type { NextApiRequest, NextApiResponse } from "next";
import { binanceApi } from "../../../services/binanceApi";

interface PriceProps {
  [k: string]: string;
}

var prices: PriceProps = {};

const priceUpdateInterval = 30000;
var lastPriceDataUpdate = 0;

async function updatePrices() {
  if (new Date().getTime() < lastPriceDataUpdate + priceUpdateInterval) return;
  const responsePrices = await binanceApi.get("/ticker/price");

  prices = Object.fromEntries(
    responsePrices.data.map((item) => [item.symbol.toUpperCase(), item.price])
  );

  lastPriceDataUpdate = new Date().getTime();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  updatePrices().then(() => {
    res.status(200).json(prices);
  });
}
