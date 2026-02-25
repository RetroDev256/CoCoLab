// --------------------------------------------------------------- BURGER LOGIC

const burger = document.getElementById("burger");
const side_menu = document.getElementById("side-menu");

export function openMenu() {
    side_menu.classList.add("open");
}

export function closeMenu() {
    side_menu.classList.remove("open");
}

if (burger !== null) {
    // The menu can be opened if and only if the burger is clicked
    burger.addEventListener("click", (e) => toggleMenu());

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
        return true;
    } catch {
        return false;
    }
}

// ----------------------------------------------------- AUTHENTICATION HELPERS

export function saveToken(token) {
    console.log(`Saving token: ${token}`);
    localStorage.setItem("token", token);
}

export function getToken() {
    const token = localStorage.getItem("token");
    console.log(`Loading token: ${token}`);
    return token;
}

export function getUser() {
    const token = getToken();

    if (token !== null) {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload))?.sub;
    } else {
        return null;
    }
}
