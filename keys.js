const chance = require('chance').Chance();
const randomLength = Math.ceil(Math.random() * 3) + 6;

module.exports = {
    siteLink: 'https://www.nike.com/gb/launch',
    accountsPerProxy: 5,
    account: {
        firstName: chance.string({length: 8, alpha: true, casing: 'lower'}),
        lastName: chance.string({length: 8, alpha: true, casing: 'lower'}),
        email: `${chance.string({length: randomLength, alpha: true, casing: 'lower'})}@eelvan.com`,
        dob: chance.birthday({string: true}),        // MM/DD/YYYY
        gender: chance.gender(),  // 'Male' or 'Female'
        country: 'GB',  // country code
        month: '10',
        password: 'AgoodPassword!1',
    }
}