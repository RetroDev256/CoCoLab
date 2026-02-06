//This is the logic behind a project, regardless of which project it is
//this page will need to get the project id and use that to grab information from the server(?)
//and use it to populate the page
var project_data;

async function getProject() {
    try{
        const response = await fetch("https://coco.alloc.dev/api/project/2"); // add /id at the end to get just one project
        //This will eventually get an id from a different page and call just that project
        project_data = await response.json();

        console.log(project_data[0]);
    } catch (err) {
        console.error(err);
    }
}

getProject();

const exampleProjectJSON = { id: 2, project_name: "Lets make a Website", owner_id: 4, details: "We're going to work as a team to build our own website!",
    projectDeadline: "2/10/26", max_people: 5
 } //user id that's associated with a project? (One to many relationship: one user can own many projects, but a project can only be owned by one person)

//When page loads, show information for this specific project requested by the user
function init() {
    renderProject(exampleProjectJSON);
    //renderProject(project_data);
}
init()

function renderProject(projectData) {
    //Project title
    const title = document.querySelector(".project-title");
    const titleHead = document.querySelector(".project-title-head");
    title.innerHTML = `${projectData.project_name}`;
    titleHead.innerHTML = `${projectData.project_name}`;

    //User who created it, along with a link to that user's profile
    //This calls a separate function that makes call to owner endpoint and gets that owner's name and hyperlink
    const owner_info = getOwnerData(projectData.owner_id);
    const user = document.querySelector(".project-owner");
    user.innerHTML = owner_info;

    //array of tags associated with this project
    //Calls a separate function that will call the project-tags table and get that information
    const project_tags = document.querySelector(".project-tags");


    //Details about this project
    const details = document.querySelector(".project-details");
    details.innerHTML = `${projectData.details}`;

    //The deadline for this project, if there is one

    //How many people are needed to help
    const needed = document.querySelector(".people-needed");
    needed.innerHTML = `Number of people needed: ${projectData.max_people}`;

    //How many people are already helping on the project
    //Separate function will call endpoint and total them up
    const helpers = document.querySelector(".people-have");
    const total_helpers = getHelpersTotal(projectData.id);
    helpers.innerHTML = `Spots filled: ${total_helpers}`;
}

//returns html for owner information
async function getOwnerData(ownerID) {
    try{
        const owner_response = await fetch(`https://coco.alloc.dev/api/users/${ownerID}`); // add /id at the end to get just one project
        //This will eventually get an id from a different page and call just that project
        owner = await owner_response.json();
        
        return `Created by: <a href="${owner.profile_url}">${owner.user_name}</a>`
    } catch (err) {
        console.error(err);
        return `Created by: unavailable user`
    }
}

//returns html for rendering tags associated with this project
async function getTagsTemplate(projectID) {
    try{
        const project_response = await fetch(`https://coco.alloc.dev/api/projects_tags/${projectID}`);
        //This will eventually get an id from a different page and call just that project
        project_tags = await project_response.json();

        //hmmmmmmm each tag would require a database call to get the name of that tag- does that matter?
        
        let html = ``;
        tags.forEach(tag => {
            //here would be the function that calls the category_tags endpoint
            html += `<p id="tag">${tag}</p>\n`;
        });
        return html;
    } catch (err) {
        console.error(err);
        return `Some tags are not like others`
    }
}

//returns int representing number of helpers that are already on the project
async function getHelpersTotal(projectID) {
    try{
        const member_response = await fetch(`https://coco.alloc.dev/api/project_members/${projectID}`);
        //This will eventually get an id from a different page and call just that project
        members = await member_response.json();
        //eventually total up the people that exist on this project
        return 3;
    } catch (err) {
        console.error(err);
        return 0;
    }

}

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