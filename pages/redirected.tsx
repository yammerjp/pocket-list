import router from 'next/router'
import client from '../assets/client'
export default function Redirected() {
  if (process.browser) {
    client.login().then(loggedIn => {
      if (loggedIn)  {
      router.push('/authed/list')
      } else {
      router.push('/')
      }
    })
  }
  return (
    <div>
      a
    </div>
  )
}
