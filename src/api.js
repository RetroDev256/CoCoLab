import pool from "./db.mjs";
import { passwordHash } from "./auth.js";

// Exposes POST endpoints under /api/ for each SQL table
export async function apiPost(url, data) {
    // -------------------------------------------------------- INSERTING USERS
    if (url.pathname === "/api/users") {
        // Generate 128 bits of salt for the password hash
        const pw_salt = new Uint8Array(16);
        crypto.getRandomValues(pw_salt);
        // Get the password from the form
        const password = data.password;
        // Compute the hash from password and salt
        const pw_hash = await passwordHash(password, pw_salt);

        const result = await pool.query(
            `INSERT INTO users (
                user_name, pw_salt, pw_hash, email, profile_url, phone_number, other_link
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;`,
            [
                data.user_name,
                pw_salt,
                pw_hash,
                data.email,
                data.profile_url,
                data.phone_number,
                data.other_link,
            ],
        );

        // Return HTTP "successfully created" & the created row
        return Response.json(result.rows[0], { status: 201 });
    }

    // ----------------------------------------------------- INSERTING PROJECTS
    if (url.pathname === "/api/project") {
        const result = await pool.query(
            `INSERT INTO project (project_name, max_people, details, owner_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;`,
            [data.project_name, data.max_people, data.details, data.owner_id],
        );

        // Return HTTP "successfully created" & the created row
        return Response.json(result.rows[0], { status: 201 });
    }

    // ------------------------------------------------ INSERTING CATEGORY TAGS
    if (url.pathname === "/api/category_tags") {
        const result = await pool.query(
            `INSERT INTO category_tags (name)
            VALUES ($1)
            RETURNING *;`,
            [data.name],
        );

        // Return HTTP "successfully created" & the created row
        return Response.json(result.rows[0], { status: 201 });
    }

    // ------------------------------------------------- INSERTING PROJECT TAGS
    if (url.pathname === "/api/projects_tags") {
        const result = await pool.query(
            `INSERT INTO projects_tags (project_id, tag_id)
            VALUES ($1, $2)
            RETURNING *;`,
            [data.project_id, data.tag_id],
        );

        // Return HTTP "successfully created" & the created row
        return Response.json(result.rows[0], { status: 201 });
    }

    // ---------------------------------------------- INSERTING PROJECT MEMBERS
    if (url.pathname === "/api/project_members") {
        const result = await pool.query(
            `INSERT INTO project_members (user_id, project_id, role)
            VALUES ($1, $2, $3)
            RETURNING *;`,
            [data.user_id, data.project_id, data.role],
        );

        // Return HTTP "successfully created" & the created row
        return Response.json(result.rows[0], { status: 201 });
    }

    return null;
}

// Exposes GET endpoints under /api/ for each SQL table
export async function apiGet(url) {
    const table_list = [
        "users",
        "project",
        "category_tags",
        "projects_tags",
        "project_members",
    ];

    // --- /api/TABLE/ID would parse to ["api", "TABLE", "ID"]
    const parts = url.pathname.split("/").filter(Boolean);

    switch (parts.length) {
        // The route /api/TABLE will fetch all table entries
        case 2: {
            if (parts[0] !== "api") break;
            for (const table of table_list) {
                if (parts[1] === table) {
                    const query = `SELECT * FROM ${table};`;
                    const result = await pool.query(query);
                    return Response.json(result.rows);
                }
            }
        }
        // The route /api/TABLE/ID will fetch all table entries matching that ID
        case 3: {
            if (parts[0] !== "api") break;
            const id = parseInt(parts[2], 10);
            for (const table of table_list) {
                if (parts[1] === table) {
                    const query = `SELECT * FROM ${table} WHERE id = ${id};`;
                    const result = await pool.query(query);
                    return Response.json(result.rows);
                }
            }
        }
    }

    return null;
}
