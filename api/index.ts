import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import nuxtConfig from '../nuxt.config'

const pocketConsumerKey = nuxtConfig.pocketList.consumerKey
const screenshotHost = nuxtConfig.pocketList.screenshotHost

let keyLimitRestorationUnixTimeMs = 0

export default async (request: VercelRequest, response: VercelResponse) => {
  return response.status(200).json({ message: 'hello, world!'})
}