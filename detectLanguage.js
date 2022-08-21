

(async()=>{
    const puppeteer = require('puppeteer');
    require('dotenv').config()
    let browser = await puppeteer.launch({ headless: false, defaultViewport: null,executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args: ['--start-fullscreen'] });
    let page = await browser.newPage();
    await page.goto('https://translate.google.co.in/');
    // await page.waitForT
    await page.waitForSelector('button div[jsname]');
    await page.click('button div[jsname]');
    let searchInput = await page.waitForSelector('input[aria-label="Search languages"]');
    await new Promise(r => setTimeout(r, 1000));
    await searchInput.type(process.env.INPUTLANGUAGE);
    await page.waitForSelector('div[data-language-code] span');
    await page.click('div[data-language-code] span');
    await new Promise(r => setTimeout(r, 1000));
    await page.waitForSelector('textarea[aria-label="Source text"]');
    console.log("Input: ","in ",process.env.INPUTLANGUAGE,": ",process.env.INPUTTEXT);
    await page.type('textarea[aria-label="Source text"]',process.env.INPUTTEXT);
    await page.waitForSelector('button[aria-label="More target languages"]');
    await page.click('button[aria-label="More target languages"]');
    let searchOutputlang = await page.$$('input[aria-label="Search languages"]');
    await searchOutputlang[1].type(process.env.OUTPUTLANGUAGE);
    await page.waitForSelector('div[data-language-code] span');
    await page.click('div[data-language-code] span');
    await page.waitForSelector('span[data-language-for-alternatives]');
    let outputtext = await page.evaluate(()=>document.querySelector('span[data-language-for-alternatives]').innerText);
    console.log("Output: ","in ",process.env.OUTPUTLANGUAGE,": ",outputtext);

    

    
})();