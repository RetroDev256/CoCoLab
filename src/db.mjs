import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    user: "retrodev", // postgres role
    host: "localhost", // current machine
    database: "coco", // database name
    port: 5432, // postgres port
});

export default pool;
