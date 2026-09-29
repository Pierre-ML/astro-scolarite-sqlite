import Google from "@auth/core/providers/google";
import { defineConfig } from "auth-astro";

export default defineConfig({
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
      // Force Google to show the account chooser + consent screen on
      // every sign-in, instead of silently re-authenticating via
      // Google's own SSO session. Without this, once a browser has an
      // active accounts.google.com session, signIn("google") skips
      // straight past the picker after our app's own logout.
      authorization: {
        params: { prompt: "select_account consent" },
      },
    }),
  ],
  secret: import.meta.env.AUTH_SECRET,
  trustHost: true,
  pages: { signIn: "/login" },
  callbacks: {
    redirect({ baseUrl }) {
      return `${baseUrl}/`;
    },
  },
});
