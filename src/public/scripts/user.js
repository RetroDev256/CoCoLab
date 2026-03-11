import { selectById, selectByValue } from "../main.js";

// Populate the page via repeated API calls - this will increase load times for
// the server when there is a cache miss, but the complexity of static content
// generation is likely out of scope for this project right now.
if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const user_id = params.get("id");

    // If the user id does not exist somehow, redirect to the auth page
    if (!user_id) window.location.href = "./auth.html";

    const [user, owned, memberships, requests] = await Promise.all([
        selectById("users", user_id),
        selectByValue("project", "owner_id", user_id),
        selectByValue("project_members", "user_id", user_id),
        selectByValue("project_requests", "user_id", user_id),
    ]);

    populateOwnedProjects(owned);
    populateMemberships(memberships);
    populateRequests(requests);
    populateRoles(memberships);
    populateUser(user);
}

// Populates the HTML that deals with projects that the user owns
function populateOwnedProjects(projects) {
    const div = document.getElementById("owned_projects");
    if (!div) throw new Error("owned projects div does not exist");

    div.innerHTML = projects
        .map(
            (project) => `
            <a href="./project.html?id=${project.id}" target="_blank">
                <div class="p-4 gap-2 rounded-lg bg-base-200 flex justify-between">
                    <span>${project.project_name}</span>
                    ${project.completed ? '<span class="badge badge-success">Completed</span>' : "<span class='badge badge-primary'>Active</span>"}
                    
                </div>
            </a>`
        )
        .join("");
}

// Populates the HTML that deals with projects that the user works with
async function populateMemberships(memberships) {
    const div = document.getElementById("member_projects");
    if (!div) throw new Error("member projects div does not exist");

    Promise.all(
        memberships.map(async (membership) => {
            const project = await selectById("project", membership.project_id);
            if (!project) throw new Error("membership references void project");

            return `
        <a href="./project.html?id=${membership.project_id}" target="_blank">
            <div class="p-4 gap-2 rounded-lg bg-base-200 flex justify-between">
                <span>${project.project_name}</span>
                <span class="badge badge-primary">${membership.role}</span>
            </div>
        </a>`;
        })
    ).then((html) => {
        div.innerHTML = html.join("");
    });
}

// Populates the HTML that deals with requests for your project roles
async function populateRequests(requests) {
    const div = document.getElementById("pending_requests");
    if (!div) throw new Error("pending requests div does not exist");

    Promise.all(
        requests.map(async (request) => {
            const project = await selectById("project", request.project_id);
            if (!project) throw new Error("membership references void project");

            return `
        <a href="./project.html?id=${request.project_id}" target="_blank">
            <div class="p-4 gap-2 rounded-lg bg-base-200 flex justify-between">
                <span>${project.project_name}</span>
                <span class="badge badge-primary">${request.role}</span>
            </div>
        </a>`;
        })
    ).then((html) => {
        div.innerHTML = html.join("");
    });
}

// Populates the HTML that deals with roles associated with the user
function populateRoles(memberships) {
    const div = document.getElementById("user_roles");
    if (!div) throw new Error("user tags div does not exist");

    // De-duplicate the list of roles
    const role_list = new Set();
    for (const membership of memberships) role_list.add(membership.role);
    div.innerHTML = Array.from(role_list).map(
        (role) => `<span class="badge badge-secondary">${role}</span>`
    );
}

// Populates the HTML that relies on the user data
function populateUser(user) {
    if (!user) throw new Error("missing user object");

    const title = document.getElementById("profile-title");
    const div = document.getElementById("profile");
    if (!div) throw new Error("profile div does not exist");

    title.textContent = `${user.user_name} | Profile`;
    div.innerHTML = `<div class="flex items-center gap-4">

        <div class="avatar avatar-placeholder">
            <div class="bg-neutral text-neutral-content size-20 rounded-full">
                <span class="text-5xl">${user.user_name.charAt(0).toUpperCase()}</span>
            </div>
        </div>

        <div class="space-y-1">
            <h1 class="text-4xl font-bold" id="user_name">${user.user_name}</h1>
            <p class="opacity-70" id="user_joined">
            ${new Date(user.created_at).toLocaleDateString()}
            </p>
            <p class="opacity-70" id="user_email">${user.email}</p>
        </div>
    </div>`;
}
