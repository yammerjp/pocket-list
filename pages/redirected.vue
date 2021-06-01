<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import axios from 'axios'

@Component
export default class RedirectedPage extends Vue {
  async mounted() {
    const code = window.localStorage.getItem('getPocketCode')
    if (!code) {
      this.$router.push('/')
    }
    window.localStorage.removeItem('getPocketCode')
    console.log(code)

    await axios
      .post('/api/authorize', {
        code,
      })
      .then((res) => {
        console.log('res')
        window.localStorage.setItem(
          'getPocketAccessToken',
          res.data.access_token
        )
        window.localStorage.setItem('getPocketUsername', res.data.username)
        this.$router.push('/list')
      })
      .catch((e) => {
        console.log(e)
      })
  }
}
</script>
