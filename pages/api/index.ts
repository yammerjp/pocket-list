import {NextApiRequest, NextApiResponse} from "next";

export default async (request: NextApiRequest, response: NextApiResponse) => {
  return response.status(200).json({ message: 'hello, world!'})
}