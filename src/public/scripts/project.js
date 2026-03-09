// This is the logic behind a project, regardless of which project it is
// this page will need to get the project id and use that to grab information from the server
// and use it to populate the page

// Helper functions for the API in the root main.js (client-side) file
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
let global_project_id = 0;

// When page loads, show information for this specific project requested by the user
export async function init() {
    const params = new URLSearchParams(window.location.search);
    const project_id = params.get("id");
    global_project_id = project_id;
    const project = await selectById("project", project_id);

    if (project === null) {
        console.log("No matching project found");
        return;
    }

    await renderProject(project);
}

if (typeof window !== "undefined") {
    init();
}

export function renderUser(user) {
    return ` <div class="flex gap-2 rounded-box bg-base-200 p-3">
                    <div class="avatar avatar-placeholder">
                        <div class="bg-neutral text-neutral-content size-10 rounded-full">
                            <span class="text-2xl">${user.user_name.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm opacity-70">${user.user_name}</span>
                        <span class="text-sm opacity-70">${user.email}</span>
                    </div>
                </div>`;
}

export async function renderProject(project) {
    const renderElder = document.getElementById("project");

    const owner = await getUser(project.owner_id);
    const members = await getMembers();

    const is_owner = current_user_id === project.owner_id;

    async function renderActions() {
        if (current_user_id === null) {
            return "";
        }
        if (is_owner) {
            return `${await renderRequests(project.id)}
            <button id="complete-project" class="btn btn-primary" ${project.completed ? "disabled" : ""}>
                Complete Project
            </button>`;
        } else if (
            members.some((member) => member.user.id === current_user_id)
        ) {
            return "";
        } else {
            return `<button id="join-project" class="btn btn-primary" ${members.length >= project.max_people ? "disabled" : ""}>
                Join this Project
            </button>`;
        }
    }

    renderElder.innerHTML = `<h1 class="card-title text-3xl font-bold">
                    ${project.project_name}
                </h1>
                <div class="flex flex-wrap gap-2">
                    ${await renderTags()}
                </div>
                <h3 class="text-2xl font-semibold mt-4">Project Details</h3>
                <p class="project-details leading-relaxed">
                    ${project.details}
                </p>
                <h3 class="text-2xl font-semibold mt-4">Project Members</h3>
                <div class="flex items-center gap-4">
                    <span>${members.length} of ${project.max_people} people </span>
                    <progress class="progress w-20" value="${members.length}" max="${project.max_people}"></progress>
                    <span>${(members.length / project.max_people) * 100}% filled</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div class="indicator">
                        <span class="indicator-item indicator-center badge badge-primary">Owner</span>
                        ${renderUser(owner)}
                    </div>
                    ${members
                        .map(
                            (member) => `<div class="indicator">
                            <span class="indicator-item indicator-center badge">${member.role}</span>
                            ${renderUser(member.user)}
                        </div>`
                        )
                        .join("")}
                </div>
                <div class="card-actions justify-end mt-4">
                    <a id="return-search" class="btn btn-ghost" href="projectBoard.html">
                        Back to search
                    </a>
                    ${await renderActions()}
                </div>`;

    addListeners();
}

export async function renderTags() {
    // Get the list of all projects_tags for that project_id
    const tag_ids = await selectByValue(
        "projects_tags",
        "project_id",
        global_project_id
    );

    if (tag_ids.length === 0) {
        console.log(`There are no tags for project ${global_project_id}`);
        return "";
    }

    const tag_names = await Promise.all(
        tag_ids.map(async ({ tag_id }) => {
            const tag = await selectById("category_tags", tag_id);
            return tag ? tag.name : "INVALID_TAG";
        })
    );

    return tag_names
        .map((tag) => `<div class="badge badge-outline">${tag}</div>\n`)
        .join("");
}

