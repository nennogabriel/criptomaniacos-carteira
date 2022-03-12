import type { NextApiRequest, NextApiResponse } from "next";
import { binanceApi } from "../../../services/binanceApi";

interface PairProps {
  [k: string]: string;
}

var pairs: PairProps = {};

const pairUpdateInterval = 3000000;
var lastPairDataUpdate = 0;

async function updatePairs() {
  if (new Date().getTime() < lastPairDataUpdate + pairUpdateInterval) return;
  const responsePairs = await binanceApi.get("/ticker/pair");

  pairs = Object.fromEntries(
    responsePairs.data.map((item) => [item.symbol.toUpperCase(), item.pair])
  );

  lastPairDataUpdate = new Date().getTime();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  updatePairs().then(() => {
    res.status(200).json(pairs);
  });
}
