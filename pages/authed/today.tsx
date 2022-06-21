import Head from 'next/head'
import router from 'next/router'
import client from '../../assets/client'
import Website from '../../types/website'
import WebsitesComponent from '../../components/websites'
import styles from '../../styles/Today.module.css'
import { useEffect, useState } from 'react'

const copyWithNotice = async (targetText: string, noticeFunc: Function) => {
  if (!navigator.clipboard) {
    return noticeFunc('failed to copy')
  }
  await navigator.clipboard.writeText(targetText)
  return noticeFunc('copied')
}

export default function ListPage() {
  const [error, setError] = useState<Error|null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [websites, setWebsites] = useState<Website[]>([])
  const [daysAgo, setDaysAgo] = useState<number>(1)

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
    return (<div>Error: {error.message}</div>)
  }
  if (!isLoaded) {
    return (<div>Loading...</div>)
  }

  const websitesWithDiffDay = websites.map(w => ({
    ...w,
    diffDay: (Date.now() - (new Date(w.createdAt)).getTime()) / ( 1000 * 60 * 60 * 24)
  }))
  const websitesInTerm = websitesWithDiffDay.filter(({ diffDay }) =>diffDay < daysAgo && diffDay > daysAgo - 1)
  const oldestDiff = Math.ceil(Math.max(...websitesWithDiffDay.map(({diffDay}) => diffDay)))

  return (
    <div>
      <Head>
        <title>pocket-list</title>
        <meta name="description" content="websites' list on getpocket" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.markdownText}>
        <h1>
          pocket-list
        </h1>
        <div>
        links:
          <a href="/authed/list">show websites</a>
          /
          <a href="/logout">logout</a>
        </div>
        <div>
          <input
            type="range"
            value={daysAgo}
            onChange={e => setDaysAgo(parseInt(e.target.value))}
            min={1}
            max={oldestDiff}
          />
          ({daysAgo}日前のもの)
        </div>
        <textarea
          value={websitesInTerm.map(({title, url}) => `[${title}](${url})`).join('\r\n')}
          className={styles.markdownTextarea}
          readOnly
          onClick={e => (e.target instanceof HTMLTextAreaElement) && copyWithNotice(e.target.value, console.log)}
        />
        <div>
          {
            websitesInTerm.map(({title, url, description}) =>(
              <a href={url} target="_blank">
                <div>
                  {title}
                </div>
                <div className={styles.websiteDescription}>
                  {description}
                </div>
              </a>
            ))
          }
        </div>
      </main>
    </div>  )
}
