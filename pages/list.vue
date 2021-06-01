<template>
  <div><button @click="clicked">buttton</button></div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import axios from 'axios'

@Component
export default class RedirectedPage extends Vue {
  accessToken = ''
  mounted() {
    const accessToken = window.localStorage.getItem('getPocketAccessToken')
    if (!accessToken) {
      this.$router.push('/')
      return
    }
    this.accessToken = accessToken
  }

  clicked() {
    axios
      .post('/api/list', { access_token: this.accessToken })
      .then((res) => {
        console.log(res)
      })
      .catch((e) => console.error(e))
  }
}
</script>
