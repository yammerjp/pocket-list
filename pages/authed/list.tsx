import Head from 'next/head'
import router from 'next/router'
import client from '../../assets/client'
import Website from '../../types/website'
import WebsitesComponent from '../../components/websites'
import { useEffect, useState } from 'react'

export default function ListPage() {
  const [error, setError] = useState<Error|null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [websites, setWebsites] = useState<Website[]>([])

  useEffect(() => {
    console.log('useEffect()')
    client.fetchWebsites().then(websites => {
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
