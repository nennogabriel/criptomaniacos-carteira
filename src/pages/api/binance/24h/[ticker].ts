import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const getChangesUrlApi = `${process.env.SELF_HOST}/api/binance/get24hs`;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let ticker = req.query.ticker as string;
  ticker = ticker.toUpperCase();

  axios.get(getChangesUrlApi).then((response) => {
    const change = response.data[ticker];
    if (change) {
      return res.status(200).json(change);
    } else {
      return res.status(404).json("ticker not found");
    }
  });
}
