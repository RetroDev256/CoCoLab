import { SignJWT, jwtVerify, importJWK } from 'jose'
import pool from './db.mjs'

// Get the hash of a password from a password & its salt
export async function hashPassword(password, pw_salt) {
	const pw_bytes = new TextEncoder().encode(password)
	// Concatenate the password and it's salt
	const salted_pw = new Uint8Array(pw_bytes.length + pw_salt.length)
	salted_pw.set(pw_bytes, 0)
	salted_pw.set(pw_salt, pw_bytes.length)
	// Get the hash of the password
	const buffer = crypto.subtle.digest('SHA-256', salted_pw)
	return new Uint8Array(await buffer)
}

// ===== JWK Setup =====
async function generateJWK() {
	const { privateKey } = await crypto.subtle.generateKey(
		{
			name: 'RSASSA-PKCS1-v1_5',
			modulusLength: 2048,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: 'SHA-256',
		},
		true,
		['sign', 'verify'],
	)
	return await crypto.subtle.exportKey('jwk', privateKey)
}

const privateKey = await importJWK(await generateJWK(), 'RS256')

// ===== JWT Functions =====
async function createToken(payload) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'RS256' })
		.setIssuedAt()
		.setExpirationTime('2h')
		.sign(privateKey)
}

async function verifyToken(token) {
	try {
		const { payload } = await jwtVerify(token, privateKey)
		return { valid: true, payload }
	} catch (error) {
		return { valid: false, error: error.message }
	}
}

// ===== Authentication Middleware and Routes =====
export async function authenticate(req) {
	const authHeader = req.headers.get('Authorization')

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return { authenticated: false }
	}

	const token = authHeader.substring(7)
	const result = await verifyToken(token)

	if (result.valid && result.payload) {
		return { authenticated: true, user: result.payload }
	}

	return { authenticated: false }
}

export async function authRoutes(url, data) {
	if (url.pathname === '/api/signin') {
		if (data.username && data.password) {
			const user = await getUser(data.username, data.password)
			console.log('user', user)
			if (user) {
				const token = await createToken({
					sub: user,
				})
				return Response.json({ token })
			}
		}
		return Response.json({ error: 'Invalid credentials' }, { status: 401 })
	}

	if (url.pathname === '/api/signup') {
		// Validate required fields
		if (!data.username || !data.password || !data.email) {
			return Response.json(
				{
					error: 'Username, email, and password are required',
				},
				{ status: 400 },
			)
		}

		// Validate password strength (example)
		if (data.password.length < 8) {
			return Response.json(
				{
					error: 'Password must be at least 8 characters',
				},
				{ status: 400 },
			)
		}

		try {
			// Check if user already exists
			const existingUser = await getUser(data.username, data.password)
			if (existingUser) {
				return Response.json(
					{
						error: 'Username or email already exists',
					},
					{ status: 409 },
				)
			}

			// Create user in database
			const user = await createUser(data)
			if (!user)
				return Response.json(
					{ error: 'Failed to create account' },
					{ status: 500 },
				)

			// Automatically log them in by creating a token
			const token = await createToken({
				sub: user,
			})

			return Response.json(
				{
					token,
					message: 'Account created successfully',
				},
				{ status: 201 },
			)
		} catch (err) {
			console.error('Signup error:', err)
			return Response.json(
				{
					error: 'Failed to create account',
				},
				{ status: 500 },
			)
		}
	}
}

async function getUser(username, password) {
	const result = await pool.query(
		`SELECT * FROM users WHERE user_name = $1;`,
		[username],
	)
	for (const row of result.rows) {
		const hash = await hashPassword(password, row.pw_salt)
		if (crypto.timingSafeEqual(hash, row.pw_hash)) {
			return {
				id: row.id,
				username: row.user_name,
				email: row.email,
				profile_url: row.profile_url,
				phone_number: row.phone_number,
				other_link: row.other_link,
			}
		}
	}
}

async function createUser(data) {
	const pw_salt = new Uint8Array(16)
	crypto.getRandomValues(pw_salt)
	// Compute the hash from password and salt
	const pw_hash = await hashPassword(data.password, pw_salt)

	const result = await pool.query(
		`INSERT INTO users (
                user_name, pw_salt, pw_hash, email, profile_url, phone_number, other_link
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;`,
		[
			data.username,
			pw_salt,
			pw_hash,
			data.email,
			data.profile_url,
			data.phone_number,
			data.other_link,
		],
	)

	if (result.rowCount > 0) {
		const row = result.rows[0]
		return {
			id: row.id,
			username: row.user_name,
			email: row.email,
			profile_url: row.profile_url,
			phone_number: row.phone_number,
			other_link: row.other_link,
		}
	}
}
