import { SignJWT, jwtVerify, importJWK } from "jose";
import { apiPost, apiGet } from "./api.js";

// Get the hash of a password from a password & it's salt
export function passwordHash(password, pw_salt) {
    // Salt the password with the 128 random bits
    const pw_bytes = new TextEncoder().encode(password);
    const salted_pw = new Uint8Array(pw_bytes.length + pw_salt.length);
    salted_pw.set(pw_bytes, 0);
    salted_pw.set(pw_salt, pw_bytes.length);
    // Get the hash of the password
    return Crypto.hash("sha256", salted_pw);
}

// ===== JWK Setup =====
async function generateJWK() {
    const { privateKey } = await crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["sign", "verify"],
    );
    return await crypto.subtle.exportKey("jwk", privateKey);
}

const JWK = await generateJWK();
const privateKey = await importJWK(JWK, "RS256");

// ===== JWT Functions =====
async function createToken(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt()
        .setExpirationTime("2h")
        .sign(privateKey);
}

async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, privateKey);
        return { valid: true, payload };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

// ===== Authentication Middleware =====
async function authenticate(req) {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { authenticated: false };
    }

    const token = authHeader.substring(7);
    const result = await verifyToken(token);

    if (result.valid) {
        return { authenticated: true, user: result.payload };
    }

    return { authenticated: false };
}

// async function protectedApiPost(req) {
// 	const auth = await authenticate(req)
// 	if (!auth.authenticated) {
// 		return Response.json({ error: 'Unauthorized' }, { status: 401 })
// 	}

// 	const form_data = await req.formData()

// 	try {
// 		const api_response = await apiPost(req.url, form_data, auth.user)
// 		if (api_response) return api_response
// 	} catch (err) {
// 		console.log(`POST error encountered: ${err} --- FORM DATA:`)
// 		for (const [key, value] of form_data.entries())
// 			console.log(JSON.stringify({ key, value }))
// 		return Response.json(err, { status: 500 })
// 	}
// }

// async function protectedApiGet(req) {
// 	const auth = await authenticate(req)
// 	if (!auth.authenticated) {
// 		return Response.json({ error: 'Unauthorized' }, { status: 401 })
// 	}

// 	try {
// 		const api_response = await apiGet(req.url, auth.user)
// 		if (api_response) return api_response
// 	} catch (err) {
// 		console.log(`GET error encountered: ${err}`)
// 		return Response.json(err, { status: 500 })
// 	}
// }

async function login(req) {
    // Route
    if (req.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const body = await req.json();
    if (body.username && body.password) {
        const isValidUser = await validateCredentials(
            body.username,
            body.password,
        );

        if (isValidUser) {
            const token = await createToken({
                sub: body.username,
                role: "user",
                // Add any other claims you need
            });

            return Response.json({ token });
        }
    }

    return Response.json({ error: "Invalid credentials" }, { status: 401 });
}

async function validateCredentials(username, password) {
    // TODO: Check against your database
    // Then verify password hash
    return username === "user" && password === "password"; // REPLACE THIS
}
