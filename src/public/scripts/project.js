import {
    selectById,
    selectByValue,
    getUserId,
    toast,
    updateById,
    deleteById,
    insert,
} from "../main.js";

let current_user_id = getUserId();

// When page loads, show information for this specific project requested by the user
export async function init() {
    const params = new URLSearchParams(window.location.search);
    const project_id = params.get("id");
    const [project, owner, raw_members, raw_requests, raw_project_tags] =
        await Promise.all([
            selectById("project", project_id),
            selectById("users", project.owner_id),
            selectByValue("project_members", "project_id", project_id),
            selectByValue("project_requests", "project_id", project_id),
            selectByValue("projects_tags", "project_id", project_id),
        ]);
    if (project === null) {
        toast("No matching project found", "error");
        return;
    }
    const members = await Promise.all(
        raw_members.map(async (project) => {
            const user = await selectById("users", project.user_id);
            return { user, role: project.role };
        })
    );
    const requests = await Promise.all(
        raw_requests.map(async (request) => {
            if (request.user_id === null) {
                return request;
            }
            const user = await selectById("users", request.user_id);
            return { user, ...request };
        })
    );
    const tags = await Promise.all(
        raw_project_tags.map(async ({ tag_id }) => {
            const tag = await selectById("category_tags", tag_id);
            return tag ? tag.name : "INVALID_TAG";
        })
    );

    await renderProject({ ...project, owner, members, requests, tags });
}

if (typeof window !== "undefined") {
    init();
}

/**
 * Used to add an event listener to a button element inline with a random ID.
 * This is necessary because the event listener is added to the document, not the button itself.
 * @param {function(PointerEvent): void} fn - The event handler function.
 */
function onclick(fn) {
    const id = crypto.randomUUID();
    setTimeout(() => {
        document.getElementById(id).addEventListener("click", fn);
    }, 1);
    return 'id="' + id + '"';
}

function on(event, fn) {
    const id = crypto.randomUUID();
    setTimeout(() => {
        document.getElementById(id).addEventListener(event, fn);
    }, 1);
    return 'id="' + id + '"';
}

export function renderUser(user, is_owner) {
    const show_email = is_owner || current_user_id === user.id;
    return `
    <div class="flex gap-2 p-3 w-full">
        <div class="avatar avatar-placeholder">
            <div class="bg-neutral text-neutral-content size-10 rounded-full">
                <span class="text-2xl">${user.user_name.charAt(0).toUpperCase()}</span>
            </div>
        </div>
        <div class="flex flex-col justify-center w-full">
            <span class="text-sm opacity-70">${user.user_name}</span>
            ${show_email ? `<span class="text-sm opacity-70">${user.email}</span>` : ""}
        </div>
    </div>`;
}

export async function renderProject(project) {
    const card = document.getElementById("project");

    const is_owner = current_user_id === project.owner_id;
    // const is_owner = true;

    function renderActions() {
        if (current_user_id === null) {
            return "";
        }
        if (is_owner) {
            return `
            <button class="btn btn-ghost" ${onclick((e) => {
                deleteProject(e.currentTarget, project.id);
            })}>
                Delete Project
            </button>
            <button class="btn btn-outline" onclick="owner_request_modal.showModal()">
                Request role
            </button> ${renderRoleModal("owner_request_modal", (role) => {
                request({
                    user_id: null, // null means request from the owner
                    project_id: project.id,
                    role,
                });
                owner_request_modal.close();
            })}
            <button class="btn btn-primary" ${project.completed ? "disabled" : ""} ${onclick(
                (e) => {
                    completeProject(e.currentTarget, project.id);
                }
            )}>
                Complete Project
            </button>`;
        } else if (
            project.members.some(
                (member) => member.user.id === current_user_id
            ) ||
            project.requests.some(
                (request) => request.user_id === current_user_id
            )
        ) {
            return "";
        } else {
            return `<button class="btn btn-primary" onclick="user_request_modal.showModal()">
                Join this Project
            </button> ${renderRoleModal("user_request_modal", (role) => {
                request({
                    user_id: current_user_id,
                    project_id: project.id,
                    role,
                });
                user_request_modal.close();
            })}`;
        }
    }

    card.innerHTML = `
        <h1 class="card-title text-3xl font-bold">
            ${project.project_name}
        </h1>
        <div class="flex flex-wrap gap-2">
            ${project.tags.map((tag) => `<div class="badge badge-outline">${tag}</div>\n`)}
        </div>
        <h3 class="text-2xl font-semibold mt-4">Project Details</h3>
        <p class="project-details leading-relaxed wrap-break-word">
            ${project.details}
        </p>
        <h3 class="text-2xl font-semibold mt-4">Project Members</h3>
        <div class="flex flex-wrap gap-4">
            <div class="indicator bg-base-300 rounded-box mt-2">
                <span class="indicator-item indicator-center badge badge-primary">Owner</span>
                ${renderUser(project.owner, is_owner)}
            </div>
            ${project.members
                .map(
                    (
                        member
                    ) => `<div class="indicator bg-base-200 rounded-box mt-2">
                    <span class="indicator-item indicator-center badge">${member.role}</span>
                    ${renderUser(member.user, is_owner)}
                </div>`
                )
                .join("")}
            ${project.requests
                .map((request) => {
                    if (!is_owner && request.user) return "";
                    return `
                <div class="indicator flex gap-2 items-center mt-2">
                    <span class="indicator-item indicator-center badge">${request.role}</span>
                    ${
                        request.user
                            ? is_owner
                                ? `${renderUser(request.user, is_owner)}
                    <button class="btn btn-square btn-primary btn-sm" value="${request.id}" ${onclick(
                        (e) => {
                            acceptRequest(e.currentTarget, request);
                        }
                    )}>
                        <img src="../images/icons/check.svg" alt="Accept" />
                    </button>
                    <button class="btn btn-square btn-secondary btn-sm" value="${request.id}" ${onclick(
                        (e) => {
                            deleteRequest(e.currentTarget, request.id);
                        }
                    )}>
                        <img src="../images/icons/xmark.svg" alt="Reject" />
                    </button>`
                                : ""
                            : is_owner
                              ? `
                    <button class="btn btn-secondary" value="${request.id}" ${onclick(
                        (e) => {
                            deleteRequest(e.currentTarget, request.id);
                        }
                    )}>
                        Delete Role Request
                    </button>`
                              : `
                    <button class="btn btn-primary" value="${request.id}" ${onclick(
                        (e) => {
                            attachRequest(e.currentTarget, request.id);
                        }
                    )}>
                        Join Role Request
                    </button>`
                    }
                </div>`;
                })
                .join("")}
        </div>
        <div class="card-actions justify-end mt-4">
            <a class="btn btn-ghost" href="projectBoard.html">
                Back to search
            </a>
            ${renderActions()}
        </div>`;
}

