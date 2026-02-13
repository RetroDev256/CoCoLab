// This is the logic behind a project, regardless of which project it is
// this page will need to get the project id and use that to grab information from the server
// and use it to populate the page

//There will be a bonus popup that will show on this page when there is someone who wants to join the project
//The owner can view the user's profile, then reject (popup goes away, internal request is removed) OR
//accept (popup goes away, request is removed, user_id gets added to project_members, and consequently shows up onscreen)

//For project owner, there should be a button that will allow them to mark the project as complete.
//They can record completion details and submit, which will save information and change project status to completed,
//thus removing the project from the projectBoard. It will still be visible for the project owner and the other
//contributors on their personal profiles (and/or the projectManager)

//Project owner should also be able to see users (and their contact information) associated with this project

// Helper functions for the API in the root main.js (client-side) file
import { selectById, selectByValue, isValidURL } from "../main.js";

// When page loads, show information for this specific project requested by the user
async function init() {
    const project = await selectById("project", 2); // Example

    if (project === null) {
        console.log("No matching project found");
        return;
    }

    await renderProject(project);
}

init();

async function renderProject(project) {
    //Project title
    const title = document.querySelector(".project-title");
    const titleHead = document.querySelector(".project-title-head");
    title.innerHTML = project.project_name;
    titleHead.innerHTML = project.project_name;

    //User who created it, along with a link to that user's profile
    //This calls a separate function that makes call to owner endpoint and gets that owner's name and hyperlink
    const owner_info = await getOwnerData(project.owner_id);
    const user = document.querySelector(".project-owner");
    user.innerHTML = owner_info;

    //array of tags associated with this project
    //Calls a separate function that will call the project-tags table and get that information
    const tags_info = await getTagsTemplate(project.id);
    const project_tags = document.querySelector(".project-tags");
    project_tags.innerHTML = tags_info;

    //Details about this project
    const details = document.querySelector(".project-details");
    details.innerHTML = project.details;

    //The deadline for this project, if there is one
    //Currently not implementing this, so deadline will always be none

    //How many people are needed to help
    const needed = document.querySelector(".people-needed");
    needed.innerHTML = `Number of people needed: ${project.max_people}`;

    //How many people are already helping on the project
    //Separate function will call endpoint and total them up
    const helpers = document.querySelector(".people-have");
    const total_helpers = await getHelpersTotal(project.id);
    helpers.innerHTML = `Spots filled: ${total_helpers}`;
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
    const tag_list = await selectByValue("projects_tags", "project_id", project_id);

    if (tag_list.length === 0) {
        console.log(`There are no tags for project ${project_id}`);
    }

    let html = ``;
    for (const tag of tag_list) {
        // Get the name of that tag by it's ID
        const tag_name = await getTagName(tag.tag_id);
        html += `<p class="tag">${tag_name}</p>\n`;
    }

    return html;
}

// Get the name of a tag based on it's ID
async function getTagName(tag_id) {
    const tag = await selectById("category_tags", tag_id);
    return tag ? tag.name : "INVALID_TAG";
}

// Returns the number of helpers that are already on the project
async function getHelpersTotal(project_id) {
    const members = await selectByValue("project_members", "project_id", project_id);
    return members.length;
}

//For regular people viewing a project, there should be a button they can click that allows them to "join" the project
//That button will send the user's contact information to the project owner, who can then accept/reject the person

function loadCompleteProjectModal() {
    const completionModal = document.querySelector("#completion-modal-container");
    const completionModalHTML = completionTemplate();
    
    completionModal.innerHTML = completionModalHTML;

    document.querySelector(".close-modal").addEventListener("click", closeQuestion);
}

function completionTemplate() {
    //write html in here for the completion modal
    return `<div class="completion-modal">
                <button class="close-modal">X</button>
                <div id="completion-box">
                    <p>It's a me</p>
                </div>
            </div>`
}

function closeQuestion() {
    const element = document.querySelector(".completion-modal");
    if (element) {
        element.remove();
    }
}

function close() {
    window.close();
}

const return_search = document.querySelector("#return-search");
return_search.addEventListener("click", close);
const complete_project = document.querySelector("#complete-project");
complete_project.addEventListener("click", loadCompleteProjectModal);
