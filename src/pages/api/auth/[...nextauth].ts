import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

import { query as q } from "faunadb";
import { fauna } from "../../../services/fauna";

type UserProps = {
  status: string;
};

export default NextAuth({
  // Configure one or more authentication providers
  secret: process.env.NEXTAUTH_SECRET,

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      try {
        const faunaUserData = await fauna.query<UserProps>(
          q.Select(
            "data",
            q.Get(
              q.Match(q.Index("user_by_email"), q.Casefold(session.user.email))
            )
          )
        );
        session.status = faunaUserData.status;
      } catch (err) {
        console.log("Error when tried to get user status");
      }

      return session;
    },

    async signIn({ user, account, profile, email, credentials }) {
      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(q.Index("user_by_email"), q.Casefold(user.email))
              )
            ),

            q.Create(q.Collection("users"), {
              data: {
                email: user.email,
                status: 0,
              },
            }),

            q.Get(q.Match(q.Index("user_by_email"), q.Casefold(user.email)))
          )
        );
        return true;
      } catch (err) {
        return false;
      }
    },
  },
});
