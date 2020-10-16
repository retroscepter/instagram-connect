
const { Client } = require('../lib')
const { EXPERIMENTS } = require('../lib/constants/experiments')

const client = new Client()

client.state.generateDevice()

client.account.login(process.env.USERNAME, process.env.PASSWORD)
  .then(console.log)
  .catch(error => console.log(error.response.body))
