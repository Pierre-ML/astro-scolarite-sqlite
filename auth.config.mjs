import Google from "@auth/core/providers/google";
import { defineConfig } from "auth-astro";

export default defineConfig({
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
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
