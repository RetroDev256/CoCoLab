//logic for project board specifically, such as what happens if someone clicks on a project

//this page should default to loading all active (ie incomplete) projects until user selects tags

//this page should include some functions like the following that will assist in filtering of projects based
//on user preference or input text to find matches
// function filterGames(query) {
//     function searchCallback(game)
//     {
//         return (game.name.toLowerCase().includes(query)
//       || game.description.toLowerCase().includes(query)
//       || game.tags.find((tag) => tag.toLowerCase().includes(query)));
//     }
//     const filteredGames = games.filter(searchCallback);
//     filteredGames.sort((a, b) => a.name.localeCompare(b.name));

//     renderGames(filteredGames);
// }

// function searchHandler() {
//     let userInput = document.getElementById("game-search").value;
//     filterGames(userInput.toLowerCase());
// }


//You'll also need something like this for loading each project based off its information (loaded from the database as JSON)
// function getGameTemplate(game) {
//     return `<section class="game-container">
//                 <article class="game">
//                     <img src="${game.image}" alt="${game.name}">
//                     <div class="game-info">
//                         <div class="tags">
//                             ${tagTemplate(game.tags)}
//                         </div>
//                         <h3>${game.name}</h3>
//                         <p>${game.description}</p>
//                          ${game.playable ? `<a href="${game.pagelink}"><button class="play-button">Play Now!</button></a>` : ""}
//                     </div>
//                 </article>
//             </section>`;
// }