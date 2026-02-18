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
import { selectById, selectByValue, isValidURL, deleteByValue, getUser } from "../main.js";
let global_project_id = 0;
let current_user = getUser();

// When page loads, show information for this specific project requested by the user
//Also load whether anyone has requested to join this project
async function init() {
    //ONLY UNTIL CSS is in place!!!!!!
    loadRequestModal();
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

    //Determines whether anyone has requested to join this project. If so, trigger side modal
    getJoinRequests(project.id);
    
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
        // Get the name of that tag by its ID
        const tag_name = await getTagName(tag.tag_id);
        html += `<p class="tag">${tag_name}</p>\n`;
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
    const members = await selectByValue("project_members", "project_id", project_id);
    return members.length;
}

async function getJoinRequests(project_id){
    //will need a way to get the id of the current person using the page?
    const requests = await selectByValue("project_requests", "project_id", project_id);
    if (requests.length != 0) {loadRequestModal()};
}

function loadRequestModal() {
    const requestModal = document.querySelector("#request-modal-container");
    const requestModalHTML = requestTemplate();
    
    requestModal.innerHTML = requestModalHTML;

    document.querySelector(".accept-button").addEventListener("click", acceptRequest);
    document.querySelector(".reject-button").addEventListener("click", rejectRequest);
    document.querySelector(".close-modal").addEventListener("click", closeModal);
}

function requestTemplate() {
    //const requests = await selectByValue("project_requests", "project_id", global_project_id);
    let people = ``;
    //use when css is done
    // if (requests) {
    //     for (const request of requests) {
    //         people += `<p>${request.user_id} wants to join this project</p>\n`
    //     }
    // }
    // else {people += 'So and so would like to join this project'}
    people += 'So and so would like to join this project';
    //write html in here for the request modal
    return `<div class="request-modal">
                <button class="close-modal">X</button>
                <div id="request-box">
                    ${people}
                    <button class="accept-button">Accept</button>
                    <button class="reject-button">Reject</button>
                </div>
            </div>`
}

//will "accept" the request to join this project, adding user info to project_members
//will also delete record from project_requests and close the modal
async function acceptRequest(){
    closeModal();
}

//will "reject" the request to join, so info is not added
//still deletes record from project_requests and closes the modal
async function rejectRequest() {
    const result = deleteByValue("project_requests", )
    console.log("Person rejected");
    closeModal();

}

//For regular people viewing a project, there should be a button they can click that allows them to "join" the project
//That button will send the user's contact information to the project owner, who can then accept/reject the person

function loadCompleteProjectModal() {
    const completionModal = document.querySelector("#completion-modal-container");
    const completionModalHTML = completionTemplate();
    
    completionModal.innerHTML = completionModalHTML;

    document.querySelector(".close-modal").addEventListener("click", closeModal);
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

function closeModal() {
    let element = document.querySelector(".completion-modal");
    if (element) {
        element.remove();
    }
    else {
        element = document.querySelector(".request-modal");
        if(element) {
            element.remove();
        }
    }
}

function close() {
    window.close();
}

const return_search = document.querySelector("#return-search");
return_search.addEventListener("click", close);
const complete_project = document.querySelector("#complete-project");
complete_project.addEventListener("click", loadCompleteProjectModal);