export async function renderRequests() {
    const requests = await getJoinRequests();

    if (requests.length === 0) {
        return "";
    }

    return `
    <button class="btn" onclick="request_modal.showModal()">
        ${requests.length} Join Request${requests.length > 1 ? "s" : ""}
    </button>
    <dialog id="request_modal" class="modal">
        <div class="modal-box">
            <h3 class="text-lg font-bold">Join Requests</h3>
            <ul class="list">
            ${requests
                .map(
                    (request) => `
                    <li class="list-row items-center">
                       ${renderUser(request.user)}
                       ${request.role}
                        <button class="btn btn-square btn-primary accept-button" value="${request.id}">
                            <img src="../images/icons/check.svg" alt="Accept" />
                        </button>
                        <button class="btn btn-square btn-secondary reject-button" value="${request.id}">
                            <img src="../images/icons/xmark.svg" alt="Reject" />
                        </button>
                    </li>
                `
                )
                .join("")}
            </ul>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
    `;
}

export async function getUser(user_id) {
    return selectById("users", user_id);
}

export async function getMembers() {
    const project_members = await selectByValue(
        "project_members",
        "project_id",
        global_project_id
    );
    return await Promise.all(
        project_members.map(async (project) => {
            const user = await getUser(project.user_id);
            return { user, role: project.role };
        })
    );
}

export async function getJoinRequests() {
    const requests = await selectByValue(
        "project_requests",
        "project_id",
        global_project_id
    );
    return await Promise.all(
        requests.map(async (request) => {
            const user = await getUser(request.user_id);
            return { user, ...request };
        })
    );
}

export function addListeners() {
    const join_project_btn = document.getElementById("join-project");
    if (join_project_btn)
        join_project_btn.addEventListener("click", (e) =>
            request(e.currentTarget)
        );
    const accept_request_btns = document.querySelectorAll(".accept-button");
    for (const btn of accept_request_btns) {
        btn.addEventListener("click", (e) => acceptRequest(e.currentTarget));
    }
    const reject_request_btns = document.querySelectorAll(".reject-button");
    for (const btn of reject_request_btns) {
        btn.addEventListener("click", (e) => rejectRequest(e.currentTarget));
    }
    const complete_project_btn = document.getElementById("complete-project");
    if (complete_project_btn)
        complete_project_btn.addEventListener("click", (e) =>
            completeProject(e.currentTarget)
        );
}

//For regular people viewing a project, there should be a button they can click that allows them to "join" the project
//That button will send the user's contact information to the project owner, who can then accept/reject the person

export async function request(btn) {
    btn.disabled = true;

    try {
        const response = await insert("project_requests", {
            user_id: current_user_id,
            project_id: global_project_id,
            role: "requester",
        });
        console.log(response);
    } catch (err) {
        console.log(err);
        toast("Error occurred. Try request again later.", "error");
        btn.disabled = false;
        return;
    }

    toast("Request sent successfully");
}

export async function acceptRequest(btn) {
    const request_id = btn.value;
    btn.disabled = true;
    try {
        const request = await selectById("project_requests", request_id);
        //Add member
        const addResult = await insert("project_members", {
            project_id: request.project_id,
            user_id: request.user_id,
            role: request.role,
        });
        console.log(addResult);

        //Delete Request
        const result = await deleteById("project_requests", request_id);
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

export async function rejectRequest(btn) {
    const request_id = btn.value;
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

//For project owners, they can mark a project as complete. That will make it so the project won't show
//on the project board. It will print a notice of success, then disable the button
export async function completeProject(btn) {
    btn.disabled = true;
    try {
        const response = await updateById("project", global_project_id, {
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
async function createProject() {
    const tabledata = {
        project_name: document.querySelector("#project_name_input").value,
        max_people: document.querySelector("#max_people_input").value,
        details: document.querySelector("#details_input").value,
        owner_id: getUserId(),
    };

    try {
        const response = await insert("project", tabledata);
        console.log("Project created successfully:", response);
        alert("Project created successfully!");
    } catch (error) {
        console.error("Error creating project:", error);
        alert("Error creating project. Please try again.");
    }
}

if (typeof document !== "undefined") {
    const return_search = document.querySelector("#return-search");
    return_search.addEventListener("click", close);
    const join_project = document.querySelector("#join-project");
    join_project.addEventListener("click", sendInformation);
    const createButton = document.querySelector("create-project-button");
    createButton.addEventListener("click", async (event) => {
        event.preventDefault();
        await createProject();
    });
}
