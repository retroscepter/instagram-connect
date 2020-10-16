
const fs = require('fs')
const path = require('path')
const { Client } = require('../lib')

const CODE_PATH = path.join(__dirname, 'code.txt')

const client = new Client({
    username: process.env.USERNAME,
    password: process.env.PASSWORD
})

client.login().catch(() => null)

client.on('ready', () => {
    console.log('Ready')
})

client.on('request', () => {
    
})

client.on('challenge', async challenge => {
    await challenge.selectMethod()
    await fs.writeFileSync(CODE_PATH, '')
    await new Promise(resolve => {
        const watcher = fs.watch(CODE_PATH, async () => {
            watcher.close()
            setTimeout(resolve, 1000)
        })
    })
    const code = fs.readFileSync(CODE_PATH, 'utf8').replace(/(\r\n|\n|\r)/gm, '')
    fs.unlinkSync(CODE_PATH)
    await challenge.solve(code)
})
