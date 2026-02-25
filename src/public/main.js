// --------------------------------------------------------------- BURGER LOGIC

const burger = document.getElementById("burger");
const side_menu = document.getElementById("side_menu");

export function openMenu() {
    side_menu.classList.add("open");
}

export function closeMenu() {
    side_menu.classList.remove("open");
}

if (burger !== null) {
    // The menu can be opened if and only if the burger is clicked
    burger.addEventListener("click", (e) => openMenu());

    // The menu can be closed if we did not click on the burger
    document.addEventListener("click", (event) => {
        if (!burger.contains(event.target)) closeMenu();
    });

    // The menu can be closed if we pressed escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
    });
}

// ----------------------------------------------------------- DATABASE HELPERS

// Returns a list of all JS objects in a table
export async function selectByTable(table) {
    const url = "https://coco.alloc.dev";
    const path = `${url}/API/SELECT/${table}`;
    return await (await fetch(path)).json();
}

// Returns either a single JS object, or null
export async function selectById(table, id) {
    const url = "https://coco.alloc.dev";
    const path = `${url}/API/SELECT/${table}/${id}`;
    const response = await fetch(path);
    const json = await response.json();

    if (json.length === 0) {
        return null;
    } else {
        return json[0];
    }
}

// Returns either a single JS object, or null
export async function deleteById(table, id) {
    const url = "https://coco.alloc.dev";
    const path = `${url}/API/DELETE/${table}/${id}`;
    const response = await fetch(path);
    const json = await response.json();

    if (json.length === 0) {
        return null;
    } else {
        return json[0];
    }
}

// Returns a list based on a table, field, and value
export async function selectByValue(table, field, value) {
    const url = "https://coco.alloc.dev";
    const path = `${url}/API/SELECT/${table}/${field}/${value}`;
    return await (await fetch(path)).json();
}

// Returns a list based on a table, field, and value
export async function deleteByValue(table, field, value) {
    const url = "https://coco.alloc.dev";
    const path = `${url}/API/DELETE/${table}/${field}/${value}`;
    return await (await fetch(path)).json();
}

// Used when rendering owners of projects
export function isValidURL(url) {
    try {
        new URL(url);
        console.log("isValidURL: true");
        return true;
    } catch {
        console.log("isValidURL: false");
        return false;
    }
}

// ----------------------------------------------------- AUTHENTICATION HELPERS

export function saveToken(token) {
    console.log("Saving JWT Token...");
    localStorage.setItem("token", token);
}

export function getToken() {
    console.log("Loading JWT Token...");
    return localStorage.getItem("token");
}

export function getUserId() {
    const token = getToken();

    if (token === null) {
        // this is a normal case that is expected to happen
        console.log("getUserId: no JWT token");
        return null;
    }

    try {
        // JWT token segments are split by '.'
        const segments = token.split(".");
        // The header, payload, and signature
        if (segments.length != 3) return null;
        // The payload is JSON encoded in base 64
        const payload = JSON.parse(atob(segments[1]));
        // The subject (or "sub") is the user ID
        return payload.sub;
    } catch {
        // don't forget to clear an invalid token on error
        console.log("getUserId: the JWT token is invalid");
        localStorage.removeItem("token");
        return null;
    }
}
