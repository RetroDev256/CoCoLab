import pool from './db.mjs'
import { passwordHash } from './auth.js'

// Exposes POST endpoints under /api/ for each SQL table
export async function apiPost(url, data) {
	// -------------------------------------------------------- INSERTING USERS
	if (url.pathname === '/api/users') {
		// Generate 128 bits of salt for the password hash
		const pw_salt = new Uint8Array(16)
		crypto.getRandomValues(pw_salt)
		// Get the password from the form
		const password = data.password
		// Compute the hash from password and salt
		const pw_hash = await passwordHash(password, pw_salt)

		const result = await pool.query(
			`INSERT INTO users (
                user_name, pw_salt, pw_hash, email, phone_number, other_link
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;`,
			[
				data.user_name,
				pw_salt,
				pw_hash,
				data.email,
				data.phone_number,
				data.other_link,
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
			[data.project_name, data.max_people, data.details],
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

	return null
}

const hidden_table_fields = {
	users: 'pw_salt, pw_hash',
}

// Exposes GET endpoints under /api/ for each SQL table
export async function apiGet(url) {
	const table_list = [
		'users',
		'project',
		'category_tags',
		'projects_tags',
		'project_members',
	]

	// The route /api/TABLE will fetch all table entries
	for (const table of table_list) {
		if (url.pathname === `/api/${table}`) {
			const query = `SELECT * FROM ${table};`
			const result = await pool.query(query)
			const hiddenFields = hidden_table_fields[table] || []
			const filteredRows = result.rows.map((row) => {
				const filteredRow = { ...row }
				hiddenFields.forEach((field) => delete filteredRow[field])
				return filteredRow
			})
			return Response.json(filteredRows)
		}
	}

	// The route /api/TABLE/clear will clear all entries
	// This route will be removed later, it's for testing
	for (const table of table_list) {
		if (url.pathname === `/api/${table}/clear`) {
			const query = `DELETE FROM ${table};`
			const result = await pool.query(query)
			return Response.json(result.rows)
		}
	}

	return null
}
