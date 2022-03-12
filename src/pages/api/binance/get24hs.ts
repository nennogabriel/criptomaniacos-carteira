import type { NextApiRequest, NextApiResponse } from "next";
import { binanceApi } from "../../../services/binanceApi";

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
  updateChanges().then(() => {
    res.status(200).json(changes);
  });
}
