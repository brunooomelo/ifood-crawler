const puppeteer = require('puppeteer');
const fs = require('fs');
const { promisify } = require('util');

const writeCrawler = promisify(fs.writeFile)

const numberDefault = 18
const location = process.argv[2] || 'sao-paulo-sp'
const baseURL = `https://www.ifood.com.br/delivery/${location}`

const init = async () => {
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();
  await page.goto(baseURL);
  console.log(`initiliaze crawler to ${location}`)

  await loadMore(page)
  console.log('finish crawler worker')
  await browser.close()
}


async function loadMore(page, count = 1) {
  try {
    await waitTime(3000)
    await page.waitForSelector('.restaurants-by-city-container__load-more', {
      timeout: 5000
    })
    console.log(`page: ${count}`)
    console.log(`number of restaurants: ${count*numberDefault}`)

    await page.click('.restaurants-by-city-container__load-more');
    return loadMore(page, count+1)
  } catch (error) {
    console.log('\n\n prepare the thief of name')
 
    const name = await page.evaluate(() => {
      const restaurants = document.querySelectorAll('.restaurant-name')
      console.log(`total of restaurants: ${restaurants.length}`)
      return [...restaurants].map(elem => elem.innerText)
    })

    console.log('all names were stolen')
    await writeCrawler(`${Date.now()}-${location}-crawler.json`, JSON.stringify(name))
    console.log('\nThe file has been saved!');
    return 
  }
}

function waitTime(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

init()