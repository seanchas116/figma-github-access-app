import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import FigmaProvider from "../../../lib/auth/figma";
import db from "../../../lib/prismadb";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    FigmaProvider({
      clientId: process.env.FIGMA_ID as string,
      clientSecret: process.env.FIGMA_SECRET as string,
    }),
  ],
  callbacks: {
    // https://github.com/nextauthjs/next-auth/issues/5924
    async signIn({ account }) {
      if (!account) {
        return true;
      }

      const dbAccount = await db.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        select: { id: true },
      });

      if (!dbAccount) return true;

      await db.account.update({
        where: { id: dbAccount.id },
        data: account,
      });
      return true;
    },
  },
};
export default NextAuth(authOptions);
