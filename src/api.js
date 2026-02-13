import pool from './db.mjs'
import { cors } from './server.js'
import { authRoutes } from './auth.js'

// Exposes POST endpoints under /api/ for each SQL table
export async function apiPost(url, data) {
	const auth = await authRoutes(url, data)
	if (auth) {
		return cors(auth)
	}
	// ----------------------------------------------------- INSERTING PROJECTS
	if (url.pathname === '/api/project') {
		const result = await pool.query(
			`INSERT INTO project (project_name, max_people, details, owner_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;`,
			[data.project_name, data.max_people, data.details, data.owner_id],
		)

		// Return HTTP "successfully created" & the created row
		return cors(Response.json(result.rows[0], { status: 201 }))
	}

	// ------------------------------------------------ INSERTING CATEGORY TAGS
	if (url.pathname === '/api/category_tags') {
		const result = await pool.query(
			`INSERT INTO category_tags (name)
            VALUES ($1)
            RETURNING *;`,
			[data.name],
		)

		// Return HTTP "successfully created" & the created row
		return cors(Response.json(result.rows[0], { status: 201 }))
	}

	// ------------------------------------------------- INSERTING PROJECT TAGS
	if (url.pathname === '/api/projects_tags') {
		const result = await pool.query(
			`INSERT INTO projects_tags (project_id, tag_id)
            VALUES ($1, $2)
            RETURNING *;`,
			[data.project_id, data.tag_id],
		)

		// Return HTTP "successfully created" & the created row
		return cors(Response.json(result.rows[0], { status: 201 }))
	}

	// ---------------------------------------------- INSERTING PROJECT MEMBERS
	if (url.pathname === '/api/project_members') {
		const result = await pool.query(
			`INSERT INTO project_members (user_id, project_id, role)
            VALUES ($1, $2, $3)
            RETURNING *;`,
			[data.user_id, data.project_id, data.role],
		)

		// Return HTTP "successfully created" & the created row
		return cors(Response.json(result.rows[0], { status: 201 }))
	}

	return null
}

// Exposes GET endpoints under /api/ for each SQL table
export async function apiGet(url) {
	// --- /api/TABLE/ID would parse to ["api", "TABLE", "ID"]
	const parts = url.pathname.split('/').filter(Boolean)
	const esc_ident = (v) => `"${String(v).replace(/"/g, '""')}"`
	const esc_value = (v) => `'${String(v).replace(/'/g, "''")}'`
	if (parts[0] !== 'api') return null

	switch (parts.length) {
		// /api returns special link
		case 1: {
			const link = 'https://youtu.be/dQw4w9WgXcQ'
			return cors(Response.redirect(link, 302))
		}

		// /api/TABLE fetches all table entries
		case 2: {
			const table = esc_ident(parts[1])
			const query = `SELECT * FROM ${table};`
			console.log(`1. QUERY: \`${query}\``) // DEBUG
			return cors(Response.json((await pool.query(query)).rows))
		}

		// /api/TABLE/ID fetches all table entries matching that ID
		case 3: {
			const table = esc_ident(parts[1])
			const id = esc_value(parts[2])
			const query = `SELECT * FROM ${table} WHERE id = ${id};`
			console.log(`2. QUERY: \`${query}\``) // DEBUG
			return cors(Response.json((await pool.query(query)).rows))
		}

		// /api/TABLE/FIELD/VALUE fetches all from TABLE where FIELD = VALUE
		case 4: {
			const table = esc_ident(parts[1])
			const field = esc_ident(parts[2])
			const value = esc_value(parts[3])
			const query = `SELECT * FROM ${table} WHERE ${field} = ${value};`
			console.log(`3. QUERY: \`${query}\``) // DEBUG
			return cors(Response.json((await pool.query(query)).rows))
		}
	}

	return null
}

// Exposes OPTIONS endpoint for cross-origin fetching
export async function apiOptions() {
	const h = new Headers()
	h.set('Access-Control-Allow-Origin', '*')
	h.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
	h.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	return new Response(null, { status: 204, headers: h })
}
