<template>
  <div><button @click="clicked">buttton</button></div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import axios from 'axios'

@Component
export default class LoginPage extends Vue {
  clicked() {
    axios
      .post('/api/login', {})
      .then((res) => {
        const { code } = res.data
        window.localStorage.setItem('getPocketCode', code)
        const redirectUri = 'http://localhost:3000/redirected'
        // eslint-disable-next-line no-console
        console.log(res)
        window.location.href = `https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=${redirectUri}`
      })
      // eslint-disable-next-line no-console
      .catch((e) => console.error(e))
  }
}
</script>
