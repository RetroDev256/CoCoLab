Bun.serve({
    port: 80,

    fetch(req) {
        const url = new URL(req.url);

        // Example API route
        // if (url.pathname === "/api/hello") {
        //     return Response.json({ message: "Hello from Bun!" });
        // }

        // Serve static files
        const filePath = url.pathname === "/" ? "/index.html" : url.pathname;

        const file = Bun.file(`./public${filePath}`);

        return file.exists()
            ? new Response(file)
            : new Response("Not found", { status: 404 });
    },
});

// For the machine running this, it also means we can access it at that addr
console.log("Server running at http://localhost:80");
