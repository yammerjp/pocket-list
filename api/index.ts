import express from 'express'
import axios from 'axios'
import nuxtConfig from '../nuxt.config'

const pocketConsumerKey = nuxtConfig.pocketList.consumerKey
const screenshotHost = nuxtConfig.pocketList.screenshotHost
const hostingDomain = nuxtConfig.pocketList.hostingDomain

let keyLimitRestorationUnixTimeMs = 0

const app = express()

app.use(express.json())

class ResponseError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

type Response = {
  errorMessage?: string
  code?: string
  accessToken?: string
  data?: any
}

type ServerFunction = {
  (req: express.Request): Promise<Response>
}

const reject = (message: string, statusCode: number) =>
  Promise.reject(new ResponseError(message, statusCode))

const post = (requestPath: string, fn: ServerFunction) => {
  app.post(requestPath, (req: express.Request, res: express.Response) => {
    fn(req)
      .then((obj) => {
        res.json(obj).end()
      })
      .catch((e: Error | ResponseError) => {
        let statusCode = 500
        if (
          e instanceof ResponseError &&
          (e.statusCode > 400 || e.statusCode <= 600)
        ) {
          statusCode = e.statusCode
        }
        res
          .status(statusCode)
          .json({
            errorMessage: `${e}`,
          })
          .end()
      })
  })
}

app.get('/', (req, res) => {
  // eslint-disable-next-line no-console
  console.log(req)
  res.send('hello, world!')
})

// codeを返す
post('/pre-authorize', async (_) => {
  const pocketResponse: any = await axios.post(
    'https://getpocket.com/v3/oauth/request',
    {
      consumer_key: pocketConsumerKey,
      redirect_uri: `http://${hostingDomain}/redirected`,
    },
    { headers: { 'X-Accept': 'application/json' } }
  )
  const code = pocketResponse?.data?.code
  if (typeof code !== 'string') {
    return reject('pocket return invalid response', 500)
  }
  return { code }
})

// codeを受け取ってaccess_tokenを返す
post('/authorize', async (req: express.Request) => {
  const code = req?.body?.code
  if (typeof code !== 'string') {
    return reject('request is invalid', 400)
  }
  const res = await axios.post(
    'https://getpocket.com/v3/oauth/authorize',
    {
      consumer_key: pocketConsumerKey,
      code,
    },
    { headers: { 'X-Accept': 'application/json' } }
  )
  const accessToken = res?.data?.access_token
  if (typeof accessToken !== 'string') {
    return reject('getpocket return invalid response', 500)
  }
  return { accessToken }
})

post('/list', async (req: express.Request) => {
  const accessToken = req?.body?.accessToken
  if (typeof accessToken !== 'string') {
    return reject('invalid request. need accessToken', 400)
  }

  if (keyLimitRestorationUnixTimeMs > Date.now()) {
    // eslint-disable-next-line no-console
    console.log(`limited... wait ${keyLimitRestorationUnixTimeMs} sec`)
    return reject('request to getpocket.com is limited', 420)
  }

  const res = await axios.post(
    'https://getpocket.com/v3/get',
    {
      consumer_key: pocketConsumerKey,
      access_token: accessToken,
      count: 10,
      detailType: 'complete',
      state: 'all',
    },
    { headers: { 'X-Accept': 'application/json' } }
  )

  // Check rate limit for getpocket.com
  const rate = Number(res.headers['x-limit-key-remaining'])
  const sec = Number(res.headers['x-limit-key-reset'])
  // console.log(`rate: ${rate}, sec: ${sec}`)
  if (!isNaN(sec) && !isNaN(rate) && rate < 100) {
    keyLimitRestorationUnixTimeMs = Date.now() + sec * 1000
    // eslint-disable-next-line no-console
    console.log(
      `WARNING! consumer key close to limit!  remaining..${rate}times, restoration..${sec}sec later`
    )
  }

  return res?.data
})

app.get(/^\/img\/.*$/, async (req, res) => {
  const reqPath = req.path.slice(5)
  const responsed = await axios
    .get(`https://${screenshotHost}/${reqPath}`, { maxRedirects: 0 })
    .catch((e) => {
      return e.response
    })
  if (responsed?.status !== 302) {
    res.status(400).send('invalid request').end()
    return
  }

  const location = responsed?.headers?.location
  if (typeof location !== 'string') {
    res.status(500).send('internal server error').end()
    return
  }
  res.redirect(302, location)
})

export default {
  path: '/api/',
  handler: app,
}
