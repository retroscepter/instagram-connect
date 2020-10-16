
const { Client } = require('../lib')
const { EXPERIMENTS } = require('../lib/constants/experiments')

const client = new Client()

client.state.generateDevice()

client.request.send({
    url: 'api/v1/qe/sync/',
    method: 'POST',
    data: {
        id: client.state.uuid,
        experiments: EXPERIMENTS
    }
})
  .then(data => {
    console.log(data)
    console.log(client.state.csrfToken)
  })
