/* ==========================================================================
   OSMOVERA — deployment worker
   Serves the static site in /public through Cloudflare Workers static assets,
   returns the custom 404 page for unknown paths, and adds baseline security
   headers. No server logic is required: the site is pure HTML, CSS and JS.
   ========================================================================== */

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; " +
    "script-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'self'; " +
    "form-action 'self'; frame-ancestors 'none'"
};

export default {
  async fetch(request, env) {
    let response = await env.ASSETS.fetch(request);

    // Serve the custom 404 page (public/404.html) for unknown paths requested
    // by a browser, while still answering with a real 404 status code.
    if (response.status === 404 && request.method === "GET") {
      const accept = request.headers.get("accept") || "";
      if (accept.includes("text/html")) {
        const notFoundUrl = new URL("/404.html", request.url).toString();
        const notFound = await env.ASSETS.fetch(notFoundUrl);
        if (notFound.ok) {
          response = new Response(notFound.body, {
            status: 404,
            statusText: "Not Found",
            headers: notFound.headers
          });
        }
      }
    }

    // Clone the response so headers can be modified without consuming the body.
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      headers.set(key, value);
    }

    // HTML is always revalidated; other static assets get a day of edge caching.
    const url = new URL(request.url);
    const isHtml =
      url.pathname === "/" ||
      url.pathname.endsWith(".html") ||
      (headers.get("content-type") || "").includes("text/html");

    headers.set(
      "Cache-Control",
      isHtml ? "no-cache" : "public, max-age=86400, stale-while-revalidate=604800"
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
