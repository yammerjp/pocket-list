import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import nuxtConfig from '../nuxt.config'

const pocketConsumerKey = nuxtConfig.pocketList.consumerKey
const hostingDomain = nuxtConfig.pocketList.hostingDomain

export default async (request: VercelRequest, response: VercelResponse) => {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'method not allowed'})
  }
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
    return response.status(500).json({ error: 'pocket return invalid response'})
  }
  return response.status(200).json({code})
}