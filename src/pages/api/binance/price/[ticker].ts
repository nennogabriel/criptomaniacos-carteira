import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const getPricesUrlApi = "http://localhost:3000/api/binance/getPrices";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let ticker = req.query.ticker as string;
  ticker = ticker.toUpperCase();

  axios.get(getPricesUrlApi).then((response) => {
    const price = response.data[ticker];
    if (price) {
      return res.status(200).json(price);
    } else {
      return res.status(404).json("ticker not found");
    }
  });
}
