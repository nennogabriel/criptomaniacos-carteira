import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import axios from "axios";

const crmUrl = process.env.CRM_URL;
const crmToken = process.env.CRM_TOKEN;
const secret = process.env.NEXTAUTH_SECRET;
const googleId = process.env.GOOGLE_ID;
const googleSecret = process.env.GOOGLE_SECRET;

export default NextAuth({
  // Configure one or more authentication providers
  secret,

  jwt: {
    secret,
  },
  pages: {
    signIn: "/auth/signin",
  },

  providers: [
    GoogleProvider({
      clientId: googleId,
      clientSecret: googleSecret,
    }),
    CredentialsProvider({
      name: "Telegram",
      credentials: {},
      authorize: async (credentials, req) => {
        const data = req.query;
        if (!data) {
          return null;
        }
        const { id, first_name } = data;

        try {
          const crmResponse = await axios.get(
            `${crmUrl}/by-telegram-id/${id}`,
            {
              headers: {
                Authorization: crmToken,
              },
            }
          );
          const { data } = crmResponse;

          const valid = ["customer", "admin"].includes(
            data.auth["app-carteira-alt-factor"]
          );

          const user = {
            id,
            name: `${first_name}`,
            email: `${data.email}`,
            role: valid ? 2 : 1,
          };
          return user;
        } catch (err) {
          // console.log(err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      user?.role && (token.role = user.role);
      return token;
    },
    session: async ({ session, user, token }) => {
      token?.role && (session.role = token.role);
      if (user && user.email.endsWith("@criptomaniacos.io")) {
        session.role = 3;
      } else {
        try {
          const crmResponse = await axios.get(
            `${crmUrl}/by-telegram-id/${user.id}`,
            {
              headers: {
                Authorization: crmToken,
              },
            }
          );
          const { data } = crmResponse;
          const valid = ["customer", "admin"].includes(
            data.auth["app-carteira-alt-factor"]
          );
          session.role = valid ? 2 : 1;
        } catch (err) {
          console.log(err);
        }
      }

      return session;
    },

    signIn: async ({ user, account, profile, email, credentials }) => {
      try {
        const crmResponse = await axios.get(`${crmUrl}/by-email/${email}`, {
          headers: {
            Authorization: crmToken,
          },
        });
        const { data } = crmResponse;
        const valid = ["customer", "admin"].includes(
          data.auth["app-carteira-alt-factor"]
        );
        return valid;
      } catch (err) {
        console.log(err);
        return false;
      }
    },
  },
});
