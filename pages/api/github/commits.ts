import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import db from "../../../lib/prismadb";
import { Octokit, App } from "octokit";

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

  if (!account?.access_token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const octokit = new Octokit({
    auth: account?.access_token,
  });
  const result = await octokit.request(`GET /repos/${req.query.repo}/commits`, {
    owner: "OWNER",
    repo: "REPO",
  });
  res.json(result.data);
}
