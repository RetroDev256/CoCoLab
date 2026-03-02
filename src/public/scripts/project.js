// This is the logic behind a project, regardless of which project it is
// this page will need to get the project id and use that to grab information from the server
// and use it to populate the page

// Helper functions for the API in the root main.js (client-side) file
import {
    selectById,
    selectByValue,
    isValidURL,
    getUserId,
    toast,
} from "../main.js";
//For use in creating project request
let global_project_id = 0;
let current_user_id = getUserId();
const current_user = await selectById("users", current_user_id);
// console.log(`Current User: ${current_user}`);

// When page loads, show information for this specific project requested by the user
async function init() {
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

init();

async function renderProject(project) {
    const renderElder = document.getElementById("project");
    global_project_id = project.owner_id;

    const owner_info = await getOwnerData(project.owner_id);
    const tags_info = await getTagsTemplate(project.id);
    const total_helpers = await getHelpersTotal(project.id);

    renderElder.innerHTML = ` <h1 class="card-title text-3xl font-bold project-title">
                    ${project.project_name}
                </h1>
                <h3 class="text-sm opacity-70 project-owner">
                    Created by ${owner_info}
                </h3>

                <div class="flex flex-wrap gap-2 my-4 project-tags">
                    ${tags_info}
                </div>

                <div class="divider">Project Details</div>
                <p class="project-details leading-relaxed">
                    ${project.details}
                </p>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 text-sm">
                    <div class="stat p-2 bg-base-200 rounded-box">
                        <div class="stat-title text-xs">Deadline</div>
                        <div class="stat-value text-base">None</div>
                    </div>
                    <div class="stat p-2 bg-base-200 rounded-box">
                        <div class="stat-title text-xs">Needed</div>
                        <div class="stat-value text-base people-needed">${project.max_people}</div>
                    </div>
                    <div class="stat p-2 bg-base-200 rounded-box">
                        <div class="stat-title text-xs">Filled</div>
                        <div class="stat-value text-base people-have">${total_helpers}</div>
                    </div>
                </div>

                <div class="card-actions justify-end mt-4">
                    <a id="return-search" class="btn btn-ghost" href="projectBoard.html">
                        Back to search
                    </a>
                    <button id="join-project" class="btn btn-primary" ${total_helpers >= project.max_people || current_user_id === null ? "disabled" : ""} onclick="sendInformation()">
                        Join this Project
                    </button>
                </div>`;
}

// Returns html for owner information
async function getOwnerData(owner_id) {
    const owner = await selectById("users", owner_id);

    // Handle the case where we can't find a user with that ID
    if (owner === null) return `Unknown project owner`;

    // Render the HTML depending on if the profile URL is valid
    if (isValidURL(owner.profile_url)) {
        return `Created By: <a href="${owner.profile_url}">${owner.user_name}</a>`;
    } else {
        return `Created By: ${owner.user_name}`;
    }
}

// Returns html for rendering tags associated with this project
async function getTagsTemplate(project_id) {
    // Get the list of all projects_tags for that project_id
    const tag_list = await selectByValue(
        "projects_tags",
        "project_id",
        project_id
    );

    if (tag_list.length === 0) {
        console.log(`There are no tags for project ${project_id}`);
    }

    let html = ``;
    for (const tag of tag_list) {
        // Get the name of that tag by its ID
        const tag_name = await getTagName(tag.tag_id);
        html += `<div class="badge badge-outline">${tag_name}</div>\n`;
    }

    return html;
}

// Get the name of a tag based on its ID
async function getTagName(tag_id) {
    const tag = await selectById("category_tags", tag_id);
    return tag ? tag.name : "INVALID_TAG";
}

// Returns the number of helpers that are already on the project
async function getHelpersTotal(project_id) {
    const members = await selectByValue(
        "project_members",
        "project_id",
        project_id
    );
    return members.length;
}

//For regular people viewing a project, there should be a button they can click that allows them to "join" the project
//That button will send the user's contact information to the project owner, who can then accept/reject the person

//This will need some sort of API call to make a record with this user's ID and project owner's ID
async function sendInformation() {
    console.log("Simulating sending information...");
    const join_project = document.getElementById("join-project");
    join_project.disabled = true;

    //user has to exist, otherwise this will not run
    if (current_user !== null) {
        //Here we only need the ID- the contact information can be fetched using it later
        const response = await fetch(
            "https://coco.alloc.dev/api/project_requests",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: current_user.id,
                    project_id: global_project_id,
                    role: "requester",
                }),
            }
        );
        console.log(response);
        if (response.ok) {
            toast("Request sent successfully");
        } else {
            toast("Error occured. Try request again later.", "error");
            join_project.disabled = false;
        }
    } else {
        toast(
            "You are not logged in. Please log in before joining any projects.",
            "error"
        );
        join_project.disabled = false;
    }
}
