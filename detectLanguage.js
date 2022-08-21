
(async () => {

    const puppeteer = require('puppeteer');
    require('dotenv').config()
    const fs = require('fs');

    const tanslationJSON = require('./source.json');
    const defaultLang = { label: 'English', code: 'en' };
    
    const languages = [
        // { label: 'German', code: 'de' },
        // { label: 'PORTUGUESE', code: 'pt' }
        { label: 'Hindi', code: 'hi'}
    ]

    const translate = async (inputText, page, element) => {
        console.log("Input: ", "in ", process.env.INPUTLANGUAGE, ": ", inputText);
        let inputValue = await page.evaluate(el => el.value, element)
        for (let i = 0; i < inputValue.length; i++) {
            await page.keyboard.press('Backspace');
        }
        await element.type(inputText);
        await new Promise(r => setTimeout(r, 1000));

        await page.waitForSelector('span[data-language-for-alternatives]');
        let outputtext = await page.evaluate(() => document.querySelector('span[data-language-for-alternatives]').innerText);
        await new Promise(r => setTimeout(r, 1000));
        return outputtext;
    }

    const traverseDeep = async (obj, page, element) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = await translate(obj[key], page, element)
            }
            if (typeof obj[key] === 'object') {
                await traverseDeep(obj[key], page, element);
            }
        }
    }

    const writeToOutput = (code, json) => {
        const folderName = `${__dirname}/output/${code}`;
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName);
          }
        fs.writeFileSync(`${folderName}/translation.json`, JSON.stringify(json, 0, 2));
    }

    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--start-fullscreen']
    });

    let page = await browser.newPage();

    await page.goto('https://translate.google.co.in/');

    //set input language
    await page.waitForSelector('button div[jsname]');
    await page.click('button div[jsname]');
    let searchInput = await page.waitForSelector('input[aria-label="Search languages"]');
    await new Promise(r => setTimeout(r, 1000));
    await searchInput.type(defaultLang.label);
    await page.waitForSelector('div[data-language-code] span');
    await page.click('div[data-language-code] span');
    await new Promise(r => setTimeout(r, 1000));

    for (const lang of languages) {
        
        const dropDownDestination = await page.waitForSelector('#yDmH0d > c-wiz > div > div.WFnNle > c-wiz > div.OlSOob > c-wiz > div.ccvoYb.EjH7wc > div.aCQag > c-wiz > div.zXU7Rb > c-wiz > div:nth-child(5) > button > div.VfPpkd-Bz112c-RLmnJb');
        await dropDownDestination.click();

        const search_outputLang = await page.waitForSelector('#yDmH0d > c-wiz > div > div.WFnNle > c-wiz > div.OlSOob > c-wiz > div.ccvoYb.EjH7wc > div.aCQag > c-wiz > div:nth-child(2) > c-wiz > div.ykTHSe > div > div.fMHXgc.qkH7ie > input');
        await new Promise(r => setTimeout(r, 1000));
        await search_outputLang.type(lang.label);
        await page.waitForSelector('div[data-language-code] span');
        await page.click('div[data-language-code] span');
        await new Promise(r => setTimeout(r, 1000));

        //type input text
        const textArea = await page.waitForSelector('#yDmH0d > c-wiz > div > div.WFnNle > c-wiz > div.OlSOob > c-wiz > div.ccvoYb.EjH7wc > div.AxqVh > div.OPPzxe > c-wiz.rm1UF.UnxENd > span > span > div > textarea');
        const translated = JSON.parse(JSON.stringify(tanslationJSON));
        await traverseDeep(translated, page, textArea);
        writeToOutput(lang.code, translated);
        console.log(`>>>>>>>>> ${lang.code}: `, JSON.stringify(translated, 0, 2));
    }



})()

