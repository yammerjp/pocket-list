import {NextApiRequest, NextApiResponse} from "next";
import axios from 'axios'
const screenshotHost = process.env.SCREENSHOT_HOST

export default async (request: NextApiRequest, response: NextApiResponse) => {
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