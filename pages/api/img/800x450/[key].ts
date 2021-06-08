import {NextApiRequest, NextApiResponse} from "next";
import axios from 'axios'
const screenshotURL = process.env.SCREENSHOT_URL

export default async (request: NextApiRequest, response: NextApiResponse) => {
  const {
    query: { key },
  } = request

  console.log(`${screenshotURL}/800x450/${key}`)
  const responsed = await axios
    .get(`${screenshotURL}/800x450/${key}`, { maxRedirects: 0 })
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