import { defineMiddleware } from "astro:middleware";
import { getSession } from "auth-astro/server";

const PUBLIC_ROUTES = ["/login"];
const PUBLIC_PREFIXES = ["/api/auth/"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPublic) return next();

  const session = await getSession(context.request);
  if (!session) return context.redirect("/login");

  return next();
});
