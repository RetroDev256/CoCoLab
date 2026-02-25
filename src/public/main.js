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

// Authentication
export function saveToken(token) {
    localStorage.setItem("token", token);
}

export function getToken() {
    return localStorage.getItem("token");
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

// components
const dir = new URL(".", import.meta.url).href;
customElements.define(
    "coco-header",
    class extends HTMLElement {
        connectedCallback() {
            const user = getUser();
            this.innerHTML = `<header class="drawer sticky top-0 z-10">
    <input id="nav-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
        <div class="navbar bg-base-300 w-full">
            <div class="navbar-start">
                <label
                    for="nav-drawer"
                    aria-label="open sidebar"
                    class="btn btn-square btn-ghost"
                >
                    <img src="${dir}/images/icons/menu.svg" alt="Menu" />
                </label>
            </div>
            <a class="navbar-center gap-2 p-1" href="/">
                <img
                    class="size-12"
                    src="${dir}images/logo.png"
                    alt="CoCoLab Logo"
                />
                <h1 class="text-4xl tracking-tight font-bold">
                    CoCo<span class="text-primary">Lab</span>
                </h1>
            </a>
            <div class="navbar-end">
                <a class="btn btn-ghost btn-circle" href="${dir}${user ? "pages/userSettings.html" : "pages/auth.html"}">
                    <img
                        class="account"
                        src="${dir}images/icons/user.svg"
                        alt="User Account"
                    />
                </a>
            </div>
        </div>
    </div>

    <div class="drawer-side">
        <label
            for="nav-drawer"
            aria-label="close sidebar"
            class="drawer-overlay"
        ></label>
        <ul class="menu bg-base-200 min-h-full w-80 p-4">
            <!-- Sidebar content here -->
            <li>
                <a href="${dir}pages/projectBoard.html">Project Board</a>
            </li>
            <li>
                <a href="${dir}pages/projectManager.html">Project Manager</a>
            </li>
            <li>
                <a href="${dir}pages/aboutDevs.html">About the Developers</a>
            </li>
            <li><a href="${dir}pages/contactUs.html">Contact Us</a></li>
        </ul>
    </div>
</header>`;
        }
    }
);

customElements.define(
    "coco-footer",
    class extends HTMLElement {
        connectedCallback() {
            this.innerHTML = `<footer class="footer footer-center p-4 bg-base-300 mt-auto">
            <aside class="grid-flow-col items-center">
                <img
                    class="size-10"
                    src="${dir}/images/logo.png"
                    alt="CoCoLab Logo"
                />
                <p class="px-2">
                    &copy; ${new Date().getFullYear()} CoCoLab. All rights
                    reserved.
                </p>
            </aside>
            <nav class="grid-flow-col gap-4">
                <a>
                    <img
                        class="size-5"
                        src="${dir}/images/icons/social_media/facebook.svg"
                        alt="facebook"
                    />
                </a>
                <a>
                    <img
                        class="size-5"
                        src="${dir}/images/icons/social_media/instagram.svg"
                        alt="instagram"
                    />
                </a>
                <a>
                    <img
                        class="size-5"
                        src="${dir}/images/icons/social_media/youtube.svg"
                        alt="youtube"
                    />
                </a>
            </nav>
        </footer>`;
        }
    }
);
