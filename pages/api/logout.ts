import {NextApiRequest, NextApiResponse} from "next";
import { flashAccessToken } from '../../assets/cookies.ts'
const pocketConsumerKey = process.env.GETPOCKET_CONSUMER_KEY

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'method not allowed'})
  }
  flashAccessToken(response)
  return response.status(200).json({ isLoggedIn: false })
}
