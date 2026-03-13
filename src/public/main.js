import { withCache, invalidateCached } from "./scripts/cache.js";
// ----------------------------------------------------------- DATABASE HELPERS

const url = "https://coco.alloc.dev";
export async function selectTable(table) {
    return withCache(`${table}`, async () => {
        const path = `${url}/API/${table}`;
        return await (await fetch(path)).json();
    });
}

export async function selectById(table, id) {
    return withCache(`${table}:id:${id}`, async () => {
        const path = `${url}/API/${table}/${id}`;
        const response = await fetch(path);
        const json = await response.json();
        return json.length === 0 ? null : json[0];
    });
}

export async function selectByValue(table, field, value) {
    return withCache(`${table}:${field}:${value}`, async () => {
        const path = `${url}/API/${table}/${field}/${value}`;
        return await (await fetch(path)).json();
    });
}

export async function deleteById(table, id) {
    const path = `${url}/API/${table}/${id}`;
    const response = await fetch(path, { method: "DELETE" });
    const json = await response.json();
    await invalidateCached(table);
    return json.length === 0 ? null : json[0];
}

export async function deleteByValue(table, field, value) {
    const path = `${url}/API/${table}/${field}/${value}`;
    const result = await (await fetch(path, { method: "DELETE" })).json();
    await invalidateCached(table);
    return result;
}

export async function insert(table, data) {
    const path = `${url}/API/${table}`;
    const result = await (
        await fetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
    ).json();
    await invalidateCached(table);
    return result;
}

export async function updateById(table, id, data) {
    const path = `${url}/API/${table}/${id}`;
    const result = await (
        await fetch(path, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
    ).json();
    await invalidateCached(table);
    return result;
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

// Safe storage wrapper: prefer browser localStorage, otherwise provide a
// test-friendly fallback on globalThis.__testLocalStorage.
const _ls = (function () {
    try {
        if (typeof localStorage !== "undefined" && localStorage)
            return localStorage;
    } catch (_) {}
    if (typeof globalThis !== "undefined") {
        if (!globalThis.__testLocalStorage) {
            globalThis.__testLocalStorage = { _data: {} };
            globalThis.__testLocalStorage.getItem = function (k) {
                return Object.prototype.hasOwnProperty.call(this._data, k)
                    ? this._data[k]
                    : null;
            };
            globalThis.__testLocalStorage.setItem = function (k, v) {
                this._data[k] = String(v);
            };
            globalThis.__testLocalStorage.removeItem = function (k) {
                delete this._data[k];
            };
        }
        return globalThis.__testLocalStorage;
    }
    const mem = { _data: {} };
    mem.getItem = function (k) {
        return Object.prototype.hasOwnProperty.call(this._data, k)
            ? this._data[k]
            : null;
    };
    mem.setItem = function (k, v) {
        this._data[k] = String(v);
    };
    mem.removeItem = function (k) {
        delete this._data[k];
    };
    return mem;
})();

export function saveToken(token) {
    console.log("Saving JWT Token...");
    try {
        _ls.setItem("token", token);
    } catch (_) {}
}

export function removeToken() {
    console.log("Removing JWT Token...");
    try {
        _ls.removeItem("token");
    } catch (_) {}
}

export function getToken() {
    console.log("Loading JWT Token...");
    try {
        return _ls.getItem("token");
    } catch (_) {
        return null;
    }
}

// Returns the user ID as a string, eg. "21" if the user is signed in.
// If the user is not signed in, then the function will return "null".
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
    } catch (err) {
        // don't forget to clear an invalid token on error
        console.log(
            "getUserId: the JWT token is invalid",
            err && err.message ? err.message : err
        );
        try {
            _ls.removeItem("token");
        } catch (_) {}
        return null;
    }
}

// --------------------------------------------- PER-PAGE NAVIGATION AND FOOTER
if (typeof document !== "undefined") {
    const header = document.getElementById("coco_header");
    if (header) {
        const user_id = getUserId();
        header.innerHTML = `
<header class="drawer sticky top-0 z-10">
    <input id="nav-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
        <div class="navbar bg-base-300 w-full">
            <div class="navbar-start">
                <label for="nav-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost" >
                    <img src="/images/icons/menu.svg" alt="Menu" />
                </label>
            </div>
            <a class="navbar-center gap-2 p-1" href="/">
                <img class="size-12" src="/images/logo.png" alt="CoCoLab Logo" />
                <h1 class="text-4xl tracking-tight font-bold">
                    CoCo<span class="text-primary">Lab</span>
                </h1>
            </a>
            <div class="navbar-end">
            ${
                user_id
                    ? `<a class="btn btn-ghost" href="/pages/user.html?id=${user_id}" id="account">
                    <span>Profile</span>
                    <img class="account" src="/images/icons/user.svg" alt="User Account" />
                </a>`
                    : `<a class="btn btn-ghost" href="/pages/auth.html">
                        Sign in
                    <img class="account" src="/images/icons/user.svg" alt="User Account" />
                    </a>`
            }
            </div>
        </div>
    </div>
    <div class="drawer-side">
        <label for="nav-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <ul class="menu bg-base-200 min-h-full w-80 p-4">
            <li> <a href="/">Home</a> </li>
        <li> <a href="/pages/projectBoard.html">Project Board</a> </li>
            <li> <a href="/pages/aboutDevs.html">About the Developers</a> </li>
            <li> <a href="/pages/contactUs.html">Contact Us</a> </li>
            ${
                user_id
                    ? '<li class="mt-auto"><button class="btn btn-ghost" onclick="logout()">Logout</button></li>'
                    : `<li class='mt-auto'> <a class='btn btn-ghost' href='/pages/auth.html'>
                        Sign in
                        <img class="account" src="/images/icons/user.svg" alt="User Account" />
                    </a> </li>`
            }
        </ul>
    </div>
</header>`;
        if (user_id) {
            window.logout = async () => {
                removeToken();
                window.location.href = "/pages/auth.html";
            };
            (async () => {
                const account = document.getElementById("account");

                const user = await selectById("users", user_id);
                if (user) {
                    account.innerHTML = `${user.user_name}
                    <div class="avatar avatar-placeholder ml-2">
                        <div class="bg-neutral text-neutral-content size-10 rounded-full">
                            <span class="text-2xl">${user.user_name.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>`;
                }
            })();
        }
    }

    const footer = document.getElementById("coco_footer");
    if (footer) {
        footer.innerHTML = `
<footer class="footer footer-center p-4 bg-base-300 mt-auto">
    <aside class="grid-flow-col items-center">
        <img class="size-10" src="/images/logo.png" alt="CoCoLab Logo" />
        <p class="px-2">&copy; CoCoLab. All rights reserved.</p>
    </aside>
    <nav class="grid-flow-col gap-4">
        <a>
            <img class="size-5" src="/images/icons/social_media/facebook.svg" alt="facebook" />
        </a>
        <a>
            <img class="size-5" src="/images/icons/social_media/instagram.svg" alt="instagram" />
        </a>
        <a>
            <img class="size-5" src="/images/icons/social_media/youtube.svg" alt="youtube" />
        </a>
    </nav>
</footer>`;
    }
}

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
    info: {
        alertClass: "alert-info",
        icon: "info-circle.svg",
    },
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
        ${icon ? `<img src="/images/icons/${icon}" alt="Icon" />` : ""}
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
if(typeof window !== "undefined"){
    window.dismissToast = dismissToast;
}
