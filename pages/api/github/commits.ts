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
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  console.log(token);

  const account = await db.account.findFirst({
    where: {
      userId: token.sub,
      provider: "github",
    },
  });

  const fetchRes = await fetch(
    "https://api.github.com/repos/" + req.query.repo + "/commits",
    {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + account?.access_token,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  const json = await fetchRes.json();
  res.json(json);
}
