import { SignJWT, jwtVerify, importJWK } from 'jose'
import pool from './db.mjs'

// Get the hash of a password from a password & its salt
export async function passwordHash(password, pw_salt) {
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

	if (result.valid) {
		return { authenticated: true, user: result.payload }
	}

	return { authenticated: false }
}

export async function authRoutes(url, data) {
	if (url.pathname === '/api/login') {
		if (data.user_name && data.password) {
			const isValidUser = await validateCredentials(
				data.user_name,
				data.password,
			)

			if (isValidUser) {
				const token = await createToken({
					sub: data.user_name,
					role: 'user',
					// Add any other claims you need
				})

				return Response.json({ token })
			}
		}

		return Response.json({ error: 'Invalid credentials' }, { status: 401 })
	}

	if (url.pathname === '/api/signup') {
		// Validate required fields
		if (!data.user_name || !data.password || !data.email) {
			return Response.json(
				{
					error: 'Username, email, and password are required',
				},
				{ status: 400 },
			)
		}

		// Validate password strength (example)
		if (body.password.length < 8) {
			return Response.json(
				{
					error: 'Password must be at least 8 characters',
				},
				{ status: 400 },
			)
		}

		try {
			// Check if user already exists
			const userExists = await checkUserExists(body.username, body.email)
			if (userExists) {
				return Response.json(
					{
						error: 'Username or email already exists',
					},
					{ status: 409 },
				)
			}

			// Hash password
			const hashedPassword = await hashPassword(body.password)

			// Create user in database
			await createUser({
				username: body.username,
				email: body.email,
				password: hashedPassword,
				// Add any other fields you need
			})

			// Automatically log them in by creating a token
			const token = await createToken({
				sub: body.username,
				email: body.email,
				role: 'user',
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

async function signup(req) {
	if (req.method !== 'POST') {
		return Response.json({ error: 'Method not allowed' }, { status: 405 })
	}

	const body = await req.json()
}

async function validateCredentials(username, password) {
	// TODO: Check against your database
	// Then verify password hash
	return username === 'user' && password === 'password' // REPLACE THIS
}
