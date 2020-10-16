
const { Client } = require('../lib')
const { EXPERIMENTS } = require('../lib/constants/experiments')

const client = new Client()

client.login(process.env.USERNAME, process.env.PASSWORD)
  .then(console.log)
  .catch(console.log)
