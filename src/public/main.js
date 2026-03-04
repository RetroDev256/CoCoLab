// ----------------------------------------------------------- DATABASE HELPERS

const url = "https://coco.alloc.dev";
// Returns a list of all JS objects in a table
export async function selectTable(table) {
    const path = `${url}/API/${table}`;
    return await (await fetch(path)).json();
}

// Returns either a single JS object, or null
export async function selectById(table, id) {
    const path = `${url}/API/${table}/${id}`;
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
    const path = `${url}/API/${table}/${field}/${value}`;
    return await (await fetch(path)).json();
}

// Returns either a single JS object, or null
export async function deleteById(table, id) {
    const path = `${url}/API/${table}/${id}`;
    const response = await fetch(path, { method: "DELETE" });
    const json = await response.json();

    if (json.length === 0) {
        return null;
    } else {
        return json[0];
    }
}

// Returns a list based on a table, field, and value
export async function deleteByValue(table, field, value) {
    const path = `${url}/API/${table}/${field}/${value}`;
    return await (await fetch(path, { method: "DELETE" })).json();
}

export async function insert(table, data) {
    const path = `${url}/API/${table}`;
    return await (
        await fetch(path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
    ).json();
}

export async function updateById(table, id, data) {
    const path = `${url}/API/${table}/${id}`;
    return await (
        await fetch(path, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
    ).json();
}

export async function updateByValue(table, field, value, data) {
    const path = `${url}/API/${table}/${field}/${value}`;
    return await (
        await fetch(path, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
    ).json();
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

// --------------------------------------------- PER-PAGE NAVIGATION AND FOOTER

const dir = new URL(".", import.meta.url).href;
document.getElementById("coco_header").innerHTML = `
<header class="drawer sticky top-0 z-10">
    <input id="nav-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
        <div class="navbar bg-base-300 w-full">
            <div class="navbar-start">
                <label for="nav-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost" >
                    <img src="${dir}/images/icons/menu.svg" alt="Menu" />
                </label>
            </div>
            <a class="navbar-center gap-2 p-1" href="/">
                <img class="size-12" src="${dir}images/logo.png" alt="CoCoLab Logo" />
                <h1 class="text-4xl tracking-tight font-bold">
                    CoCo<span class="text-primary">Lab</span>
                </h1>
            </a>
            <div class="navbar-end">
                <a class="btn btn-ghost btn-circle" href="${dir}${getUserId() ? "pages/userSettings.html" : "pages/auth.html"}">
                    <img class="account" src="${dir}images/icons/user.svg" alt="User Account" />
                </a>
            </div>
        </div>
    </div>
    <div class="drawer-side">
        <label for="nav-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <ul class="menu bg-base-200 min-h-full w-80 p-4">
            <!-- Sidebar content here -->
            <li> <a href="${dir}pages/projectBoard.html">Project Board</a> </li>
            <li> <a href="${dir}pages/aboutDevs.html">About the Developers</a> </li>
            <li> <a href="${dir}pages/contactUs.html">Contact Us</a> </li>
        </ul>
    </div>
</header>`;

document.getElementById("coco_footer").innerHTML = `
<footer class="footer footer-center p-4 bg-base-300 mt-auto">
    <aside class="grid-flow-col items-center">
        <img class="size-10" src="${dir}/images/logo.png" alt="CoCoLab Logo" />
        <p class="px-2">&copy; CoCoLab. All rights reserved.</p>
    </aside>
    <nav class="grid-flow-col gap-4">
        <a>
            <img class="size-5" src="${dir}/images/icons/social_media/facebook.svg" alt="facebook" />
        </a>
        <a>
            <img class="size-5" src="${dir}/images/icons/social_media/instagram.svg" alt="instagram" />
        </a>
        <a>
            <img class="size-5" src="${dir}/images/icons/social_media/youtube.svg" alt="youtube" />
        </a>
    </nav>
</footer>`;

const typeMap = {
    success: {
        alertClass: "alert-success",
        icon: "check.svg",
    },
    error: {
        alertClass: "alert-error",
        icon: "xmark.svg",
    },
    warning: {
        alertClass: "alert-warning",
        icon: "warning-triangle.svg",
    },
    info: { alertClass: "alert-info", icon: "info-circle.svg" },
    neutral: {
        alertClass: "alert-neutral",
    },
};

export function toast(message, type = "neutral", duration = 5000) {
    const container = document.getElementById("toast-container");

    const { alertClass, icon } = typeMap[type] || typeMap.neutral;

    const wrapper = document.createElement("div");
    wrapper.className = "toast-item alert " + alertClass;

    wrapper.innerHTML = `
        ${icon ? `<img src="${dir}/images/icons/${icon}" alt="Icon" />` : ""}
        <span class="text-sm font-medium flex-1">${message}</span>
        <button onclick="dismissToast(this)" class="btn btn-ghost btn-xs btn-circle justify-self-end">✕</button>
      `;

    container.appendChild(wrapper);

    // Trigger enter animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => wrapper.classList.add("show"));
    });

    // Auto dismiss
    const timer = setTimeout(() => dismissToast(null, wrapper), duration);
    wrapper._timer = timer;
}

export function dismissToast(btn, wrapper) {
    const el = wrapper || btn.closest(".toast-item");
    if (!el || el._dismissing) return;
    el._dismissing = true;
    clearTimeout(el._timer);
    el.classList.remove("show");
    el.classList.add("hide");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
}
