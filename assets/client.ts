import axios from 'axios'
import Website from '../types/website'

class ApiClient {
  constructor() {
    const accessToken = window.localStorage.getItem('getPocketAccessToken')
    if (typeof accessToken === 'string') {
      this.accessToken = accessToken
    } else {
      this.accessToken = undefined
    }
  }

  private setCode(code: string) {
    window.localStorage.setItem('getPocketCode', code)
  }

  private removeCode() {
    window.localStorage.removeItem('getPocketCode')
  }

  private loadCode() {
    return window.localStorage.getItem('getPocketCode')
  }

  private accessToken?: string

  loggedIn() {
    return !!client.accessToken
  }

  async tryLogin(): Promise<{ loggedIn: boolean; transition?: string }> {
    if (this.loggedIn()) {
      // alert('already logined')
      return { loggedIn: true }
    }

    const code = await axios
      .post('/api/pre-authorize', {})
      .then((res: any) => {
        return res.data.code
      })
      // eslint-disable-next-line no-console
      .catch((e) => console.error(e))

    if (!code) {
      return { loggedIn: false }
    }
    this.setCode(code)
    const redirectUri = 'http://localhost:3000/redirected'
    return {
      loggedIn: false,
      transition: `https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=${redirectUri}`,
    }
  }

  async login(): Promise<boolean> {
    const code = client.loadCode()
    if (!code) {
      return false
    }
    this.removeCode()

    const accessToken = await axios
      .post('/api/authorize', {
        code,
      })
      .then((res) => res?.data?.accessToken)
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e)
        return undefined
      })

    if (!accessToken) {
      return false
    }
    this.accessToken = accessToken
    window.localStorage.setItem('getPocketAccessToken', accessToken)
    return true
  }

  logout() {
    window.localStorage.removeItem('getPocketAccessToken')
    this.accessToken = undefined
  }

  fetchWebsites() {
    const accessToken = this.accessToken
    if (!this.accessToken) {
      return Promise.reject(new Error('did not login'))
    }
    return axios.post('/api/list', { accessToken }).then(response2websites)
  }
}

const response2websites = (res: any): Website[] => {
  if (typeof res?.data?.list !== 'object') {
    throw new TypeError('fetched request, but res.data.list si not object')
  }
  const list = Object.keys(res.data.list).map((key) => res.data.list[key])

  // eslint-disable-next-line no-console
  console.log('fetched request')
  // eslint-disable-next-line no-console
  console.log(list)

  const websites: (Website | undefined)[] = list.map((elm: any) => {
    const id = Number(elm.item_id)
    if (isNaN(id)) {
      // eslint-disable-next-line no-console
      console.error(`invalid item_id: ${elm.item_id}`)
      return undefined
    }

    if (isNaN(Number(elm.time_updated))) {
      // eslint-disable-next-line no-console
      console.error(`invalid time_updated: ${elm.time_updated}`)
      return undefined
    }
    const updatedAt = new Date(Number(elm.time_updated) * 1000)

    if (isNaN(Number(elm.time_added))) {
      // eslint-disable-next-line no-console
      console.error(`invalid time_added: ${elm.time_added}`)
      return undefined
    }
    const createdAt = new Date(Number(elm.time_added) * 1000)

    const url = elm.resolved_url ?? elm.given_url ?? elm.amp_url ?? ''
    const slice = url.split('/')
    if (slice.length < 3) {
      // eslint-disable-next-line no-console
      console.error(`invalid url: ${url}`)
      return undefined
    }
    const host = slice[2]

    const website: Website = {
      title: elm.resolved_title ?? elm.given_title ?? '',
      description: elm.excerpt ?? '',
      img: elm.top_image_url ?? undefined,
      url,
      host,
      id,
      createdAt,
      updatedAt,
    }
    return website
  })
  return (
    websites.filter((elm: Website | undefined) => !!elm) as Website[]
  ).sort(
    (a: Website, b: Website) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

const client = new ApiClient()
export default client
