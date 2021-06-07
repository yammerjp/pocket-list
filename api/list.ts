import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import nuxtConfig from '../nuxt.config'

const pocketConsumerKey = nuxtConfig.pocketList.consumerKey

let keyLimitRestorationUnixTimeMs = 0

export default async (request: VercelRequest, response: VercelResponse) => {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'method not allowed'})
  }

  const accessToken = request?.body?.accessToken
  if (typeof accessToken !== 'string') {
    return response.status(400).json({ error: 'invalid request. need accessToken')
  }

  if (keyLimitRestorationUnixTimeMs > Date.now()) {
    // eslint-disable-next-line no-console
    console.log(`limited... wait ${keyLimitRestorationUnixTimeMs} sec`)
    return response.status(420).json({ error: 'request to getpocket.com is limited')
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
  return response.status(200).json(res?.data)
}
