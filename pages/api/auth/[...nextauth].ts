import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prismadb";
import FigmaProvider from "../../../lib/auth/figma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
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
};
export default NextAuth(authOptions);
