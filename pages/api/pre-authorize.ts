import {NextApiRequest, NextApiResponse} from "next";
import axios from 'axios'
const pocketConsumerKey = process.env.GETPOCKET_CONSUMER_KEY

const hostingURL = process.env.NEXT_PUBLIC_HOSTING_URL

// codeを発行
export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'method not allowed' })
  }
  const pocketResponse: any = await axios.post(
    'https://getpocket.com/v3/oauth/request',
    {
      consumer_key: pocketConsumerKey,
      redirect_uri: `${hostingURL}/redirected`,
    },
    { headers: { 'X-Accept': 'application/json' } }
  )
  const code = pocketResponse?.data?.code
  if (typeof code !== 'string') {
    return response
      .status(500)
      .json({ error: 'pocket return invalid response' })
  }
  return response.status(200).json({ code })
}
