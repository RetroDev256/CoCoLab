import pool from './db.mjs'
import index from './public/index.html'
import aboutDevs from './public/pages/aboutDevs.html'
import contactUs from './public/pages/contactUs.html'
import sitePlan from './public/pages/sitePlan.html'
import userSettings from './public/pages/userSettings.html'
import projectBoard from './public/pages/projectBoard.html'
import projectManager from './public/pages/projectManager.html'
import forms from './public/pages/forms.html'

// PORT=[port here] bun run server.js
const PORT = Bun.env.PORT ?? 3000

// TODO: do something with these forms
// TODO: um idk

Bun.serve({
	// Listen on all interfaces
	hostname: '0.0.0.0',
	port: PORT,

	routes: {
		'/': index,
		'/aboutDevs': aboutDevs,
		'/contactUs': contactUs,
		'/sitePlan': sitePlan,
		'/forms': forms,
		'/userSettings': userSettings,
		'/projectBoard': projectBoard,
		'/projectManager': projectManager,
		'/api/*': {
			POST: async (req) => {
				const form_data = await req.formData()

				try {
					const api_response = await apiPost(req.url, form_data)
					if (api_response) return api_response
				} catch (err) {
					// Just in case we have out-of-band errors, like for SQL
					console.log(`POST error encountered: ${err} --- FORM DATA:`)
					// Log the offending form data for debugging
					for (const [key, value] of form_data.entries())
						console.log(JSON.stringify({ key, value }))
					return Response.json(err, { status: 500 })
				}
			},
			GET: async (req) => {
				try {
					// API endpoints for fetching data from each SQL table
					const api_response = await apiGet(req.url)
					if (api_response) return api_response
				} catch (err) {
					// Just in case we have out-of-band errors, like for SQL
					console.log(`GET error encountered: ${err}`)
					return Response.json(err, { status: 500 })
				}
			},
		},
	},
})

// We can access the website at this address:
console.log(`Server running at http://0.0.0.0:${PORT}`)
