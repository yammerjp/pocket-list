import Head from 'next/head'
import router from 'next/router'
import styles from '../styles/Home.module.css'
import client from '../assets/client'
import { Button } from '@chakra-ui/react'

async function login() {
  const { loggedIn, transition } = await client.tryLogin()
  if (loggedIn) {
    alert('already logined')
    router.push('/authed/list')
    return
  } else if (transition) {
    router.push(transition)
    return
  }
  alert('failed to try login')
}

export default function Home() {
  if (client.getLoggedIn()) {
    router.push('/authed/list')
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

        <Button colorScheme='teal' onClick={login}>login with pocket</Button>
      </main>
    </div>
  )
}
