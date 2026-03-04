// The SQL database that we can run queries on
import { apiPost, apiGet, apiOptions, apiDelete, apiPut } from "./api.js";

// HOST=[host here] PORT=[port here] bun run server.js
const PORT = Bun.env.PORT ?? 3000;
const HOST = Bun.env.HOST ?? "0.0.0.0";

Bun.serve({
    // Listen on all interfaces
    hostname: HOST,
    port: PORT,

    async fetch(req) {
        // The path of each request is locked to within the public folder.
        // Navigating to the root path / will access index.html by default.
        const url = new URL(req.url);

        // Serve static files
        const path = url.pathname === "/" ? "/index.html" : url.pathname;

        // ------------------------------------------- HANDLE DATA MODIFICATION
        let api_response;
        try {
            switch (req.method) {
                case "POST":
                    api_response = await apiPost(url, await getData(req));
                    break;
                case "GET":
                    const file = Bun.file(`./public${path}`);
                    if (await file.exists()) return cors(new Response(file));
                    api_response = await apiGet(url);
                case "OPTIONS":
                    api_response = await apiOptions();
                    break;
                case "PUT":
                    api_response = await apiPut(url, await getData(req));
                    break;
                case "DELETE":
                    api_response = await apiDelete(url);
                    break;
            }
            if (api_response) return cors(api_response);
        } catch (err) {
            // Just in case we have out-of-band errors
            console.log(`${req.method} ${url.pathname} failed:`, err);
            return cors(Response.json(err, { status: 500 }));
        }

        // If nothing above handled the request, send a 404 response
        return cors(new Response("404 not found.", { status: 404 }));
    },
});

async function getData(req) {
    return req.headers.get("content-type") !== "application/json"
        ? Object.fromEntries(await req.formData())
        : await req.json();
}

// Allow frontend fetches to work cross-origin
function cors(res) {
    const h = res.headers;
    h.set("Access-Control-Allow-Origin", "*");
    h.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    h.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res;
}

// We can access the website at this address:
console.log(`Server running at http://${HOST}:${PORT}`);
