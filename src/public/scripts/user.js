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
    populateUser(user);
}

function renderRoleBadge(role) {
    return `<span class="indicator-item indicator-center badge">${
        role.length > 20
            ? `<div class="tooltip" data-tip="${role}">
                        ${role.substring(0, 20)}...
                    </div>`
            : role
    }</span>`;
}

// Populates the HTML that deals with projects that the user owns
function populateOwnedProjects(projects) {
    const div = document.getElementById("owned_projects");
    if (!div) throw new Error("owned projects div does not exist");

    div.innerHTML = projects
        .map(
            (project) => `
            <a href="./project.html?id=${project.id}">
                <div class="p-4 gap-2 rounded-lg bg-base-200 flex justify-between">
                    <span>${project.project_name}</span>
                    ${
                        project.completed
                            ? '<span class="badge badge-success">Completed</span>'
                            : "<span class='badge badge-primary'>Active</span>"
                    }
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

            return `<a href="./project.html?id=${membership.project_id}">
                <div class="p-4 gap-2 rounded-lg bg-base-200 flex justify-between">
                    <span>${project.project_name}</span>
                    ${renderRoleBadge(membership.role)}
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

            return `<a href="./project.html?id=${request.project_id}">
                <div class="p-4 gap-2 rounded-lg bg-base-200 flex justify-between">
                    <span>${project.project_name}</span>
                   ${renderRoleBadge(request.role)}
                </div>
            </a>`;
        })
    ).then((html) => {
        div.innerHTML = html.join("");
    });
}

// Populates the HTML that relies on the user data
function populateUser(user) {
    if (!user) throw new Error("missing user object");

    const title = document.getElementById("profile-title");
    const name = document.getElementById("user_name");
    const joined = document.getElementById("user_joined");
    const email = document.getElementById("user_email");

    const date = new Date(user.created_at);
    joined.textContent = `Joined ${date.toLocaleDateString()}`;
    title.textContent = `${user.user_name} | Profile`;
    name.textContent = user.user_name;
    email.textContent = user.email;
}
