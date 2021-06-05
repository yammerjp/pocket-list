<template>
  <div>
    <div class="slider-wrapper">
      小
      <v-slider
        v-model="column"
        :max="columnMax"
        min="1"
        ticks="always"
        tick-size="4"
      ></v-slider>
      大
    </div>
    <div ref="websites" v-resize="onResize" class="websites">
      <div v-for="(website, idx) of websites" :key="idx" class="website">
        <div :style="`width: ${columnWidth}px`">
          <a :href="website.url" target="_blank" rel="noopener">
            <div>
              <img
                :src="screenshot(website.url)"
                :width="columnWidth"
                :height="(columnWidth * 9) / 16"
              />
              <h3 :style="`font-size: ${titleSize}px`">
                {{ website.title }}
              </h3>
            </div>
          </a>
          <!--
          <div>
            {{ website.description }}
          </div>
          -->
          <small>
            {{ website.host }}
            -
            {{ timeDiff(website.createdAt) }}
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import Website from '../../types/website'
import client from '../../assets/client'

@Component
export default class RedirectedPage extends Vue {
  websitesWidth = 116
  column = 0

  get columnMax() {
    return Math.floor(this.websitesWidth / 100)
  }

  get columnWidth() {
    return (
      Math.floor(this.websitesWidth / (this.columnMax - this.column + 1)) - 16
    )
  }

  get titleSize() {
    if (this.columnWidth < 100) {
      return 10
    }
    if (this.columnWidth < 150) {
      return 13
    }
    if (this.columnWidth < 200) {
      return 14
    }
    if (this.columnWidth < 300) {
      return 16
    }
    if (this.columnWidth < 300) {
      return 18
    }
    if (this.columnWidth < 400) {
      return 20
    }
    if (this.columnWidth < 500) {
      return 22
    }
    if (this.columnWidth < 600) {
      return 24
    }
    return 32
  }

  websites: Website[] = []

  mounted() {
    if (!client.loggedIn()) {
      this.$router.push('/')
      return
    }
    this.fetchWebsites()
    this.onResize()
    this.column = this.columnMax
  }

  onResize() {
    // ウィンドウサイズが変わったときにカラム数が極端に変更されることを防ぐ
    const columnMaxBefore = this.columnMax
    this.websitesWidth = (this.$refs.websites as Element).clientWidth
    const newColumn = Math.round(
      (this.columnMax * this.column) / columnMaxBefore
    )
    this.column = Math.min(newColumn, this.columnMax)
  }

  async fetchWebsites() {
    const websites = await client.fetchWebsites().catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e)
      return undefined
    })
    if (websites) {
      this.websites = websites
    }
  }

  timeDiff(from: Date) {
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
      return diff.getUTCSeconds() + 'たった今'
    }
  }

  screenshot(url: string) {
    const base64url = window
      .btoa(unescape(encodeURIComponent(url)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    return `/api/img/800x450/${base64url}.png`
  }
}
</script>

<style scoped>
.websites {
  display: flex;
  flex-wrap: wrap;
  text-align: center;
  justify-content: center;
  max-width: 816px;
  margin: 0 auto;
}

.website {
  margin: 16px 8px;
  text-align: left;
}

.slider-wrapper {
  display: flex;
  max-width: 300px;
  margin: 0 auto;
  vertical-align: middle;
}
</style>
