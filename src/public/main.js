// put client side stuff here

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
