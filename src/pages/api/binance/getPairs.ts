import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

interface PairProps {
  [k: string]: string;
}

var pairs: PairProps = {};

const pairsUrlApi = "https://api.binance.com/api/v3/ticker/pair";

const pairUpdateInterval = 3000000;
var lastPairDataUpdate = 0;

async function updatePairs() {
  if (new Date().getTime() < lastPairDataUpdate + pairUpdateInterval) return;
  const responsePairs = await axios.get(pairsUrlApi);

  pairs = Object.fromEntries(
    responsePairs.data.map((item) => [item.symbol.toUpperCase(), item.pair])
  );

  console.log("pairs cache updated.");

  lastPairDataUpdate = new Date().getTime();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  updatePairs().then(() => {
    res.status(200).json(pairs);
  });
}
