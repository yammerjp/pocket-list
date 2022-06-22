import Head from 'next/head'
import router from 'next/router'
import client from '../../assets/client'
import Website from '../../types/website'
import WebsitesComponent from '../../components/websites'
import PocketListHeader from '../../components/PocketListHeader'
import { useEffect, useState } from 'react'

const renderWithHeader = (p: JSX.Element) => (
    <div>
      <Head>
        <title>pocket-list</title>
        <meta name="description" content="websites' list on getpocket" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{textAlign: 'center'}}>
        <PocketListHeader />
        {p}
      </main>
    </div>)

export default function ListPage() {
  const [error, setError] = useState<Error|null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [websites, setWebsites] = useState<Website[]>([])

  useEffect(() => {
    client.fetchWebsites().then(websites => {
      setIsLoaded(true)
      setWebsites(websites)
    }).catch(e => {
      setIsLoaded(true)
      setError(e)
    })
  }, [])

  if (process.browser && !client.getLoggedIn()) {
    router.push('/')
    return (<div></div>)
  }

  if (error) {
    return renderWithHeader(<div>Error: {error.message}</div>)
  }
  if (!isLoaded) {
    return renderWithHeader(<div>Loading...</div>)
  }

  return renderWithHeader(
        <WebsitesComponent websites={websites} />
  )
}
