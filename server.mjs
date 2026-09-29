// Wrapper around the @astrojs/node standalone entrypoint.
//
// Why this file exists:
// @astrojs/node (standalone mode) determines whether a request is "https"
// purely from `req.socket.encrypted` (see astro's core/app/node.js,
// createRequestFromNodeRequest). It never looks at X-Forwarded-Proto. Since
// Apache terminates TLS and proxies to this Node process in plain HTTP,
// every Request built by Astro — and therefore every URL auth-astro/@auth/core
// derive from it (signin URL, callback URL, redirect_uri sent to Google) —
// was permanently "http://...", causing Google's redirect_uri_mismatch.
// (AUTH_URL has no effect here either: auth-astro never calls @auth/core's
// setEnvDefaults()/createActionURL(), so that env var is never consulted.)
//
// Fix: run our own http.Server, and for requests coming from a trusted
// reverse proxy (Apache on localhost) that assert X-Forwarded-Proto: https,
// mark the socket as encrypted before handing the request to Astro's
// handler. Astro then builds https:// URLs everywhere, with no further
// config needed on the auth-astro / @auth/core side.
//
// Deployment: `npm start` now runs this file instead of
// `dist/server/entry.mjs` directly. Setting ASTRO_NODE_AUTOSTART=disabled
// before importing the built entry prevents it from starting its own
// server (this is the same flag @astrojs/node's own preview server uses).

// NOTE: this must be a dynamic import(), not a static `import … from`.
// Static ESM imports are hoisted above all other top-level statements
// regardless of source order, so setting ASTRO_NODE_AUTOSTART right
// before a static import would still run *after* entry.mjs's own
// module-level autostart check — letting it start its own server first
// and collide with ours on the same port.
process.env.ASTRO_NODE_AUTOSTART = "disabled";

const http = await import("node:http");
const { handler, options } = await import("./dist/server/entry.mjs");

// Only trust X-Forwarded-Proto from the loopback interface, i.e. from
// Apache running on the same host. Anything else keeps the raw (http)
// protocol, so a client can't spoof "https" over a direct connection.
const TRUSTED_PROXY_IPS = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

const port = process.env.PORT ? Number(process.env.PORT) : options.port ?? 8080;
const host = process.env.HOST ?? (options.host === true ? "0.0.0.0" : options.host || "localhost");

const server = http.default.createServer((req, res) => {
  const remoteAddress = req.socket.remoteAddress;
  const forwardedProto = req.headers["x-forwarded-proto"];
  const isFromTrustedProxy = remoteAddress && TRUSTED_PROXY_IPS.has(remoteAddress);

  if (isFromTrustedProxy && forwardedProto === "https") {
    // req.socket is a plain net.Socket here (not a TLSSocket), so
    // `encrypted` isn't defined yet and this plain assignment is safe.
    req.socket.encrypted = true;
  }

  handler(req, res);
});

server.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port} (behind reverse proxy: trusting X-Forwarded-Proto from ${[...TRUSTED_PROXY_IPS].join(", ")})`);
});
