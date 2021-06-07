import Head from 'next/head'
import router from 'next/router'
import styles from '../../styles/Home.module.css'
import client from '../../assets/client'
import { normalizeRouteRegex } from 'next/dist/lib/load-custom-routes'

export default function Home() {
  if (!client.loggedIn() && process.browser) {
    router.push('/')
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
      </main>
    </div>
  )
}
