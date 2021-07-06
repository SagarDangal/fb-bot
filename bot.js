/**
 * Made by karpis.justas@gmail.com
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const {ADD_LIMIT, SHOW_BROWSER, SHOW_DEVTOOLS} = require('./config.json');

const Bot = async (email, password, name = 'john', addLimit = 5) => {
    const login = async (email, password) => {
        await page.evaluate((email, password) => {
            const emailInput = document.querySelector('#email');
            emailInput.value = email;

            const passwordInput = document.querySelector('#pass');
            passwordInput.value = password;

            const loginButton = document.querySelector('button[name="login"]');
            loginButton.click();

        }, email, password);

        await page.waitForNavigation({waitUntil: "networkidle0"});
    }

    const searchByName = async (_name) => await page.goto(`https://www.facebook.com/search/people/?q=${_name}`);

    const applyCityFilter = async (_name) => await page.goto(`https://www.facebook.com/search/people?q=${_name}&filters=eyJjaXR5Ijoie1wibmFtZVwiOlwidXNlcnNfbG9jYXRpb25cIixcImFyZ3NcIjpcIjExMDk3MDc5MjI2MDk2MFwifSJ9`);

    const addFriends = async (limit) => {
        const sleep = (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        for (let i = 0; i < limit; i++) {
            const addButton = await page.$('div[aria-label="Add friend"]');
            console.log(addButton)

            if (!addButton) {
                await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            } else {
                console.log("sent")
                await addButton.click();
            }

            await sleep(Math.random() * 1000 + 1000);
        }
    }

    const browser = await puppeteer.launch({
        headless: !SHOW_BROWSER,
        devtools: SHOW_DEVTOOLS,
        args: ['--disable-notifications', '--start-maximized'],
        defaultViewport: null
    })
    const page = await browser.newPage();

    await page.goto('https://www.facebook.com/');
    await login(email, password);

    await searchByName(name);
    await applyCityFilter(name);

    await addFriends(addLimit);
    await browser.close();
}

const getNames = (file = './names.txt') => {
    return fs.readFileSync(file).toString().split('\n');
}

const getAccounts = (file = './accounts.txt') => {
    const allAccounts = fs.readFileSync(file).toString().split('\n');
    return allAccounts.map(account => {
        const data = account.split(' ');
        return {email: data[0], password: data[1]};
    });
}

(async () => {
    console.log('Facebook bot started...');

    const names = getNames();

    const accounts = getAccounts();
    let count = 0;
    for(let k = 0;k <1;k++){

    for (const account of accounts) {
        try {
            const randomName = names[k]//const randomName = names[Math.floor(Math.random() * names.length)];
            console.log(randomName)

            await Bot(account.email, account.password, randomName, ADD_LIMIT);
            count = count+1;
            console.log(`Friend requests sent from this ${account.email} account!`,count);
        } catch (e) {
            console.log(e.message);
        }
    }
}

    console.log('Job finished!');
})();
