import Link from 'next/link'
import styles from '../styles/PocketListHeader.module.css'
import { Flex, Box, Heading, Spacer, ButtonGroup, Button } from '@chakra-ui/react'

const render = () => (
  <div className={styles.headerWrapper}>
    <Flex minWidth='max-content' alignItems='center' gap='2'>
      <Box p='2'>
        <Heading size='md'>
          pocket-list.yammer.jp
        </Heading>
      </Box>
      <Spacer />
      <ButtonGroup gap='2'>
        <Link href="/authed/list">
          <Button>tails</Button>
        </Link>
        <Link href="/authed/today">
          <Button>copying</Button>
        </Link>
        <Link href="/logout">
          <Button colorScheme='teal'>logout</Button>
        </Link>
      </ButtonGroup>
    </Flex>
  </div>
)
export default render
