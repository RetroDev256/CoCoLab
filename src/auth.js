import { SignJWT, jwtVerify, importJWK } from "jose";
import pool from "./db.mjs";

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

const privateKey = await importJWK(await generateJWK(), "RS256");

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

// ===== Authentication Middleware and Routes =====
export async function authenticate(req) {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { authenticated: false };
    }

    const token = authHeader.substring(7);
    const result = await verifyToken(token);

    if (result.valid && result.payload) {
        return { authenticated: true, user: result.payload };
    }

    return { authenticated: false };
}

// The different API routes reserved for authentication:
export async function authRoutes(url, data) {
    switch (url.pathname) {
        case "/api/sign_in":
            return await signInUser(data);
        case "/api/sign_up":
            return await signUpUser(data);
    }
}

// An authentication route to create a new user - this handles the case where a
// user exists with the same user_name, or the same user_name and password.
async function signUpUser(data) {
    // Ensure that we have a valid sign-up request
    if (data.user_name === null)
        throw new Error("Unexpected null user_name in signUpUser");
    if (data.password === null)
        throw new Error("Unexpected null password in signUpUser");
    if (data.email === null)
        throw new Error("Unexpected null email in signUpUser");

    // Debug logging - only displayed on the server
    console.log(`${data.user_name} is signing up...`);

    // Check to see if there is already a matching user_name in the database
    const query = "SELECT * FROM users WHERE user_name = $1";
    const lookup = (await pool.query(query, [data.user_name])).rows;
    const existing = { error: "This user name has already been chosen." };
    if (lookup.length !== 0) return response.json(existing, { status: 401 });

    // Handle the case where the user DOES already match a valid account
    const old_user = await getExistingUser(data.user_name, data.password);
    const invalid = { error: "These credentials are already in use." };
    if (old_user !== null) return Response.json(invalid, { status: 401 });

    // Insert the user into the database & create a session token
    const new_user = await insertNewUser(data);
    return Response.json(await createToken({ sub: new_user.id }));
}

// An authentication route for signing a user in - this handles the cases where
// the user matches one of several commonly named users (the unique key is of
// course a combination of their user_name and password) - as well as the case
// where their user does not exist within the database.
async function signInUser(data) {
    // Ensure that we have a valid sign-in request
    if (data.user_name === null)
        throw new Error("Unexpected null user_name in signInUser");
    if (data.password === null)
        throw new Error("Unexpected null password in signInUser");

    // Debug logging - only displayed on the server
    console.log(`${data.user_name} is signing in...`);

    // Check to see if the user matches one we have in the database
    const user = await getExistingUser(data.user_name, data.password);

    // Handle the case where the user did not match a valid account
    const invalid = { error: "Invalid user name or password." };
    if (user === null) return Response.json(invalid, { status: 401 });

    // Create a session token for the user --- only track ID
    return Response.json(await createToken({ sub: user.id }));
}

// Function retrieves a matching user from the database from a username and
// password. If a matching account does not exist, this function returns null.
async function getExistingUser(user_name, password) {
    const query = "SELECT * FROM users WHERE user_name = $1";
    const users = (await pool.query(query, [user_name])).rows;

    for (const user of users) {
        const matches = passwordMatches(password, user.pw_salt, user.pw_hash);
        if (await matches) return user; // return the user if they match
    }

    return null; // No matches found for the selected username and password
}

// Function creates a new user for the database from form data or whatnot.
// The function is a thin wrapper around inserting into the pool, and simply
// will create a salt for the user's password and hash the password.
async function insertNewUser(user) {
    // The salt is 256 bits - this is overkill according to some, but the cost
    // is low, the risk is lower, and the benefit is always nice to have.
    const pw_salt = new Uint8Array(32);
    crypto.getRandomValues(pw_salt);

    // Compute the password hash from the generated salt and password
    const pw_hash = await hashPassword(user.password, pw_salt);

    // Insert the new user into the database, and return their record
    const result = await pool.query(
        "INSERT INTO users (user_name, pw_salt, pw_hash, email)\n" +
            "VALUES ($1, $2, $3, $4)\n" +
            "RETURNING *;",
        [user.user_name, pw_salt, pw_hash, user.email],
    );

    if (result.rowCount === 0) {
        // It is expected that this insert will always succeed
        throw new Error("Unexpected failure in insertNewUser.");
    } else {
        return result.rows[0];
    }
}

// Get the hash of a password from a password & its salt
async function hashPassword(password, pw_salt) {
    const pw_bytes = new TextEncoder().encode(password);
    // Concatenate the password and it's salt
    const salted_len = pw_bytes.length + pw_salt.length;
    const salted_pw = new Uint8Array(salted_len);
    salted_pw.set(pw_bytes, 0);
    salted_pw.set(pw_salt, pw_bytes.length);
    // Get the hash of the password (Argon2id)
    return await Bun.password.hash(salted_pw);
}

// Verify that a password matches a password hash
async function passwordMatches(password, pw_salt, pw_hash) {
    const pw_bytes = new TextEncoder().encode(password);
    // Concatenate the password and it's salt
    const salted_len = pw_bytes.length + pw_salt.length;
    const salted_pw = new Uint8Array(salted_len);
    salted_pw.set(pw_bytes, 0);
    salted_pw.set(pw_salt, pw_bytes.length);
    // Verify that the salted password matches the pw_hash
    return await Bun.password.verifyPassword(salted_pw, pw_hash);
}
