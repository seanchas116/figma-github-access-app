import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import db from "../../../lib/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({
    req,
  });
  console.log(token);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const account = await db.account.findFirst({
    where: {
      userId: token.sub,
      provider: "figma",
    },
  });
  console.log(account);

  const accessToken = account?.access_token;
  if (!accessToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  console.log(req.query.id);

  const fetchRes = await fetch(
    "https://api.figma.com/v1/files/" + req.query.id,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );
  const json = await fetchRes.json();
  console.log(json);

  res.json(json);
}
