import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // ...add more providers here
    {
      id: "figma",
      name: "Figma",
      type: "oauth",
      authorization: {
        url: "https://www.figma.com/oauth",
        params: {
          scope: "file_read",
          response_type: "code",
        },
      },
      token: {
        url: "https://www.figma.com/api/oauth/token",
        async request(context) {
          const provider = context.provider;
          const res = await fetch(
            `https://www.figma.com/api/oauth/token?client_id=${provider.clientId}&client_secret=${provider.clientSecret}&redirect_uri=${provider.callbackUrl}&code=${context.params.code}&grant_type=authorization_code`,
            { method: "POST" }
          );
          const json = await res.json();
          return { tokens: json };
        },
      },
      userinfo: "https://api.figma.com/v1/me",
      profile(profile) {
        return {
          id: profile.id,
          name: `${profile.handle}`,
          email: profile.email,
          image: profile.img_url,
        };
      },
      clientId: process.env.FIGMA_ID,
      clientSecret: process.env.FIGMA_SECRET,
    },
  ],
};
export default NextAuth(authOptions);
