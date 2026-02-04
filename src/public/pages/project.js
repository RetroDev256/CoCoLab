//This is the logic behind a project, regardless of which project it is
//this page will need to get the project id and use that to grab information from the server(?)
//and use it to populate the page

async function getProject() {
    try{
        const response = await fetch("https://coco.alloc.dev/api/project");
        const data = await response.json();

        console.log(data);
    } catch (err) {
        console.error(err);
    }
}

getProject();

const exampleProjectJSON = { projectID: 2, projectTitle: "Lets make a Website", ownerId: 4, projectDetails: "We're going to work as a team to build our own website!",
    projectDeadline: "2/10/26", projectPeople: 5
 } //user id that's associated with a project? (One to many relationship: one user can own many projects, but a project can only be owned by one person)

//When page loads, show information for this specific project requested by the user
function init() {
    renderProject(exampleProjectJSON);
}
init()

function renderProject(projectData) {
    //Project title
    const title = document.querySelector(".project-title");
    const titleHead = document.querySelector(".project-title-head");
    title.innerHTML = `${projectData.projectTitle}`
    titleHead.innerHTML = `${projectData.projectTitle}`;
    //User who created it, along with a link to that user's profile
    //array of tags associated with this project
    //Details about this project
    const details = document.querySelector(".project-details");
    details.innerHTML = `${projectData.projectDetails}`;
    //The deadline for this project, if there is one
    //How many people are needed to help, and how many of those have already been filled
    
}

//For use in rendering the tags associated with this project
// function tagTemplate(tags) {
//     let html = ``;
//     tags.forEach(tag => {
//         html += `<p id="tag">${tag}</p>\n`;
//     });
//     return html;
// }

//(For regular user, should they be able to see the users associated with a project? Or should that just be up to a project owner?)


//For regular people viewing a project, there should be a button they can click that allows them to "join" the project
//That button will send the user's contact information to the project owner, who can then accept/reject the person
function sendInformation() {
    console.log("Simulating sending information...");
}

function close() {
    window.close();
}

document.querySelector("#return-search").addEventListener("click", close);
document.querySelector("#join-project").addEventListener("click", sendInformation);