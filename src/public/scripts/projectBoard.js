import { selectTable, getUserId, insert, toast } from "/main.js";
import { getBackground } from "./color.js";

const projects = await selectTable("project");
const tags = await selectTable("category_tags");
const projects_tags = await selectTable("projects_tags");
const user_id = getUserId();

let projects_html = "";

for (const project of projects) {
    if (project.completed) continue;

    const my_tags = projects_tags
        .filter((tag) => tag.project_id == project.id)
        .map((tag) => tags.find((t) => t.id == tag.tag_id).name);

    const randomRotation = Math.floor(Math.random() * 10 - 5);
    const randomTransition = {
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20),
    };

    const color = getBackground(project.color);

    projects_html += `
    <a href="project.html?id=${project.id}" class="size-44 p-4 shadow-xl flex flex-col gap-2 ${
        color.class
    } hover:scale-105 transition-transform overflow-hidden wrap-break-word" 
    style="transform: rotate(${randomRotation}deg); translate: ${randomTransition.x}% ${randomTransition.y}%; ${color.style}">
        <h4 class="font-bold">${project.project_name}</h4>
        <div class="text-xs">${project.details}</div>
        <div class="flex flex-wrap gap-2 mt-auto">
        ${my_tags.map((tag) => `<div class="badge badge-xs badge-outline">${tag}</div>`).join("")}
        </div>
    </a>`;
}
document.getElementById("projects").innerHTML = projects_html;

let tags_html = "";
for (const tag of tags) {
    tags_html += `<input class="btn" type="checkbox" name="tags" value="${tag.id}" aria-label="${tag.name}"/>`;
}
document.getElementById("tag-list").innerHTML = tags_html;

document
    .getElementById("new_project_form")
    .addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!user_id) {
            toast("Please log in to create a project.", "error");
            return;
        }
        const data = new FormData(new_project_form);

        try {
            const project = await insert("project", {
                project_name: data.get("project_name"),
                details: data.get("details"),
                color: data.get("color"),
                owner_id: user_id,
                completed: false,
            });
            console.log("Project", project);
            for (const tag_id of data.getAll("tags")) {
                const tag = await insert("projects_tags", {
                    project_id: project.id,
                    tag_id: tag_id,
                });
                console.log("Tag to project:", tag);
            }
            toast("Project created successfully!", "success");
            document.getElementById("new_project_modal").close();
        } catch (error) {
            console.error("Error creating project:", error);
            toast("Error creating project. Please try again.", "error");
        }
    });
