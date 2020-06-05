const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const {siteLink, accountsPerProxy} = require('./keys');
const accountDetails = require('./keys').account;
let proxies = [];
let accountsCreated = 1;

const run = () => new Promise(async (resolve, reject) => {
  try {
    puppeteer.use(StealthPlugin());

    console.log('Bot Started...');

    await fetchProxies();

    for (let i = 1; i < proxies.length; i++) {
      for (let j = 0; j < accountsPerProxy; j++) {
        await createAccount(accountDetails, proxies[i]);
      }
    }

    
    console.log('Bot Finished...');
    resolve(true);
  } catch (error) {
    console.log(`Bot Run Error: ${error}`);
    reject(error);
  }
})

const createAccount = (account, proxy) => new Promise(async (resolve, reject) => {
  try {
    console.log(`${accountsCreated}/${proxies.length * accountsPerProxy} - Creating account using proxy ${proxy.address}...`);
    account.dob = account.dob.replace(/^.*?(?=\/)/gi, account.month);
    const browser = await puppeteer.launch({
      headless: false,
      args: [`--proxy-server=${proxy.address}`]
    });

    // Launch Page and Goto siteLink
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.authenticate({username: proxy.userName, password: proxy.password});
    await page.goto(siteLink, {timeout: 0, waitUntil: 'load'});

    // Navigate to Sign Up
    await page.waitForSelector('button.join-log-in');
    await page.click('button.join-log-in');

    await page.waitForSelector('div.loginJoinLink > a');
    await page.click('div.loginJoinLink > a');

    // Wait for input fields
    console.log('Filling fields...');
    await page.waitForSelector('input[name="emailAddress"]');

    // Fill the Fields
    await page.type('input[name="emailAddress"]', account.email);
    await page.type('input[name="password"]', account.password);
    await page.type('input[name="firstName"]', account.firstName);
    await page.type('input[name="lastName"]', account.lastName);
    await page.focus('input[name="dateOfBirth"]');
    await page.keyboard.type(account.dob);
    await page.select('select[name="country"]', account.country);
    let genderOptions = await page.$$('ul[data-componentname="gender"] > li');
    for (let i = 0; i < genderOptions.length; i++) {
      const gender = await genderOptions[i].$eval('span', elm => elm.innerText.trim().toLowerCase());
      if (gender == account.gender.toLowerCase()) {
        await genderOptions[i].click('input');
      }
    }
    await page.waitFor(3000);
    genderOptions = await page.$$('ul[data-componentname="gender"] > li');
    for (let i = 0; i < genderOptions.length; i++) {
      const gender = await genderOptions[i].$eval('span', elm => elm.innerText.trim().toLowerCase());
      if (gender == account.gender.toLowerCase()) {
        await genderOptions[i].click('input');
      }
    }
    await page.click('label.checkbox');
    await page.waitFor(3000);

    // Submit the form
    console.log('Submitting Form...');
    await page.click('input[value="JOIN US"]');
    await page.waitFor(10000);

    // Check if form Submitted
    const gotLogin = await page.$('button.join-log-in');
    if (gotLogin) {
      await browser.close();
      console.log(`${accountsCreated}/${proxies.length * accountsPerProxy} - Failed...`);
      accountsCreated++;
      resolve(false);
    } else {
      await browser.close();
      console.log(`${accountsCreated}/${proxies.length * accountsPerProxy} - Account Created...`);
      accountsCreated++;
      resolve(true);
    }
  } catch (error) {
    console.log(`createAccount[${account.email}] Error: `, error.message);
    resolve(false);
  }
});

const fetchProxies = () => new Promise(async (resolve, reject) => {
  try {
    let proxyText = fs.readFileSync('proxy100.txt', 'utf8').split('\n');
    proxies = proxyText.map(p => {
      const proxy = {
        address: '',
        userName: '',
        password: '',
      }
      let pr = p.replace('\r', '');
      pr = pr.split(':');
      proxy.address = pr[0] + ':' + pr[1];
      proxy.userName = pr[2];
      proxy.password = pr[3];
      return proxy;
    });

    console.log(`Number of Proxies found in proxy100.txt: ${proxies.length}`);
    console.log(`Number of Accounts to be Created (Accounts Per Proxy x Number of Proxies): ${accountsPerProxy * proxies.length}`);
    resolve(true);
  } catch (error) {
    console.log('fetchProxies Error: ', error);
    reject(error);
  }
});

run();