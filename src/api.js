import pool from './db.mjs'
import { authRoutes } from './auth.js'

// Exposes POST endpoints under /api/ for each SQL table
export async function apiPost(url, data) {
	const res = await authRoutes(url, data)
	if (res) return res
	// ----------------------------------------------------- INSERTING PROJECTS
	if (url.pathname === '/api/project') {
		const result = await pool.query(
			`INSERT INTO project (project_name, max_people, details, owner_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;`,
			[data.project_name, data.max_people, data.details, data.owner_id],
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
			[data.name],
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
			[data.project_id, data.tag_id],
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
			[data.user_id, data.project_id, data.role],
		)

		// Return HTTP "successfully created" & the created row
		return Response.json(result.rows[0], { status: 201 })
	}

	// ---------------------------------------------- INSERTING PROJECT MEMBERS
	if (url.pathname === '/api/project_requests') {
		const result = await pool.query(
			`INSERT INTO project_requests (user_id, project_id, role)
            VALUES ($1, $2, $3)
            RETURNING *;`,
			[data.user_id, data.project_id, data.role],
		)

		// Return HTTP "successfully created" & the created row
		return Response.json(result.rows[0], { status: 201 })
	}

	return null
}

function getFields(table) {
	switch (table) {
		case 'users':
			return 'id, user_name, email, profile_url, phone_number, other_link'
		default:
			return '*'
	}
}

// Exposes GET endpoints under /API/ for each SQL table
export async function apiGet(url) {
	// --- /API/TABLE/ID would parse to ["API", "TABLE", "ID"]
	const parts = url.pathname.split('/').filter(Boolean)
	const esc_ident = (v) => `"${String(v).replace(/"/g, '""')}"`
	const esc_value = (v) => `'${String(v).replace(/'/g, "''")}'`
	if (parts[0] !== 'API') return null

	switch (parts.length) {
		// /API/SELECT/TABLE
		case 3: {
			if (parts[1] !== 'SELECT') break
			const table = esc_ident(parts[2])
			const query = `SELECT ${getFields(table)} FROM ${table};`
			return Response.json((await pool.query(query)).rows)
		}

		// /API/SELECT/TABLE/ID OR /API/DELETE/TABLE/ID
		case 4: {
			const table = esc_ident(parts[2])
			const id = esc_value(parts[3])

			switch (parts[1]) {
				case 'SELECT': {
					const query = `SELECT ${getFields(table)} FROM ${table} WHERE id = ${id};`
					return Response.json((await pool.query(query)).rows)
				}
				case 'DELETE': {
					const query = `DELETE FROM ${table} WHERE id = ${id};`
					return Response.json((await pool.query(query)).rows)
				}
			}
		}

		// /API/SELECT/TABLE/FIELD/VALUE OR /API/DELETE/TABLE/FIELD/VALUE
		case 5: {
			const table = esc_ident(parts[2])
			const field = esc_ident(parts[3])
			const value = esc_value(parts[4])

			switch (parts[1]) {
				case 'SELECT': {
					const query = `SELECT ${getFields(table)} FROM ${table} WHERE ${field} = ${value};`
					return Response.json((await pool.query(query)).rows)
				}
				case 'DELETE': {
					const query = `DELETE FROM ${table} WHERE ${field} = ${value};`
					return Response.json((await pool.query(query)).rows)
				}
			}
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
