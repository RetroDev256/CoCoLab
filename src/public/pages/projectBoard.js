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