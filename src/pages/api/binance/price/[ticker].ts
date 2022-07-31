import type { NextApiRequest, NextApiResponse } from 'next';
import { binance } from '../../../../services/api';

interface PriceProps {
  [k: string]: string;
}

var prices: PriceProps = {};

const priceUpdateInterval = 30000;
var lastPriceDataUpdate = 0;

async function updatePrices() {
  if (new Date().getTime() < lastPriceDataUpdate + priceUpdateInterval) return;
  const responsePrices = await binance.get('/ticker/price');

  prices = Object.fromEntries(
    responsePrices.data.map((item: any) => [
      item.symbol.toUpperCase(),
      item.price,
    ])
  );

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
      return res.status(404).json('ticker not found');
    }
  });
}
