const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

async function scrapeSixNationsFixtures() {
    try {
        const response = await axios.get('https://www.rugbypass.com/the-rugby-championship/fixtures-results/');
        const $ = cheerio.load(response.data);

        const fixturesData = [];

        $('.games-list-item').each((index, element) => {
            const date = $(element).find('.date').text().trim();
            const competition = $(element).find('.comp h2 a').text().trim();
            // const time = $(element).find('.time .state').text().trim();
            // const venue = $(element).find('.time .venue').text().trim();
            const gameElements = $(element).find('.game');

            gameElements.each((gameIndex, gameElement) => {
                const round = $(gameElement).find('.round').text().trim();
                // const date = $(gameElement).find('.date').text().trim();//
                const time = $(gameElement).find('.time .state').text().trim();//
                const venue = $(gameElement).find('.time .venue').text().trim();//
                const teamA = $(gameElement).find('.team.home').text().trim();
                const logoA = $(gameElement).find('.logo.home img').attr('data-src');
                const teamB = $(gameElement).find('.team.away').text().trim();
                const logoB = $(gameElement).find('.logo.away img').attr('data-src');
                const liveNote = $(gameElement).find('.live-note').text().trim();
                const scoreHome = $(gameElement).find('.score.home').text().trim();
                const scoreAway = $(gameElement).find('.score.away').text().trim();
                const gameLink = $(element).find('.link-box').attr('href');

                const fixtureId = `${date}-${time}-${teamA}-${teamB}`;
                fixturesData.push({
                    id: fixtureId,
                    round,
                    date,
                    competition,
                    time,
                    venue,
                    teamA,
                    logoA,
                    teamB,
                    logoB,
                    liveNote,
                    scoreHome,
                    scoreAway,
                    gameLink,
                });
            });
        });

        return fixturesData;
    } catch (error) {
        console.error('Error scraping Six Nations fixtures:', error.message);
        return [];
    }
}

async function updateHTMLWithFixtures(fixtures) {
    try {
        const htmlFilePath = 'trc.html';

        const existingHTML = fs.readFileSync(htmlFilePath, 'utf-8');
        const $ = cheerio.load(existingHTML);

        const mainContent = $('#content1');
        mainContent.empty();

        fixtures.forEach((fixture) => {
            const fixtureItem = `
                <div class="games-list-item">
                    <div class="date">${fixture.date}</div>
                    <div class="comp" data-id="209" data-order="2">
                        <h2><a href="${fixture.gameLink}"></a></h2>
                        <div class="games">
                            <div class="game">
                            <div class="date-time">${fixture.time}</div>
                            <div class="venue">${fixture.venue}</div>
                            <div class="team-info">
                                <div class="team home">
                                    <div class="team-info">
                                        <span><img src="${fixture.logoA}" alt="${fixture.teamA}" class="logo-img ls-is-cached lazyloaded"></span>
                                        <span>${fixture.teamA}</span>
                                    </div>
                                </div>
                                <div class="dash">-</div>
                                <div class="team away">
                                    <div class="team-info">
                                        <span>${fixture.teamB}</span>
                                        <span><img src="${fixture.logoB}" alt="${fixture.teamB}" class="logo-img ls-is-cached lazyloaded"></span>
                                    </div>
                                </div>
                            </div>
                            <div class="live-note">${fixture.liveNote}</div>
                            <div class="score">${fixture.scoreHome}  -  ${fixture.scoreAway}</div>
                            
                            </div>
                        </div>
                    </div>
                </div>`;

            mainContent.append(fixtureItem);
        });

        fs.writeFileSync(htmlFilePath, $.html());
        console.log('HTML file updated with the latest Six Nations fixtures.');
    } catch (error) {
        console.error('Error updating HTML file:', error.message);
    }
}

scrapeSixNationsFixtures().then((fixtures) => {
    updateHTMLWithFixtures(fixtures);
  });

async function scrapeSixNationsStandings() {
    try {
        const response = await axios.get('https://www.rugbypass.com/the-rugby-championship/standings/');
        const $ = cheerio.load(response.data);

        const standingsData = [];

        $('.team-standing').each((index, element) => {
            const position = $(element).find('div:first-child').text().trim();
            const logo = $(element).find('.logo img').attr('src');
            const name = $(element).find('.name').text().trim();
            const played = $(element).find('div:nth-child(4)').text().trim();
            const won = $(element).find('div:nth-child(5)').text().trim();
            const lost = $(element).find('div:nth-child(6)').text().trim();
            const draw = $(element).find('div:nth-child(7)').text().trim();
            const pf = $(element).find('div:nth-child(8)').text().trim();
            const pa = $(element).find('div:nth-child(9)').text().trim();
            const pd = $(element).find('div:nth-child(10)').text().trim();
            const bpt = $(element).find('div:nth-child(11)').text().trim();
            const bp7 = $(element).find('div:nth-child(12)').text().trim();
            const bp = $(element).find('div:nth-child(13)').text().trim();
            const totalPoints = $(element).find('div:nth-child(14)').text().trim();

            standingsData.push({
                position,
                logo,
                name,
                played,
                won,
                lost,
                draw,
                pf,
                pa,
                pd,
                bpt,
                bp7,
                bp,
                totalPoints,
            });
        });

        return standingsData;
    } catch (error) {
        console.error('Error scraping Six Nations standings:', error.message);
        return [];
    }
}

async function updateHTMLWithStandings(standings) {
    try {
        const htmlFilePath = 'trc.html';

        const existingHTML = fs.readFileSync(htmlFilePath, 'utf-8');
        const $ = cheerio.load(existingHTML);

        const standingsTableBody = $('#rankingsTableBody');
        standingsTableBody.empty(); // Clear existing content

        standings.forEach((team) => {
            const tableRow = `
                <tr>
                    <th scope="row">${parseInt(team.position)}</th>
                    <th scope="row"><img src="${team.logo}" alt="${team.name}" class="team-logo"> ${team.name}</th>
                    <td>${team.played}</td>
                    <td>${team.won}</td>
                    <td>${team.lost}</td>
                    <td>${team.draw}</td>
                    <td>${team.pf}</td>
                    <td>${team.pa}</td>
                    <td>${team.pd}</td>
                    <td>${team.bpt}</td>
                    <td>${team.bp7}</td>
                    <td>${team.bp}</td>
                    <td>${team.totalPoints}</td>
                </tr>`;

            standingsTableBody.append(tableRow);
        });

        fs.writeFileSync(htmlFilePath, $.html());
        console.log('HTML file updated with the latest Six Nations standings.');
    } catch (error) {
        console.error('Error updating HTML file with standings:', error.message);
    }
}

// Run the scraping and update
scrapeSixNationsStandings().then((standings) => {
    updateHTMLWithStandings(standings);
});