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
		'/userSettings': userSettings,
		'/projectBoard': projectBoard,
		'/projectManager': projectManager,
	},

	fetch: async (req) => {
		console.log(req.url)
	},
})

// Exposes POST endpoints under /api/ for each SQL table
async function apiPost(url, data) {
	// -------------------------------------------------------- INSERTING USERS
	if (url.pathname === '/api/users') {
		const result = await pool.query(
			`INSERT INTO users (
                first_name, last_name, email, phone_number, other_link
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;`,
			[
				data.get('first_name'),
				data.get('last_name'),
				data.get('email'),
				data.get('phone_number'),
				data.get('other_link'),
			],
		)

		// Return HTTP "successfully created" & the created row
		return Response.json(result.rows[0], { status: 201 })
	}

	// ----------------------------------------------------- INSERTING PROJECTS
	if (url.pathname === '/api/project') {
		const result = await pool.query(
			`INSERT INTO project (project_name, max_people, details)
            VALUES ($1, $2, $3)
            RETURNING *;`,
			[
				data.get('project_name'),
				data.get('max_people'),
				data.get('details'),
			],
		)

		// Return HTTP "successfully created" & the created row
		return Response.json(result.rows[0], { status: 201 })
	}

	// ------------------------------------------------ INSERTING CATEGORY TAGS
	if (url.pathname === '/api/category_tags') {
		const result = await pool.query(
			`INSERT INTO category_tags (name)
            VALUES ($1)
            RETURNING *;`,
			[data.get('name')],
		)

		// Return HTTP "successfully created" & the created row
		return Response.json(result.rows[0], { status: 201 })
	}

	// ------------------------------------------------- INSERTING PROJECT TAGS
	if (url.pathname === '/api/projects_tags') {
		const result = await pool.query(
			`INSERT INTO projects_tags (project_id, tag_id)
            VALUES ($1, $2)
            RETURNING *;`,
			[data.get('project_id'), data.get('tag_id')],
		)

		// Return HTTP "successfully created" & the created row
		return Response.json(result.rows[0], { status: 201 })
	}

	// ---------------------------------------------- INSERTING PROJECT MEMBERS
	if (url.pathname === '/api/project_members') {
		const result = await pool.query(
			`INSERT INTO project_members (user_id, project_id, role)
            VALUES ($1, $2, $3)
            RETURNING *;`,
			[data.get('user_id'), data.get('project_id'), data.get('role')],
		)

		// Return HTTP "successfully created" & the created row
		return Response.json(result.rows[0], { status: 201 })
	}

	return null
}

// Exposes GET endpoints under /api/ for each SQL table
async function apiGet(url) {
	const table_list = [
		'users', // accessible at /api/users
		'project', // accessible at /api/project
		'category_tags', // accessible at /api/category_tags
		'projects_tags', // accessible at /api/projects_tags
		'project_members', // accessible at /api/project_members
	]

	for (const table of table_list) {
		if (url.pathname === `/api/${table}`) {
			const query = `SELECT * FROM ${table};`
			const result = await pool.query(query)
			return Response.json(result.rows)
		}
	}

	return null
}

// We can access the website at this address:
console.log(`Server running at http://0.0.0.0:${PORT}`)