export function renderRoleModal(id, onSubmit) {
    return `
    <dialog id="${id}" class="modal">
        <div class="modal-box flex flex-col gap-4">
            <h3 class="font-bold text-lg">Role Selection</h3>
            <form class="flex flex-col gap-4" ${on("submit", (e) => {
                e.preventDefault();
                onSubmit(e.currentTarget.role.value);
            })}>
                <input
                    name="role"
                    type="text"
                    placeholder="Role"
                    class="input input-bordered w-full"
                    required
                />
                <button type="submit" class="btn btn-primary">
                    Send Request
                </button>
            </form>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
    `;
}

export async function request(body) {
    try {
        const response = await insert("project_requests", body);
        console.log(response);
    } catch (err) {
        console.log(err);
        toast("Error occurred. Try request again later.", "error");
        return;
    }

    toast("Request sent successfully");
}

export async function attachRequest(btn, id) {
    btn.disabled = true;
    try {
        const response = await updateById("project_requests", id, {
            user_id: current_user_id,
        });
        console.log(response);
    } catch (err) {
        console.log(err);
        toast("Error occurred. Try request again later.", "error");
        return;
    }

    toast("Request updated successfully");
}

export async function acceptRequest(btn, request) {
    btn.disabled = true;
    try {
        //Add member
        const addResult = await insert("project_members", {
            project_id: request.project_id,
            user_id: request.user_id,
            role: request.role,
        });
        console.log(addResult);

        //Delete Request
        const result = await deleteById("project_requests", request.id);
        console.log(result);
    } catch (err) {
        console.log(err);
        toast("Error occurred. Try request again later.", "error");
        btn.disabled = false;
        return;
    }

    toast("Successfully accepted project member");

    //Get user to show up onscreen
}

export async function deleteRequest(btn, request_id) {
    btn.disabled = true;
    try {
        const result = await deleteById("project_requests", request_id);
        console.log(result);
    } catch (err) {
        console.log(err);
        toast("Error occurred. Try request again later.", "error");
        btn.disabled = false;
        return;
    }

    toast("Successfully rejected project member");
    // remove user from rendered page
}

export async function completeProject(btn, project_id) {
    btn.disabled = true;
    try {
        const response = await updateById("project", project_id, {
            completed: true,
        });
        console.log(response);
    } catch (err) {
        console.log(err);
        toast("Error occurred. Try request again later.", "error");
        btn.disabled = false;
        return;
    }

    toast("You completed this project!! Good job :)");
}

export async function deleteProject(btn, project_id) {
    btn.disabled = true;
    try {
        await deleteById("project", project_id);
    } catch (err) {
        console.log(err);
        toast("Error occurred. Try request again later.", "error");
        btn.disabled = false;
        return;
    }

    toast("You deleted this project. :(");
}
