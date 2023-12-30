const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

async function fetchRugbyNews() {
  try {
    const response = await axios.get('https://www.world.rugby/news');
    const $ = cheerio.load(response.data);

    const newsEntries = [];

    for (let i = 0; i < $('.newsList li').length; i++) {
      const element = $('.newsList li').eq(i);
      const titleElement = element.find('figcaption h3.title');
      const title = titleElement.text().trim();
      if (!title) {
        // Skip empty entries
        continue;
      }

      const category = element.find('figcaption span.tag').text().trim();
      const content = element.find('figcaption p').text().trim();

      // Extract the article URL
      const articleLink = element.find('a').attr('href');
      const articleURL = `https:${articleLink}`;

      // Fetch the article page to get the image
      const articleResponse = await axios.get(articleURL);
      const articlePage = cheerio.load(articleResponse.data);
      const imageURL = articlePage('.mc-blog-entry__picture source').attr('srcset');

      // Append 'https:' to the URL if it's a relative path
      const fullImageURL = imageURL ? (imageURL.startsWith('//') ? 'https:' + imageURL : imageURL) : '';

      const date = element.find('.date__unit--day-number, .date__unit--month, .date__unit--year').map((i, el) => $(el).text().trim()).get().join(' ');
      const readTime = element.find('.articleThumbLarge__read').text().trim();

      newsEntries.push({
        title,
        category,
        content,
        imageURL: fullImageURL,
        articleURL,
        date,
        readTime,
      });
    }

    return newsEntries;
  } catch (error) {
    console.error('Error fetching rugby news:', error.message);
    return [];
  }
}

function truncateContent(content, maxWords) {
  const words = content.split(' ');
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }
  return content;
}

async function updateHTMLWithNews(newsEntries) {
  try {
    const htmlFilePath = 'index.html';

    const existingHTML = fs.readFileSync(htmlFilePath, 'utf-8');
    const $ = cheerio.load(existingHTML);

    // Remove existing news items from the carousel
    $('.carousel-inner').empty();

    for (let index = 0; index < newsEntries.length; index++) {
      const entry = newsEntries[index];
      const truncatedContent = truncateContent(entry.content, 20);

      // Create a carousel item
      const carouselItem = $(`<div class="carousel-item ${index === 0 ? 'active' : ''}"></div>`);
      carouselItem.append($(`<img src="${entry.imageURL}" alt="${entry.title}">`));

      // Add caption to carousel item
      const caption = $('<div class="carousel-caption"></div>');
      caption.append($(`<h3 href="${entry.articleURL}" target="_blank">${entry.title}</h3>`));
      caption.append($(`<p>${truncatedContent}</p>`));
      caption.append($(`<p class="date">${entry.date} ${entry.readTime}</p>`));
      caption.append($(`<a href="${entry.articleURL}" target="_blank">Read more</a>`));
      carouselItem.append(caption);

      // Append carousel item to the carousel
      $('.carousel-inner').append(carouselItem);
    }

    fs.writeFileSync(htmlFilePath, $.html());
    console.log('HTML file updated with the latest rugby news.');
  } catch (error) {
    console.error('Error updating HTML file:', error.message);
  }
}

fetchRugbyNews().then((newsEntries) => {
  updateHTMLWithNews(newsEntries);
});
