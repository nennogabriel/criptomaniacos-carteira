import { query as q } from "faunadb";
import { NextApiRequest, NextApiResponse } from "next";
import { fauna } from "../../../services/fauna";
import { getSession } from "next-auth/react";

interface ResponseProps {
  data: {
    name: string;
    assets: Array<string>;
  };
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (session?.status < 2) {
    return res.status(401).json({ error: "Unauthorized user" });
  }

  if (req.method === "POST") {
    const response: ResponseProps = await fauna.query(
      q.Update(q.Ref(q.Collection("wallets"), "325500421490606673"), {
        data: {
          assets: req.body.assets,
        },
      })
    );

    const { assets } = response.data;

    return res.json({ assets });
  } else if (req.method === "GET") {
    const response: ResponseProps = await fauna.query(
      q.If(
        q.Not(
          q.Exists(q.Match(q.Index("wallet_by_name"), q.Casefold("matheus")))
        ),

        q.Create(q.Collection("wallets"), {
          data: {
            name: "matheus",
            assets: ["BTC", "BUSD"],
          },
        }),

        q.Get(q.Match(q.Index("wallet_by_name"), q.Casefold("matheus")))
      )
    );

    const { assets } = response.data;

    return res.json({ assets });
  }
}

export default handler;
