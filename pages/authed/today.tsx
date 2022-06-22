import Head from 'next/head'
import router from 'next/router'
import client from '../../assets/client'
import Website from '../../types/website'
import WebsitesComponent from '../../components/websites'
import styles from '../../styles/Today.module.css'
import PocketListHeader from '../../components/PocketListHeader'
import { useEffect, useState } from 'react'
import { Textarea } from '@chakra-ui/react'
import {
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
} from '@chakra-ui/react'
import { Heading, LinkBox, LinkOverlay, Text } from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'

const copyWithNotice = async (targetText: string, noticeFunc: Function) => {
  if (!navigator.clipboard) {
    return noticeFunc({
          title: 'failed to copy',
          status: 'error',
          duration: 9000,
          isClosable: true
    })
  }
  await navigator.clipboard.writeText(targetText)
  return noticeFunc({
          title: 'copied',
          status: 'success',
          duration: 9000,
          isClosable: true
    })
}

const renderWithHeader = (p) => (
    <div>
      <Head>
        <title>pocket-list</title>
        <meta name="description" content="websites' list on getpocket" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.markdownText}>
        <PocketListHeader />
        <div>
          {p}
        </div>
      </main>
    </div>
)

export default function ListPage() {
  const [error, setError] = useState<Error|null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [websites, setWebsites] = useState<Website[]>([])
  const [daysAgo, setDaysAgo] = useState<{min: number, max: number}>({min: 0, max: 1})

  const toast = useToast()

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
    return renderWithHeader(<div></div>)
  }

  if (error) {
    return renderWithHeader(<div>Error: {error.message}</div>)
  }
  if (!isLoaded) {
    return renderWithHeader(<div>Loading...</div>)
  }

  const websitesWithDiffDay = websites.map(w => ({
    ...w,
    diffDay: (Date.now() - (new Date(w.createdAt)).getTime()) / ( 1000 * 60 * 60 * 24)
  }))
  const websitesInTerm = websitesWithDiffDay.filter(({ diffDay }) => diffDay <= daysAgo.max && diffDay >= daysAgo.min)
  const oldestDiff = Math.ceil(Math.max(...websitesWithDiffDay.map(({diffDay}) => diffDay)))

  const markdownString = websitesInTerm.map(({title, url}) => `[${title}](${url})`).join('\r\n');
  return renderWithHeader(
    <>
      <div>
        <RangeSlider
          aria-label={['min', 'max']}
          defaultValue={[daysAgo.min, daysAgo.max]}
          min={0}
          max={oldestDiff}
          onChange={val => setDaysAgo({min: val[0], max: val[1]})}
        >
          <RangeSliderTrack>
            <RangeSliderFilledTrack />
          </RangeSliderTrack>
          <RangeSliderThumb index={0} />
          <RangeSliderThumb index={1} />
        </RangeSlider>
        ({daysAgo.min}〜{daysAgo.max}日前)
      </div>
      <div className={styles.markdownTextCopyButtonWrapper}>
        <Button colorScheme='teal' onClick={() => copyWithNotice(markdownString, m => toast(m))}>
          Copy markdown format links
        </Button>
      </div>
      <div>
        { websitesInTerm.map(({id, title, url, description}) =>(
          <LinkBox as='article' p='5' borderWidth='1px' rounded='md' key={id}>
            <Heading size='md' my='2'>
              <LinkOverlay href={url} target="_blank">
                {title}
              </LinkOverlay>
            </Heading>
            <Text>
              {description}
            </Text>
          </LinkBox>
        )) }
      </div>
    </>
  )
}
