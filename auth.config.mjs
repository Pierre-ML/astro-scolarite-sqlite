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
  // Pin cookie names/Secure flag instead of letting @auth/core infer them
  // per-request from `new URL(request.url).protocol`. That inference
  // depends on req.socket.encrypted, which our server.mjs only sets when
  // it trusts the immediate peer (see server.mjs) — if Apache's proxy
  // connection ever comes from an untrusted/unexpected address, or a
  // request slips through some other path, cookies could silently fall
  // back to non-Secure, non-`__Secure-`-prefixed names. Since this app is
  // only ever served over HTTPS in production, hardcode it here so
  // session cookies are always `__Secure-`/`__Host-` prefixed and marked
  // Secure, with no per-request guessing involved. Left unset in dev
  // (import.meta.env.PROD is false) so `astro dev` over plain http still
  // works locally.
  useSecureCookies: import.meta.env.PROD,
  pages: { signIn: "/login" },
  callbacks: {
    redirect({ baseUrl }) {
      return `${baseUrl}/`;
    },
  },
});
