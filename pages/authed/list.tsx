import Head from 'next/head'
import router from 'next/router'
import client from '../../assets/client'
import Website from '../../types/website'
import WebsitesComponent from '../../components/websites'
import { useEffect, useState } from 'react'

const loadWebsites = async () => {
  if (!process.browser) {
    return []
  }
  const { websites, storedAt } = loadWebsitesFromLocalStorage()
  const websitesFetched = await client.fetchWebsites(storedAt)
  const websitesMerged =  [ ...websitesFetched, ...websites].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
  storeWebsitesToLocalStorage(websitesMerged)
  return websitesMerged
}

function storeWebsitesToLocalStorage(websites: Website[]) {
  const jsobj = websites.map(({ id, title, description, url, host, img, createdAt, updatedAt}) => ({
    id, title, description, url, host, img, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString()
  }))
  console.log('storing')
  console.log(jsobj)
  localStorage.setItem('pocketWebsites', JSON.stringify(jsobj))
  localStorage.setItem('pocketWebsitesStoredAt', new Date().toISOString())
}

function loadWebsitesFromLocalStorage(): { websites: Website[], storedAt: number|undefined } {
  const websitesJsonString = localStorage.getItem('pocketWebsites')
  console.log(`pocket-websites: ${websitesJsonString}`)
  const storedAtString = localStorage.getItem('pocketWebsitesStoredAt')
  console.log(`pocket-websites-stored-at: ${storedAtString}`)
  if (!storedAtString || !websitesJsonString) {
    console.error('error occured')
    return { websites: [], storedAt: undefined }
  }
  try {
    const websites = (JSON.parse(websitesJsonString) as any[]).map(({ id, title, description, url, host, img, createdAt, updatedAt }):Website => ({
        id,
        title,
        description,
        url,
        host,
        img,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt)
    }))
    console.log(websites)
    const storedAt = Math.floor((new Date(storedAtString)).getTime() / 1000)
    return {websites, storedAt}
  } catch(e) {
    console.error(e)
    return { websites: [], storedAt: undefined }
  }
}

export default function ListPage() {
  const [error, setError] = useState<Error|null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [websites, setWebsites] = useState<Website[]>([])

  useEffect(() => {
    console.log('useEffect()')
    loadWebsites().then(websites => {
      setIsLoaded(true)
      setWebsites(websites)
    }).catch(e => {
      setIsLoaded(true)
      setError(e)
    })
  }, [])

  if (process.browser && !client.loggedIn()) {
    router.push('/')
    return (<div></div>)
  }

  if (error) {
    return (<div>Error: {error.message}</div>)
  }
  if (!isLoaded) {
    return (<div>Loading...</div>)
  }

  return (
    <div>
      <Head>
        <title>pocket-list</title>
        <meta name="description" content="websites' list on getpocket" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{textAlign: 'center'}}>
        <h1>
          pocket-list
        </h1>
        <WebsitesComponent websites={websites} />
      </main>
    </div>  )
}
