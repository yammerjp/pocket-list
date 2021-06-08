import Head from 'next/head'
import router from 'next/router'
import styles from '../../styles/Home.module.css'
import client from '../../assets/client'
import Website from '../../types/website'
import { useEffect, useState } from 'react'

function screenshot(url: string) {
  const base64url = window
    .btoa(unescape(encodeURIComponent(url)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return `/api/img/800x450/${base64url}.png`
}

function timeDiff(from: Date) {
    const diffMs = new Date().getTime() - from.getTime()
    const diff = new Date(diffMs)

    // 大きい単位から順に表示
    if (diff.getUTCFullYear() - 1970) {
      return diff.getUTCFullYear() - 1970 + '年前'
    } else if (diff.getUTCMonth()) {
      return diff.getUTCMonth() + 'ヶ月前'
    } else if (diff.getUTCDate() - 1) {
      return diff.getUTCDate() - 1 + '日前'
    } else if (diff.getUTCHours()) {
      return diff.getUTCHours() + '時間前'
    } else if (diff.getUTCMinutes()) {
      return diff.getUTCMinutes() + '分前'
    } else {
      return diff.getUTCSeconds() + 'たった今'
    }
  }

export default function Home() {
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
    <div className={styles.container}>
      <Head>
        <title>pocket-list</title>
        <meta name="description" content="websites' list on getpocket" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          pocket-list
        </h1>
        <div className="websites">
          { websites.map(website => (
            <div className="website" key={website.id}>
              <div className="link-wrapper">
                <a href={website.url}>
                  <div>
                    <img src={screenshot(website.url)} />
                  </div>
                  <div>
                    <h3>
                      {website.title}
                    </h3>
                  </div>
                </a>
              </div>
              <div className="supplement">
                { website.host} - { timeDiff(website.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
