import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

interface Change24Props {
  [k: string]: string;
}

var changes: Change24Props = {};

const changesUrlApi = "https://api.binance.com/api/v3/ticker/24hr";

const changeUpdateInterval = 30000;
var lastChangeDataUpdate = 0;

async function updateChanges() {
  if (new Date().getTime() < lastChangeDataUpdate + changeUpdateInterval)
    return;
  const responseChanges = await axios.get(changesUrlApi);

  changes = Object.fromEntries(
    responseChanges.data.map((item) => [
      item.symbol.toUpperCase(),
      item.priceChangePercent,
    ])
  );

  console.log("changes cache updated.");

  lastChangeDataUpdate = new Date().getTime();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  updateChanges().then(() => {
    res.status(200).json(changes);
  });
}
