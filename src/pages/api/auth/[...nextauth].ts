import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

import { query as q } from "faunadb";
import { fauna } from "../../../services/fauna";
import { telegram } from "../../../services/api";

type UserProps = {
  role?: string;
};

export default NextAuth({
  // Configure one or more authentication providers
  secret: process.env.NEXTAUTH_SECRET,

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  pages: {
    signIn: "/auth/signin",
  },

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Telegram",
      credentials: {},
      authorize: async (credentials, req) => {
        const data = req.query;
        if (!data) {
          return null;
        }
        const { id, username, first_name } = data;

        let responseTelegramBot = await telegram.get(`/user_on_group/${id}`);

        const { valid } = responseTelegramBot.data;

        const user = {
          id,
          name: `${first_name} (@${username})`,
          email: `${id}@web.telegram.org`,
          role: valid ? 2 : 1,
        };

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      user?.role && (token.role = user.role);
      console.log("token: ", token);
      return token;
    },
    session: async ({ session, user, token }) => {
      console.log({ session, user, token });
      token?.role && (session.role = token.role);
      try {
        const faunaUserData = await fauna.query<UserProps>(
          q.Select(
            "data",
            q.Get(
              q.Match(q.Index("user_by_email"), q.Casefold(session.user.email))
            )
          )
        );
        session.role = faunaUserData.role || 1;
      } catch (err) {
        console.log("Error when tried to get user status");
      }

      return session;
    },

    signIn: async ({ user, account, profile, email, credentials }) => {
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
                role: user?.role || 1,
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
