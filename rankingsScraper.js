const axios = require('axios');
const cheerio = require('cheerio');

// URL of the rankings page
const url = 'https://www.rugbypass.com/internationals/rankings/';

// Function to scrape the rankings
const scrapeRankings = async () => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Extract rankings data
        const rankingsData = [];
        $('.team-standing').each((index, element) => {
            const rank = $(element).find('div:first-child').text().trim();
            const logo = $(element).find('.logo img').attr('src');
            const team = $(element).find('.name div').text().trim();
            const points = $(element).find('.dbl:last-child').text().trim();

            rankingsData.push({
                rank,
                logo,
                team,
                points,
            });
        });

        return rankingsData;
    } catch (error) {
        console.error('Error fetching data:', error.message);
        throw error;
    }
};

// Function to display rankings in the console
const displayRankings = (rankings) => {
    console.log('Rank\tLogo\tName\tPoints');
    rankings.forEach((team) => {
        console.log(`${team.rank}\t${team.logo}\t${team.team}\t${team.points}`);
    });
};

// Run the scraping and display functions
(async () => {
    try {
        const rankings = await scrapeRankings();
        displayRankings(rankings);
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
