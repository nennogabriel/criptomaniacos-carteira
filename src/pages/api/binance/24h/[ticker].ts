import type { NextApiRequest, NextApiResponse } from "next";
import { binanceApi } from "../../../../services/binanceApi";

interface Change24Props {
  [k: string]: string;
}

var changes: Change24Props = {};

const changeUpdateInterval = 30000;
var lastChangeDataUpdate = 0;

async function updateChanges() {
  if (new Date().getTime() < lastChangeDataUpdate + changeUpdateInterval)
    return;
  const responseChanges = await binanceApi.get("/ticker/24hr");

  changes = Object.fromEntries(
    responseChanges.data.map((item) => [
      item.symbol.toUpperCase(),
      item.priceChangePercent,
    ])
  );

  lastChangeDataUpdate = new Date().getTime();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let ticker = req.query.ticker as string;
  ticker = ticker.toUpperCase();

  updateChanges().then(() => {
    const tickerChange = changes[ticker];
    if (tickerChange) {
      return res.status(200).json(tickerChange);
    } else {
      return res.status(404).json("ticker not found");
    }
  });
}
