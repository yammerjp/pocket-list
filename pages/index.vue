<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">
          Welcome to the Vuetify + Nuxt.js template
        </v-card-title>
        <v-card-text> Pocketのリストをもっとみやすくする </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" rounded @click="login">
            Login with Pocket
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class IndexPage extends Vue {
  login() {
    const accessToken = window.localStorage.getItem('getPocketAccessToken')
    if (typeof accessToken === 'string') {
      alert('already logined')
      this.$router.push('/authed/list')
      return
    }
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
