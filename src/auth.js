import {
    SignJWT,
    jwtVerify,
    generateKeyPair,
    importPKCS8,
    exportPKCS8,
} from "jose";

import pool from "./db.mjs";

// The private key should not be generated each time we run, especially if we
// ever choose to scale beyond one server - this function will load from or
// generate a new file containing our private key. This also means that tokens
// will not be invalidated every server restart.
async function getPrivateKey() {
    const file = Bun.file("auth_key.pem");

    if (await file.exists()) {
        // load the existing key from the file
        const pem_string = await file.text();
        return await importPKCS8(pem_string, "RS256");
    }

    // Generate a new key (it does not exist)
    console.log("Generating a new JWT auth key...");
    const { privateKey } = await generateKeyPair("RS256", {
        extractable: true, // not sure why I need this but ok
    });

    // Save the key to the file, also return it ig
    const pem_string = await exportPKCS8(privateKey);
    await Bun.write(file, pem_string);
    return privateKey;
}

// Load the private key on startup
const private_key = await getPrivateKey();

// Generate a new JWT token - expires in 1 day
async function createToken(user_id) {
    // The "sub" means the "subject"
    return await new SignJWT({ sub: user_id })
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(private_key);
}

// Verify whether a JWT token is valid - the payload is the user ID
async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, private_key);
        return { valid: true, payload };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

// Take a request and authenticate a user based on this request.
// This returns the user's ID if they are authenticated, otherwise null.
export async function authenticateUser(request) {
    // Get the auth header and skip "Bearer " for the token
    const header = request.headers.get("Authorization");
    // Verify the header starts with a case-insensitive "Bearer "
    if (!header?.toLowerCase().startsWith("bearer ")) return null;
    // Extract the JWT token and verify it
    const token = header.substring(7);
    const { valid, payload } = await verifyToken(token);
    // Return non-null only if the token matches
    return valid ? payload?.sub : null;
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
    if (lookup.length !== 0) return Response.json(existing, { status: 401 });

    // Handle the case where the user DOES already match a valid account
    const old_user = await getExistingUser(data.user_name, data.password);
    const invalid = { error: "These credentials are already in use." };
    if (old_user !== null) return Response.json(invalid, { status: 401 });

    // Insert the user into the database & create a session token
    const new_user = await insertNewUser(data);
    return Response.json(await createToken(new_user.id));
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
    return Response.json(await createToken(user.id));
}

// Function retrieves a matching user from the database from a username and
// password. If a matching account does not exist, this function returns null.
async function getExistingUser(user_name, password) {
    const query = "SELECT * FROM users WHERE user_name = $1";
    const users = (await pool.query(query, [user_name])).rows;

    for (const user of users) {
        const matches = Bun.password.verifyPassword(password, user.pw_hash);
        if (await matches) return user; // return the user if they match
    }

    return null; // No matches found for the selected username and password
}

// Function creates a new user for the database from form data or whatnot.
// The function is a thin wrapper around inserting into the pool.
async function insertNewUser(user) {
    const pw_hash = await Bun.password.hash(user.password);

    // Insert the new user into the database, and return their record
    const result = await pool.query(
        `INSERT INTO users (user_name, pw_hash, email)
        VALUES ($1, $2, $3) RETURNING *;`,
        [user.user_name, pw_hash, user.email],
    );

    if (result.rowCount === 0) {
        // It is expected that this insert will always succeed
        throw new Error("Unexpected failure in insertNewUser.");
    } else {
        return result.rows[0];
    }
}
