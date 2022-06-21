import { NextApiRequest, NextApiResponse } from 'next'
const hostingURL = process.env.NEXT_PUBLIC_HOSTING_URL
const isHttps = /^https:\/\//.test(hostingURL)

const cookieSerializer = (pairs: {[string]: string|true}): string => 
  Object.keys(pairs).map(key => `${key}${ pairs[key]===true ? '' : '='+pairs[key] };`).join(' ')

const setCookie = (
  res: NextApiResponse,
  name: string,
  value: string,
  options: {maxAge: number}|undefined = {}
) => {
  const serialized = cookieSerializer({
    [name]: value,
    'SameSite': 'Strict',
    ...isHttps&&{'Secure': true},
    ...(options?.maxAge !== undefined)&&{'Max-Age': `${options.maxAge}`}
  })
  console.log(serialized)
  res.setHeader('Set-Cookie', serialized)
  // `${name}=${value}; SameSite=Strict; HttpOnly; ${ isHttps ? 'Secure; ' : ''}${ options?.maxAge !== undefined ? `Max-Age=${options.maxAge};` }`)
}


const getCookie = (
  req: NextApiRequest,
  name: string
) => {
  return req.cookies[name]
}

const flashCookie = (
  res: NextApiResponse,
  name: string
) => {
  setCookie(res, name, '', { maxAge: 0 })
}

const cookieKeyCode = 'pocket-list-auth-code'
const cookieKeyAccessToken = 'pocket-list-auth-access-token'

export const setAccessToken = (
  res: NextApiResponse,
  accessToken: string
) => {
  setCookie(res, cookieKeyAccessToken, accessToken, { maxAge: 60*60*24*365 })
}

export const getAccessToken = (
  req: NextApiRequest,
  res: NextApiResponse
): string => {
  return getCookie(req, cookieKeyAccessToken)
}

export const flashAccessToken = (
  res: NextApiResponse
) => {
  return flashCookie(res, cookieKeyAccessToken)
}
