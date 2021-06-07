import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import nuxtConfig from '../../../nuxt.config'

const screenshotHost = nuxtConfig.pocketList.screenshotHost

export default async (request: VercelRequest, response: VercelResponse) => {
  const {
    query: { key },
  } = request
  const reqPath = key.slice(5)

  const responsed = await axios
    .get(`https://${screenshotHost}/img/800x450/${reqPath}`, { maxRedirects: 0 })
    .catch((e) => {
      return e.response
    })
  if (responsed?.status !== 302) {
    return response.status(400).json({error: 'invalid request'})
  }

  const location = responsed?.headers?.location
  if (typeof location !== 'string') {
    return response.status(500).json({error: 'internal server error'})
  }
  return response.redirect(302, location)
}