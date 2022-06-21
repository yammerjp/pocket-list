import router from 'next/router'
import client from '../assets/client'
export default function Redirected() {
  if (process.browser) {
    client.logout().then(() => router.push('/'))
  }
  return (
    <div>
      processing logout...
    </div>
  )
}
