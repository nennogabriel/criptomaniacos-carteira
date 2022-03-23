import { query as q } from "faunadb";
import { NextApiRequest, NextApiResponse } from "next";
import { fauna } from "../../../services/fauna";

interface DataProps {
  huggy: boolean;
}

interface ResponseProps {
  data?: DataProps;
}

var data: DataProps = { huggy: true };

const dataUpdateInterval = 30000;
var lastDataUpdate = 0;

async function lazyUpdate() {
  if (new Date().getTime() > lastDataUpdate + dataUpdateInterval) {
    const response: ResponseProps = await fauna.query(
      q.Get(q.Ref(q.Collection("status"), "326958903285776977"))
    );

    data = response.data;
  }
  lastDataUpdate = new Date().getTime();
  return data;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { token, huggy } = req.body;
    if (!token || token != process.env.N8N_TOKEN) {
      return res.status(401).json({ error: "Unauthorized user" });
    }
    const response: ResponseProps = await fauna.query(
      q.Update(q.Ref(q.Collection("status"), "326958903285776977"), {
        data: {
          huggy,
        },
      })
    );

    return res.json(response.data);
  } else if (req.method === "GET") {
    const data = await lazyUpdate();

    return res.json(data);
  }
}

export default handler;
