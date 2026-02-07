//This page will eventually be populated with stuff from project.js with additional specs for owners

//For project owner, there should be a button that will allow them to mark the project as complete.
//They can record completion details and submit, which will save information and change project status to completed,
//thus removing the project from the projectBoard. It will still be visible for the project owner and the other
//contributors on their personal profiles (and/or the projectManager)

//This is the logic behind a project, regardless of which project it is
//this page will need to get the project id and use that to grab information from the server(?)
//and use it to populate the page
var project_data;

async function getProject() {
    try {
        //This will get an id from a different page and call just that project
        const response = await fetch("https://coco.alloc.dev/api/project/2"); // add /id at the end to get just one project
        project_data = await response.json();

        console.log(project_data[0]);
    } catch (err) {
        console.error(err);
    }
}

// const exampleProjectJSON = { id: 2, project_name: "Lets make a Website", owner_id: 4, details: "We're going to work as a team to build our own website!",
//     projectDeadline: "2/10/26", max_people: 5
//  } //user id that's associated with a project? (One to many relationship: one user can own many projects, but a project can only be owned by one person)

//When page loads, show information for this specific project requested by the user
async function init() {
    // renderProject(exampleProjectJSON);
    await getProject();
    await renderProject(project_data);
}

init();

async function renderProject(projectDataArray) {
    if (projectDataArray.length == 0) return;
    const projectData = projectDataArray[0];

    //Project title
    const title = document.querySelector(".project-title");
    const titleHead = document.querySelector(".project-title-head");
    title.innerHTML = `${projectData.project_name}`;
    titleHead.innerHTML = `${projectData.project_name}`;

    //User who created it, along with a link to that user's profile
    //This calls a separate function that makes call to owner endpoint and gets that owner's name and hyperlink
    const owner_info = await getOwnerData(projectData.owner_id);
    const user = document.querySelector(".project-owner");
    user.innerHTML = owner_info;

    //array of tags associated with this project
    //Calls a separate function that will call the project-tags table and get that information
    const tags_info = await getTagsTemplate(projectData.id);
    const project_tags = document.querySelector(".project-tags");
    project_tags.innerHTML = tags_info;

    //Details about this project
    const details = document.querySelector(".project-details");
    details.innerHTML = `${projectData.details}`;

    //The deadline for this project, if there is one
    //Currently not implementing this, so deadline will always be none

    //How many people are needed to help
    const needed = document.querySelector(".people-needed");
    needed.innerHTML = `Number of people needed: ${projectData.max_people}`;

    //How many people are already helping on the project
    //Separate function will call endpoint and total them up
    const helpers = document.querySelector(".people-have");
    const total_helpers = await getHelpersTotal(projectData.id);
    helpers.innerHTML = `Spots filled: ${total_helpers}`;
}

//returns html for owner information
async function getOwnerData(ownerID) {
    try {
        const owner_response = await fetch(
            `https://coco.alloc.dev/api/users/${ownerID}`,
        );

        // The API response is a list of values
        const owner_list = await owner_response.json();

        if (owner_list.length === 0) {
            return `[INVALID ]`;
        } else {
            const owner = owner_list[0];
            return `Created by: <a href="${owner.profile_url}">${owner.user_name}</a>`;
        }

    } catch (err) {
        console.error(err);
        return `Created by: unavailable user`;
    }
}

//returns html for rendering tags associated with this project
async function getTagsTemplate(projectID) {
    try {
        //This returns all the entities that exist in the database with the provided projectID
        const project_response = await fetch(
            `https://coco.alloc.dev/api/projects_tags/project_id/${projectID}`,
        );
        const project_tags = await project_response.json();

        const tag_ids = project_tags.map((pt) => pt.tag_id);

        let html = ``;
        for (const tag_id of tag_ids) {
            //here is the function that calls the category_tags endpoint
            const tag_name = await getTagName(tag_id);
            html += `<p class="tag">${tag_name}</p>\n`;
        }
        return html;
    } catch (err) {
        console.error(err);
        return `Some tags are not like others`;
    }
}

async function getTagName(tag_id) {
    const tag_response = await fetch(
        `https://coco.alloc.dev/api/category_tags/${tag_id}`,
    );
    const tag_list = await tag_response.json();

    if (tag_list.length === 0) {
        return `[INVALID TAG]`;
    } else {
        return tag_list[0].name;
    }
}

//returns int representing number of helpers that are already on the project
async function getHelpersTotal(projectID) {
    try {
        const member_response = await fetch(
            `https://coco.alloc.dev/api/project_members/project_id/${projectID}`,
        );
        const members = await member_response.json();
        return members.length;
    } catch (err) {
        console.error(err);
        return 0;
    }
}

//For regular people viewing a project, there should be a button they can click that allows them to "join" the project
//That button will send the user's contact information to the project owner, who can then accept/reject the person
function sendInformation() {
    console.log("Simulating sending information...");
}

function close() {
    window.close();
}

document.querySelector("#return-search").addEventListener("click", close);
document
    .querySelector("#join-project")
    .addEventListener("click", sendInformation);
