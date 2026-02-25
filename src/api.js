import pool from "./db.mjs";
import { authRoutes } from "./auth.js";

// Provides limited SQL injection protection for SQL identifiers -
// USE THIS WHENEVER YOU WILL USE UNKNOWN DATA IN AN SQL QUERY
export function escapeIdentifier(sql_identifier) {
    return `"${String(v).replace(/"/g, '""')}"`;
}

// Exposes POST endpoints under /api/ for each SQL table
export async function apiPost(url, data) {
    // Handle inserting and creation of new users
    const response = await authRoutes(url, data);
    if (response) return response;

    // ----------------------------------------------------- INSERTING PROJECTS
    if (url.pathname === "/api/project") {
        const result = await pool.query(
            `INSERT INTO project (project_name, max_people, completed, details, owner_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;`,
            [
                data.project_name,
                data.max_people,
                data.completed,
                data.details,
                data.owner_id,
            ],
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

    // ---------------------------------------------- INSERTING PROJECT MEMBERS
    if (url.pathname === "/api/project_requests") {
        const result = await pool.query(
            `INSERT INTO project_requests (user_id, project_id, role)
            VALUES ($1, $2, $3)
            RETURNING *;`,
            [data.user_id, data.project_id, data.role],
        );

        // Return HTTP "successfully created" & the created row
        return Response.json(result.rows[0], { status: 201 });
    }

    return null;
}

// Exposes GET endpoints under /API/ for each SQL table
export async function apiGet(url) {
    // --- /API/TABLE/ID would parse to ["API", "TABLE", "ID"]
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] !== "API") return null;

    switch (parts.length) {
        // /API/SELECT/TABLE --- Get all values from a table
        case 3: {
            if (parts[1] !== "SELECT") break;
            const table = escapeIdentifier(parts[2]);
            const query = `SELECT * FROM ${table};`;
            return Response.json((await pool.query(query)).rows);
        }

        // /API/SELECT/TABLE/ID --- Get values from a table matching an ID
        // /API/DELETE/TABLE/ID --- Delete values from a table matching ID
        case 4: {
            const table = escapeIdentifier(parts[2]);
            const id = parts[3];

            switch (parts[1]) {
                case "SELECT": {
                    const query = `SELECT * FROM ${table} WHERE id = $1;`;
                    return Response.json((await pool.query(query, [id])).rows);
                }
                case "DELETE": {
                    const query = `DELETE FROM ${table} WHERE id = $1;`;
                    return Response.json((await pool.query(query, [id])).rows);
                }
            }
        }

        // /API/SELECT/TABLE/FIELD/VALUE --- Select from table, field == value
        // /API/DELETE/TABLE/FIELD/VALUE --- Delete from table, field == value
        case 5: {
            const table = escapeIdentifier(parts[2]);
            const field = escapeIdentifier(parts[3]);
            const value = parts[4];

            switch (parts[1]) {
                case "SELECT": {
                    const query = `SELECT * FROM ${table} WHERE ${field} = $1;`;
                    const rows = (await pool.query(query, [value])).rows;
                    return Response.json(rows);
                }
                case "DELETE": {
                    const query = `DELETE FROM ${table} WHERE ${field} = $1;`;
                    const rows = (await pool.query(query, [value])).rows;
                    return Response.json(rows);
                }
            }
        }
    }

    return null;
}

// Exposes OPTIONS endpoint for cross-origin fetching
export async function apiOptions() {
    const h = new Headers();
    h.set("Access-Control-Allow-Origin", "*");
    h.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    h.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return new Response(null, { status: 204, headers: h });
}
