import Head from 'next/head'
import router from 'next/router'
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
    return 'たった今'
  }
}

function titleFontSize(imgWidth: Number) {
  if (imgWidth < 100) {
    return 10
  }
  if (imgWidth < 150) {
    return 13
  }
  if (imgWidth < 200) {
    return 14
  }
  if (imgWidth < 300) {
    return 16
  }
  if (imgWidth < 300) {
    return 18
  }
  if (imgWidth < 400) {
    return 20
  }
  if (imgWidth < 500) {
    return 22
  }
  if (imgWidth < 600) {
    return 24
  }
  return 32
}

function calcWindowWidth(width: number, column: number): number {
  return Math.min(800, (width / column) - 16)
}

function columnMax(width: number) {
  return Math.floor(width / 100)
}

export default function Home() {
  const [error, setError] = useState<Error|null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [websites, setWebsites] = useState<Website[]>([])
  const [column, setColumn] = useState<number>(process.browser? Math.floor(window.innerWidth / 300) : 1)
  const [windowWidth, setWindowWidth] = useState<number>(process.browser ? window.innerWidth: 300)
  const width = windowWidth || ( process.browser ? window.innerWidth : 300)
  const imgWidth = calcWindowWidth(width, column || 1)

  console.log(column)

  useEffect(() => {
    console.log('useEffect()')
    client.fetchWebsites().then(websites => {
      setIsLoaded(true)
      setWebsites(websites)
    }).catch(e => {
      setIsLoaded(true)
      setError(e)
    })

    if(!process.browser) {
      return
    }
    window.addEventListener('resize', e => {
      console.log('resize event')
      const width = window.innerWidth
      setWindowWidth(width)
      // PLEASE FIX NEXT LINE
      setColumn(Math.floor(column * width / windowWidth))

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
        <div>
          大
          <input type="range" min="1" max={columnMax(windowWidth)} onChange={ (e: any) => setColumn(e.target.value) } defaultValue={process.browser? Math.floor(window.innerWidth / 300) : 1}/>
          小
        </div>
        <div className="websites" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 auto', width: (imgWidth + 16) * column }}>
          { websites.map(website => (
            <div className="website" key={website.id} style={{margin: 8, marginTop: imgWidth*32/400, width: imgWidth, textAlign: 'left'}}>
              <div className="link-wrapper">
                <a href={website.url} target="_blank" rel="noopener">
                  <div>
                    <img src={screenshot(website.url)} width={imgWidth} height={imgWidth*9/16} style={{border: 'solid 1px #eeeeee'}}/>
                  </div>
                  <div>
                    <h3 style={{ fontSize : titleFontSize(imgWidth), margin: 0 }}>
                      {website.title}
                    </h3>
                  </div>
                </a>
              </div>
              <div className="supplement" style={{ fontSize: Math.max(Math.floor(titleFontSize(imgWidth) * 0.7), 12) }}>
                { website.host} - { timeDiff(website.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>  )
}
