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
    
    //Project owners also get to see each person who has signed up along with contact info
    const helpers_info = await getPeopleTemplate(project.id);
    const helpers_box = document.querySelector(".helpers-info");
    helpers_box.innerHTML = helpers_info;

    //Determines whether anyone has requested to join this project. If so, trigger side modal
    getJoinRequests(project.id);

    //Hides completion button if the project has already been marked as complete
    const complete_project = document.querySelector("#complete-project");
    if (project.completed) {
        complete_project.style.visibiltiy = 'hidden';
        const comp_notice = document.querySelector("#completion-status");
        comp_notice.innerHTML = `This project has already been completed! Good job :)`
    }
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

async function getPeopleTemplate(project_id) {
    const members = await selectByValue("project_members", "project_id", project_id);
    if (members.length === 0) {
        console.log(`There are no people helping on this project ${project_id}`);
    }
    let html = ``;
    for (const person of members) {
        if (html === '') {
            html += `<p>People helping on this project:</p>`
        }
        const person_details = await getPersonDetails(person.user_id);
        html += `<p><a href="${person_details.profile_url}">${person_details.user_name}</a>: ${person_details.email}</p>`
    }
    return html;
}

async function getPersonDetails(user_id) {
    const person = await selectById("users", user_id);
    return person ? person : "INVALID_PERSON";
}

async function getJoinRequests(project_id){
    //will need a way to get the id of the current person using the page?
    const requests = await selectByValue("project_requests", "project_id", project_id);
    if (requests.length != 0) {loadRequestModal(requests)};
}

function loadRequestModal(requests) {
    //const requests = await selectByValue("project_requests", "project_id", global_project_id);
    const requestModal = document.querySelector("#request-modal-container");
    const requestModalHTML = requestTemplate(requests);
    
    requestModal.innerHTML = requestModalHTML;

    document.querySelector(".accept-button").addEventListener("click", acceptRequest(requests));
    document.querySelector(".reject-button").addEventListener("click", rejectRequest(requests));
    document.querySelector(".close-modal").addEventListener("click", closeModal);
}

function requestTemplate(requests) {
    let people = ``;
    //use when css is done
    //     for (const request of requests) {
    //         people += `<p>${request.user_id} wants to join this project</p>\n`
    //     }
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
//This will cause the user in question to show up onscreen WITH contact information
//will also delete record from project_requests and close the modal
async function acceptRequest(requests){
    for (const request in requests) {
        //Add user
        const addResult = await fetch("https://coco.alloc.dev/api/project_members", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: request.user_id,
                project_id: global_project_id,
                role: "member"
            })
        });
        console.log(addResult);

        //Get user to show up onscreen
        const helpers_box = document.querySelector(".helpers-info");
        const person = await getPersonDetails(request.user_id);
        helpers_box.innerHTML += `<p><a href="${person_details.profile_url}">${person_details.user_name}</a>: ${person_details.email}</p>`;

        //Delete user
        const result = await deleteByValue("project_requests", "user_id", request.user_id);
        console.log(`Person ${request.user_id} accepted and record deleted: ${result}`);
    }
    closeModal();
}

//will "reject" the request to join, so info is not added
//still deletes record from project_requests and closes the modal
async function rejectRequest(requests) {
    for (const request in requests) {
        const result = await deleteByValue("project_requests", "user_id", request.user_id);
        console.log(`Person ${request.user_id} rejected and record deleted: ${result}`);
    }
    closeModal();

}

//For project owners, they can mark a project as complete. That will make it so the project won't show
//on the project board. It will print a notice of success, then disable the button
async function completeProject() {
    const current_project = await selectById("project", global_project_id);
    const response = await fetch("https://coco.alloc.dev/api/project", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            //best I can figure right now is that this needs to have all data
            body: JSON.stringify({
                id: global_project_id,
                project_name: current_project.project_name,
                max_people: current_project.max_people,
                details: current_project.details,
                created_at: current_project.created_at,
                completed: true,
                owner_id: current_project.owner_id
            })
        });
        console.log(response);

    const comp_notice = document.querySelector("#completion-status");
    comp_notice.innerHTML = `You completed this project!! Good job :)`

    const comp_button = document.querySelector("#complete-project");
    comp_button.disabled = true;
}

//For use in future if we want to have any additional details/changes when a project is completed
// function loadCompleteProjectModal() {
//     const completionModal = document.querySelector("#completion-modal-container");
//     const completionModalHTML = completionTemplate();
    
//     completionModal.innerHTML = completionModalHTML;
    
//     document.querySelector(".close-modal").addEventListener("click", closeModal);
// }


// function completionTemplate() {
//     //write html in here for the completion modal
//     return `<div class="completion-modal">
//                 <button class="close-modal">X</button>
//                 <div id="completion-box">
//                     <p>Congratulations on finishing this project!</p>
//                     <p>Enter details here:</p>
//                     <button>
//                 </div>
//             </div>`
// }

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
complete_project.addEventListener("click", completeProject);
