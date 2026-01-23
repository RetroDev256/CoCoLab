// PORT=[port here] bun run server.js
const PORT = Bun.env.PORT ?? 3000

Bun.serve({
	// Listen on all interfaces
	hostname: '0.0.0.0',
	port: PORT,

	async fetch(req) {
		// The path of each request is locked to within the public folder.
		// Navigating to the root path / will access index.html by default.
		const url = new URL(req.url)

		// Example API route
		// if (url.pathname === "/api/hello") {
		//     return Response.json({ message: "Hello from Bun!" });
		// }

		// Serve static files
		const path = url.pathname === '/' ? '/index.html' : url.pathname
		// The client is sending data to the server
		if (req.method === 'POST') {
			// TODO: we can switch on the URL and req_data here
			// const req_data = await req.json(); // data they sent
			return new Response('YOU DARE ASK DATA OF ME!?!?')
		}

		// The client is requesting data from the server
		if (req.method === 'GET') {
			const file = Bun.file(`./public${path}`)
			return (await file.exists())
				? new Response(file)
				: new Response('oops!', { status: 404 })
		}
	},
})

// For the machine running this, it also means we can access it at that addr
console.log(`Server running at http://0.0.0.0:${PORT}`)
