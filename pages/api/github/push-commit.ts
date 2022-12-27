import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "octokit";
import { z } from "zod";
import { getGitHubToken } from "../../../helpers/api/gitHubToken";

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

  const accessToken = await getGitHubToken(req);
  if (!accessToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const octokit = new Octokit({ auth: accessToken });

  const ref = (
    await octokit.request("GET /repos/{owner}/{repo}/git/ref/{ref}", {
      owner: query.owner,
      repo: query.repo,
      ref: "heads/main",
    })
  ).data;

  console.log(ref);

  const currentCommit = (
    await octokit.request(
      "GET /repos/{owner}/{repo}/git/commits/{commit_sha}",
      {
        owner: query.owner,
        repo: query.repo,
        commit_sha: ref.object.sha,
      }
    )
  ).data;

  console.log(currentCommit);

  const time = new Date().toISOString();

  const tree = (
    await octokit.request("POST /repos/{owner}/{repo}/git/trees", {
      owner: query.owner,
      repo: query.repo,
      base_tree: currentCommit.tree.sha,
      tree: [
        {
          path: "file.txt",
          mode: "100644",
          type: "blob",
          content: "Hello World: " + time,
        },
      ],
    })
  ).data;

  console.log(tree);

  const commit = (
    await octokit.request("POST /repos/{owner}/{repo}/git/commits", {
      owner: query.owner,
      repo: query.repo,
      message: "Hello World: " + time,
      tree: tree.sha,
      parents: [currentCommit.sha],
    })
  ).data;

  console.log(commit);

  const newRef = (
    await octokit.request("PATCH /repos/{owner}/{repo}/git/refs/{ref}", {
      owner: query.owner,
      repo: query.repo,
      ref: "heads/main",
      sha: commit.sha,
    })
  ).data;

  console.log(newRef);

  res.json(newRef);
}
