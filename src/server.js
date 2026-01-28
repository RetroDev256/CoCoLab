import pool from './db.mjs'
import index from './public/index.html'
import aboutDevs from './public/pages/aboutDevs.html'
import contactUs from './public/pages/contactUs.html'
import sitePlan from './public/pages/sitePlan.html'
import userSettings from './public/pages/userSettings.html'
import projectBoard from './public/pages/projectBoard.html'
import projectManager from './public/pages/projectManager.html'

// PORT=[port here] bun run server.js
const PORT = Bun.env.PORT ?? 3000

Bun.serve({
	// Listen on all interfaces
	hostname: '0.0.0.0',
	port: PORT,

	routes: {
		'/': index,
		'/aboutDevs': aboutDevs,
		'/contactUs': contactUs,
		'/sitePlan': sitePlan,
		'/userSettings': userSettings,
		'/projectBoard': projectBoard,
		'/projectManager': projectManager,
		'/api/display_sql': async (req) => {
			const result = await pool.query('SELECT * FROM users;')
			return new Response(JSON.stringify(result.rows))
		},
		'/api/add_one_sql': async (req) => {
			const query_template = `
                INSERT INTO users (first_name, last_name, email, phone_number)
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `

			const values = [
				'Hard',
				'Coded',
				'hardcoded@example.com',
				'+1 (000) 000-0000',
			]

			const result = await pool.query(query_template, values)
			return new Response(JSON.stringify(result.rows[0]))
		},
		'/api/clear_all_sql': async (req) => {
			_ = await pool.query('DELETE FROM users;')
			return new Response(JSON.stringify({ success: true }))
		},
	},
})

// For the machine running this, it also means we can access it at that addr
console.log(`Server running at http://0.0.0.0:${PORT}`)
