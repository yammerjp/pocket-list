import express from 'express'
import dotenv from 'dotenv'
import axios from 'axios'

import bodyParser from 'body-parser'

dotenv.config()
const pocketConsumerKey = process.env.GETPOCKET_CONSUMER_KEY

const app = express()

app.use(bodyParser.json())

app.get('/', (req, res) => {
  // eslint-disable-next-line no-console
  console.log(req)
  res.send('hello, world!')
})

app.post('/login', async (req, res) => {
  const pocketResponse: any = await axios
    .post(
      'https://getpocket.com/v3/oauth/request',
      {
        consumer_key: pocketConsumerKey,
        redirect_uri: 'http://localhost/redirected',
      },
      { headers: { 'X-Accept': 'application/json' } }
    )
    .catch((e) => {
      console.log(e)
      res.status(500).end()
    })

  // console.log(pocketResponse.data.code)
  console.log(pocketResponse)
  res.json({ code: pocketResponse.data.code }).end()
})

app.post('/authorize', async (req: any, res) => {
  console.log('/authorize')
  console.log(req)
  if (!req?.body?.code) {
    res.status(400).end()
    return
  }
  const { code } = req.body
  const pocketResponse: any = await axios
    .post(
      'https://getpocket.com/v3/oauth/authorize',
      {
        // consumer_key: pocketConsumerKey,
        consumer_key: pocketConsumerKey,
        code,
      },
      { headers: { 'X-Accept': 'application/json' } }
    )
    .catch((e) => {
      console.log(e)
      res.status(500).end()
    })
  res.json({ access_token: pocketResponse.data.access_token }).end()
})

app.post('/list', async (req: any, res) => {
  const { access_token } = req.body
  if (!access_token) {
    res.status(400).end()
  }
  const pocketResponse: any = await axios
    .post(
      'https://getpocket.com/v3/get',
      {
        consumer_key: pocketConsumerKey,
        access_token,
        count: 10,
        detailType: 'complete',
      },
      { headers: { 'X-Accept': 'application/json' } }
    )
    .then((pocketResponse) => {
      console.log(pocketResponse)
      res.json({ data: pocketResponse.data }).end()
    })
    .catch((e) => {
      console.log(e)
      res.status(500).end()
    })
})

export default {
  path: '/api/',
  handler: app,
}
