const puppeteer = require('puppeteer');
const fs = require('fs');

async function getTableData(url, selector, row_info, row_i) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.goto(url);
  
    const tableData = await page.$$eval(`${selector} tr`, rows => {
      return rows.map(row => {
        const tds = row.querySelectorAll('td');
        const tdInfos = row.querySelectorAll('.views-field-field-accession-number');
        const infoHref = tdInfos[0].querySelector('a')?.href || '';
        const infoTd = Array.from(tds, td => td.textContent.trim());
        const tdImgs = row.querySelectorAll('.views-field-field-collection-images-link');
        const tdImgsHref = tdImgs[0].querySelector('a')?.href || '';
        return [infoHref, tdImgsHref, [...infoTd][0]];
      });
    });
  
    await browser.close();
    return tableData;
  };

async function getUrlText(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    
    const divContent = await page.$('.region.region-content');
    const text = await page.evaluate(div => div.textContent, divContent);
        
    await browser.close();
    return text;
}

async function getDivLinks(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const divs = await page.$$('.col-xs-12.col-sm-2');
  const links = [];

  for (const div of divs) {
    const aTag = await div.$('a');
    const href = await page.evaluate(a => a.href, aTag);
    const text = await page.evaluate(a => a.textContent.trim(), aTag);

    links.push({ href, text });
  }

  await browser.close();
  return links;
}

async function getImgSrc(urlObj) {
  const url = urlObj.href;
  const text = urlObj.text;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  console.log('gotourl', url)
  const firstImgSrc = await page.evaluate(() => {
    const div = document.querySelector('.col-sm-7.col-sm-push-3');
    const img = div.querySelector('img');
    return img.getAttribute('src');
  });
  await browser.close();
  return {href: `http://ica.themorgan.org/${firstImgSrc}`, text: text}
}


function formatTextData(text) {
    const accessionNumberMatch = text.match(/Accession number:\s*(\S+)/);
    const accessionNumber = accessionNumberMatch ? accessionNumberMatch[1] : '';
    const titleMatch = text.match(/Title:\s*([\s\S]*?)Created:/);
    const title = titleMatch ? titleMatch[1].trim() : '';    const createdMatch = text.match(/Created:\s*(.+)/);
    const created = {
      text: createdMatch ? createdMatch[1] : '',
      number: createdMatch ? createdMatch[1].match(/\d+/)[0] : ''
    };
    const locationMatch = text.match(/Created:\s*[^,]+,\s*([a-zA-Z ]+),[^,]+Binding:/);
    const location = locationMatch ? locationMatch[1].trim() : '';
    const scriptMatch = text.match(/Script:\s*(.+?)Language:/s);
    const script = scriptMatch ? scriptMatch[1] : '';
    const tombNameMatch = text.match(/Accession number:\s*(.+?)Title:/);
    const tombName = tombNameMatch ? tombNameMatch[1] : '';
    
    return {
      tombInfo: {
        tombName: `${tombName} (fasimile)`,
        title: `${title}`,
        date: `${created.number}`,
        location: `${location}`,
        font: `${script}`,
        current_lib: 'morgan library'
      }
    };
  }
  

const baseurl = 'https://www.themorgan.org/manuscripts/list?field_medieval_centuries_tid=12141&field_image_available_tid=All&field_ms_type_tid=All&field_country_taxonomy_tid=All&items_per_page=400';
const row_selector = 'table tbody';

async function wrapUP () {
    const tableData = await getTableData(baseurl, row_selector)
    const done = [] // i can get rid of this
    if (tableData) {
        for (const table of tableData) {
            console.log(table, 'starting')
            const id = table[2];
            const infos = table[0];
            const imgs = table[1];
            if (done.includes(`${id}.json`)) {    // i can get rid of this
              console.log('passing', id)
            } else {
            const tombText = await getUrlText(infos);
            const tombMeta = formatTextData(tombText); 
            const tombImgMeta = imgs !== '' ? await getDivLinks(imgs): null; // link to src img
            const tombMetaImg = [] // actual source image
            console.log('sorcing ')
            if (tombImgMeta){for (const tombImg of tombImgMeta) {
              console.log('getting', tombImg)
              const imgSrc = await getImgSrc(tombImg)
              tombMetaImg.push(imgSrc)
            }} else {tombMetaImg.push(tombImgMeta)}
            const out = {tombImgMeta: tombMetaImg, tombMeta: tombMeta};
            console.log(out)
            fs.writeFileSync(`${id}.json`, JSON.stringify(out));
          }
        };
    };
}; wrapUP();