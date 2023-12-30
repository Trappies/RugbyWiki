// Still needs to be updated
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const baseUrl = 'https://www.ultimaterugby.com';
const url = `${baseUrl}/app/public/index.php/taranaki/squad`;

async function fetchData() {
  try {
    const response = await axios.get(url);
    return cheerio.load(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function scrapeTaranakiPlayers() {
  try {
    const $ = await fetchData();

    const players = [];

    // Targeting each player card wrapper
    $('.col-md-2.col-sm-4.col-xs-6').each((index, element) => {
      const playerNameHtml = $(element).find('.front h4').html();
      const playerName = playerNameHtml ? playerNameHtml.replace('<br>', ' ') : '';
      const playerRole = $(element).find('.back b').text();
      const relativeImagePath = $(element).find('.front img').attr('src');
      const playerImage = baseUrl + relativeImagePath;

      const playerDetails = {
        name: playerName,
        role: playerRole,
        image: playerImage,
      };

      players.push(playerDetails);
    });
    return players;
  } catch (error) {
    console.error('Error fetching and scraping data:', error);
  }
}

// Run the scraping and update
scrapeTaranakiPlayers().then((players) => {
  if (players.length > 0) {
    updateHTMLWithPlayers(players);
  } else {
    console.log('No players scraped or an error occurred.');
  }
});

async function updateHTMLWithPlayers(playerData) {
  try {
    const htmlFilePath = 'taranaki_bulls.html';

    const existingHTML = fs.readFileSync(htmlFilePath, 'utf-8');
    const $ = cheerio.load(existingHTML);

    const playersContainer = $('#content2 .row');
    playersContainer.empty(); // Clear existing content

    // Add player cards
    const playerCards = playerData.map(player => `
      <div class="col-md-4 mb-4">
        <div class="card">
          <img src="${player.image}" class="card-img-top" alt="${player.name}" style="width: 100%; height: 100%;">
          <div class="card-body">
            <h5 class="card-title">${player.name}</h5>
            <p class="card-text">${player.role}</p>
          </div>
        </div>
      </div>
    `).join('');

    playersContainer.append(playerCards);

    // Replace or add the players container in the main content
    $('#content2 .row').remove();
    $('#content2').append(playersContainer);

    fs.writeFileSync(htmlFilePath, $.html());
    console.log('HTML file updated with the latest Taranaki Bulls player details.');
  } catch (error) {
    console.error('Error updating HTML file with players:', error.message);
  }
}
