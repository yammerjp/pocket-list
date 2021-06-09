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

function getPageWidth() {
  if (!process.browser) {
    return 320
  }
  const width = window.document.body.clientWidth
  if (width > 900) {
    return width - 100
  }
  if (width > 800) {
    return 800
  }
  return width

}

type ListPageState = {
  pageWidth: number;
  column: number
  imgRatio: number;
}

const imgWidthMin = 100;
const imgWidthMax = 800;
const imgMarginWidth = 8;
const pageMarginWidth = 8;

function getOuterImgWidth(imgWidth: number):number {
  return imgWidth + (imgMarginWidth*2)
}
function getInnerPageWidth(pageWidth: number):number {
  return pageWidth - (pageMarginWidth*2)
}
function getColumnMin(pageWidth: number):number {
  return Math.max(Math.floor(getInnerPageWidth(pageWidth) / getOuterImgWidth(imgWidthMax)), 1)
}
function getColumnMax(pageWidth: number):number {
  return Math.floor(getInnerPageWidth(pageWidth) / getOuterImgWidth(imgWidthMin))
}
function getColumn(columnWill: number, pageWidth:number):number {
  return Math.min(Math.max(columnWill, getColumnMin(pageWidth)), getColumnMax(pageWidth))
}

function getColumnFromImgRatio(pageWidth: number, imgRatio: number) {
  const imgWidth = pageWidth * imgRatio
  const outerImgWidth = getOuterImgWidth(imgWidth)
  const innerPageWidth = getInnerPageWidth(pageWidth)
  return  getColumn(Math.round(innerPageWidth / outerImgWidth), pageWidth)
}

function getImgWidth(column: number, pageWidth: number):number {
  return Math.min(800, (getInnerPageWidth(pageWidth) / getColumn(column, pageWidth)) - (imgMarginWidth * 2))
}

function getRatio(column: number, pageWidth: number):number {
  const imgWidth = getImgWidth(column, pageWidth)
  return imgWidth / pageWidth
}

function initialState():ListPageState {
  const pageWidth = getPageWidth();
  const column = getColumnMin(pageWidth)
  const imgWidth = getImgWidth(column, pageWidth)
  const imgRatio = imgWidth / pageWidth
  return { pageWidth, column, imgRatio}
}

export default function Home() {
  const [error, setError] = useState<Error|null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [websites, setWebsites] = useState<Website[]>([])

  const [state, setState] = useState<ListPageState>(initialState())

  const columnMax = getColumnMax(state.pageWidth)
  const columnMin = getColumnMin(state.pageWidth)
  const imgWidth = Math.floor(getImgWidth(state.column, state.pageWidth))

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
      setState(function(prevState:ListPageState):ListPageState {
        const pageWidth = getPageWidth()
        const { imgRatio } = prevState
        const column = getColumnFromImgRatio(pageWidth, imgRatio)
        return {pageWidth, column, imgRatio}
      })
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
          <input
            type="range"
            min={0}
            max={columnMax - columnMin}
            onChange={ ({target: {value}}: any) => setState(({pageWidth}) => ({ pageWidth, column: (columnMax-value), imgRatio: getRatio((columnMax-value), pageWidth) })) }
            defaultValue={columnMax-state.column}
          />
        </div>
        <div className="websites" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 auto', width: getOuterImgWidth(imgWidth) * state.column }}>
          { websites.map(website => (
            <div className="website" key={website.id} style={{margin: 8, marginTop: imgWidth*32/400, width: imgWidth, textAlign: 'left'}}>
              <div className="link-wrapper">
                <a href={website.url} target="_blank" rel="noopener">
                  <div style={{background: 'no-repeat center url("/loading-icon.gif")', margin: 0, padding: 0}}>
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
