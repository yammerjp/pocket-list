<template>
  <div>
    <v-btn color="primary" rounded @click="logout"> logout </v-btn>
    <div v-for="(website, idx) of websites" :key="idx" style="margin: 16px">
      <h3>
        <a :href="website.url">
          {{ website.title }}
        </a>
      </h3>
      <div>
        {{ website.description }}
      </div>
      <small>
        {{ website.host }}
        -
        {{ timeDiff(website.createdAt) }}
      </small>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import axios from 'axios'

type Website = {
  id: number
  createdAt: Date
  updatedAt: Date
  title: string
  description: string
  url: string
  host: string
  img?: string
}

@Component
export default class RedirectedPage extends Vue {
  accessToken = ''
  websites: Website[] = []

  mounted() {
    this.loadAccessToken()
    this.fetchWebsites()
  }

  loadAccessToken() {
    const accessToken = window.localStorage.getItem('getPocketAccessToken')
    if (!accessToken) {
      this.$router.push('/')
      return
    }
    this.accessToken = accessToken
  }

  async fetchWebsites() {
    const list = await axios
      .post('/api/list', { accessToken: this.accessToken })
      .then((res) => {
        // eslint-disable-next-line no-console
        console.log(res)
        if (typeof res?.data?.list !== 'object') {
          return []
        }
        return Object.keys(res.data.list).map((key) => res.data.list[key])
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e)
        return []
      })

    // eslint-disable-next-line no-console
    console.log('fetched request')
    // eslint-disable-next-line no-console
    console.log(list)

    const websites: (Website | undefined)[] = list.map((elm: any) => {
      const id = Number(elm.item_id)
      if (isNaN(id)) {
        // eslint-disable-next-line no-console
        console.error(`invalid item_id: ${elm.item_id}`)
        return undefined
      }

      if (isNaN(Number(elm.time_updated))) {
        // eslint-disable-next-line no-console
        console.error(`invalid time_updated: ${elm.time_updated}`)
        return undefined
      }
      const updatedAt = new Date(Number(elm.time_updated) * 1000)

      if (isNaN(Number(elm.time_added))) {
        // eslint-disable-next-line no-console
        console.error(`invalid time_added: ${elm.time_added}`)
        return undefined
      }
      const createdAt = new Date(Number(elm.time_added) * 1000)

      const url = elm.resolved_url ?? elm.given_url ?? elm.amp_url ?? ''
      const slice = url.split('/')
      if (slice.length < 3) {
        // eslint-disable-next-line no-console
        console.error(`invalid url: ${url}`)
        return undefined
      }
      const host = slice[2]

      const website: Website = {
        title: elm.resolved_title ?? elm.given_title ?? '',
        description: elm.excerpt ?? '',
        img: elm.top_image_url ?? undefined,
        url,
        host,
        id,
        createdAt,
        updatedAt,
      }
      return website
    })
    // @ts-ignore
    const websiteFiltered: Website[] = websites.filter(
      (elm: Website | undefined) => !!elm
    )
    this.websites = websiteFiltered.sort(
      (a: Website, b: Website) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  timeDiff(from: Date) {
    // 現在時刻との差分＝経過時間
    const diff = new Date().getTime() - from.getTime()
    // 経過時間をDateに変換
    const elapsed = new Date(diff)

    // 大きい単位から順に表示
    if (elapsed.getUTCFullYear() - 1970) {
      return elapsed.getUTCFullYear() - 1970 + '年前'
    } else if (elapsed.getUTCMonth()) {
      return elapsed.getUTCMonth() + 'ヶ月前'
    } else if (elapsed.getUTCDate() - 1) {
      return elapsed.getUTCDate() - 1 + '日前'
    } else if (elapsed.getUTCHours()) {
      return elapsed.getUTCHours() + '時間前'
    } else if (elapsed.getUTCMinutes()) {
      return elapsed.getUTCMinutes() + '分前'
    } else {
      return elapsed.getUTCSeconds() + 'たった今'
    }
  }

  logout() {
    window.localStorage.removeItem('getPocketAccessToken')
    this.$router.push('/')
  }
}
</script>
