const express = require('express')
const path = require('path')
const axios = require('axios');

const app = express()
const port = 5000
const gengo_url = 'https://gengo.com/rss/available_jobs/5881e505897f0f1b825d349ce6050019546e7587ac011847602998/'

app.get('/status', (req, res) => {
    res.send('Server Running!')
})

app.use('/', express.static(path.join(__dirname, '../build')))

app.use('/gengo-rss', async (req, res) => {
    const response = await axios.get(gengo_url);
    console.info(`${new Date().toLocaleString()} /gengo-rss`);
    res.send(response.data)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
