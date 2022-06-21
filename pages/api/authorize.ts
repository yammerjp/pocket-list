import {NextApiRequest, NextApiResponse} from "next";
import axios from 'axios'
import { setAccessToken } from '../../assets/cookies.ts'
const pocketConsumerKey = process.env.GETPOCKET_CONSUMER_KEY

// codeを受け取ってaccess_tokenを返す
export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'method not allowed'})
  }

  const code = request?.body?.code

  if (typeof code !== 'string') {
    return response.status(400).json({ error: 'request is invalid'})
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
    return response.status(500).json({ error: 'getpocket return invalid response'})
  }
  setAccessToken(response, accessToken)
  return response.status(200).json({ accessToken: 'is-logged-in' })
}
