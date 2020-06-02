const chance = require('chance').Chance();

module.exports = {
    siteLink: 'https://www.nike.com/gb/launch',
    proxy: '',
    proxyUser: '',
    proxyPassword: '',
    account: {
        firstName: chance.string({length: 8, alpha: true, casing: 'lower'}),
        lastName: chance.string({length: 8, alpha: true, casing: 'lower'}),
        email: `${chance.string({length: 8, alpha: true, casing: 'lower'})}@eelvan.com`,
        dob: chance.birthday({string: true}),        // MM/DD/YYYY
        gender: chance.gender(),  // 'Male' or 'Female'
        country: 'GB',  // country code
        month: '10',
        password: 'AgoodPassword!1',
    }
}