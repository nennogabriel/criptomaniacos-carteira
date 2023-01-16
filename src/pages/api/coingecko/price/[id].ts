import type { NextApiRequest, NextApiResponse } from "next";
import { coinGecko } from "../../../../services/api";

interface PriceProps {
  [k: string]: string;
}

var prices: PriceProps = {};

const priceUpdateInterval = 30000;
var lastPriceDataUpdate = 0;

async function updatePrices(id: string) {
  if (new Date().getTime() < lastPriceDataUpdate + priceUpdateInterval && Object.keys(prices).includes(id)) return;
  const responsePrice = await coinGecko.get(`/simple/price?ids=${id}&vs_currencies=usd`);

  prices[id] = responsePrice.data[id].usd;

  lastPriceDataUpdate = new Date().getTime();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let id = req.query.id as string;

  updatePrices(id).then(() => {
    const tickerPrice = prices[id];
    if (tickerPrice) {
      return res.status(200).json(tickerPrice);
    } else {
      return res.status(404).json("ticker not found");
    }
  });
}
