import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import db from "../../../lib/prismadb";
import { Octokit, App } from "octokit";
import { z } from "zod";

const Query = z.object({
  owner: z.string(),
  repo: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const queryParsed = Query.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: "Bad Request" });
    return;
  }
  const query = queryParsed.data;

  const token = await getToken({
    req,
  });
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

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
  const result = await octokit.request("GET /repos/{owner}/{repo}/commits", {
    owner: query.owner,
    repo: query.repo,
  });
  res.json(result.data);
}
