import pool from "./db.mjs";
import { authRoutes } from "./auth.js";

// Provides limited SQL injection protection for SQL identifiers -
// USE THIS WHENEVER YOU WILL USE UNKNOWN DATA IN AN SQL QUERY
export function escapeIdentifier(sql_identifier) {
    return `"${String(sql_identifier).replace(/"/g, '""')}"`;
}

// Exposes POST endpoints under /api/ for each SQL table
export async function apiPost(url, data) {
    // Handle inserting and creation of new users
    const response = await authRoutes(url, data);
    if (response) return response;

    // ----------------------------------------------------- INSERTING PROJECTS
    if (url.pathname === "/API/project") {
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
            ]
        );

        // Return HTTP "successfully created" & the created row
        return Response.json(result.rows[0], { status: 201 });
    }

    // ------------------------------------------------ INSERTING CATEGORY TAGS
    if (url.pathname === "/API/category_tags") {
        const result = await pool.query(
            `INSERT INTO category_tags (name)
            VALUES ($1)
            RETURNING *;`,
            [data.name]
        );

        // Return HTTP "successfully created" & the created row
        return Response.json(result.rows[0], { status: 201 });
    }

    // ------------------------------------------------- INSERTING PROJECT TAGS
    if (url.pathname === "/API/projects_tags") {
        const result = await pool.query(
            `INSERT INTO projects_tags (project_id, tag_id)
            VALUES ($1, $2)
            RETURNING *;`,
            [data.project_id, data.tag_id]
        );

        // Return HTTP "successfully created" & the created row
        return Response.json(result.rows[0], { status: 201 });
    }

    // ---------------------------------------------- INSERTING PROJECT MEMBERS
    if (url.pathname === "/API/project_members") {
        const result = await pool.query(
            `INSERT INTO project_members (user_id, project_id, role)
            VALUES ($1, $2, $3)
            RETURNING *;`,
            [data.user_id, data.project_id, data.role]
        );

        // Return HTTP "successfully created" & the created row
        return Response.json(result.rows[0], { status: 201 });
    }

    // ---------------------------------------------- INSERTING PROJECT MEMBERS
    if (url.pathname === "/API/project_requests") {
        const result = await pool.query(
            `INSERT INTO project_requests (user_id, project_id, role)
            VALUES ($1, $2, $3)
            RETURNING *;`,
            [data.user_id, data.project_id, data.role]
        );

        // Return HTTP "successfully created" & the created row
        return Response.json(result.rows[0], { status: 201 });
    }

    return null;
}

// Exposes PUT endpoints under /API/ for updating rows by ID
export async function apiPut(url, data) {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] !== "API") return null;

    const fields = Object.keys(data);
    if (fields.length === 0) {
        return Response.json(
            { error: "No fields provided to update" },
            { status: 400 }
        );
    }

    switch (parts.length) {
        // /API/TABLE/ID --- Update row by id
        case 3: {
            const table = escapeIdentifier(parts[1]);
            const id = parts[2];

            // Build SET clause: "field1" = $1, "field2" = $2, ...
            const setClauses = fields.map(
                (field, i) => `${escapeIdentifier(field)} = $${i + 1}`
            );
            const values = fields.map((f) => data[f]);
            values.push(id); // id goes last as the final parameter

            const query = `UPDATE ${table} SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *;`;
            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return Response.json(
                    { error: "Row not found" },
                    { status: 404 }
                );
            }
            return Response.json(result.rows[0]);
        }

        // /API/TABLE/FIELD/VALUE --- Update row where field = value
        case 4: {
            const table = escapeIdentifier(parts[1]);
            const field = escapeIdentifier(parts[2]);
            const value = parts[3];

            // Build SET clause: "field1" = $1, "field2" = $2, ...
            const setClauses = fields.map(
                (field, i) => `${escapeIdentifier(field)} = $${i + 1}`
            );
            const values = fields.map((f) => data[f]);
            values.push(value); // value goes last as the final parameter

            const query = `UPDATE ${table} SET ${setClauses.join(", ")} WHERE ${field} = $1 RETURNING *;`;
            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return Response.json(
                    { error: "Row not found" },
                    { status: 404 }
                );
            }
            return Response.json(result.rows[0]);
        }
    }

    return null;
}

// Exposes DELETE endpoints under /API
export async function apiDelete(url) {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] !== "API") return null;

    switch (parts.length) {
        // /API/TABLE --- Delete all values from a table
        case 2: {
            const table = escapeIdentifier(parts[1]);
            const query = `DELETE FROM ${table} RETURNING *;`;
            const rows = (await pool.query(query)).rows;
            return Response.json(rows);
        }

        // /API/TABLE/ID --- Delete by id
        case 3: {
            const table = escapeIdentifier(parts[1]);
            const id = parts[2];
            const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *;`;
            const rows = (await pool.query(query, [id])).rows;
            return Response.json(rows);
        }

        // /API/TABLE/FIELD/VALUE --- Delete where field = value
        case 4: {
            const table = escapeIdentifier(parts[1]);
            const field = escapeIdentifier(parts[2]);
            const value = parts[3];
            const query = `DELETE FROM ${table} WHERE ${field} = $1 RETURNING *;`;
            const rows = (await pool.query(query, [value])).rows;
            return Response.json(rows);
        }
    }

    return null;
}

// Exposes GET endpoints under /API
export async function apiGet(url) {
    // --- /API/TABLE/ID would parse to ["API", "TABLE", "ID"]
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] !== "API") return null;

    switch (parts.length) {
        // /API/TABLE --- Get all values from a table
        case 2: {
            const table = escapeIdentifier(parts[1]);
            const query = `SELECT * FROM ${table};`;
            return Response.json((await pool.query(query)).rows);
        }

        // /API/TABLE/ID --- Get values from a table matching an ID
        case 3: {
            const table = escapeIdentifier(parts[1]);
            const id = parts[3];
            const query = `SELECT * FROM ${table} WHERE id = $1;`;
            return Response.json((await pool.query(query, [id])).rows);
        }

        // /API/TABLE/FIELD/VALUE --- Select from table, field == value
        case 4: {
            const table = escapeIdentifier(parts[1]);
            const field = escapeIdentifier(parts[2]);
            const value = parts[4];
            const query = `SELECT * FROM ${table} WHERE ${field} = $1;`;
            const rows = (await pool.query(query, [value])).rows;
            return Response.json(rows);
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
