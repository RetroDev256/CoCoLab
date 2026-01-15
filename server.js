// PORT=[port here] bun run server.js
const PORT = Bun.env.PORT ?? 3000;

Bun.serve({
    // Listen on all interfaces
    hostname: "0.0.0.0",
    port: PORT,

    fetch(req) {
        const url = new URL(req.url);

        // Example API route
        // if (url.pathname === "/api/hello") {
        //     return Response.json({ message: "Hello from Bun!" });
        // }

        // Serve static files
        const path = url.pathname === "/" ? "/index.html" : url.pathname;

        const file = Bun.file(`./public${path}`);

        return file.exists()
            ? new Response(file)
            : new Response("Not found", { status: 404 });
    },
});

// For the machine running this, it also means we can access it at that addr
console.log(`Server running at http://0.0.0.0:${PORT}`);
