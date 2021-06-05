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
import client from '../assets/client'

@Component
export default class IndexPage extends Vue {
  mounted() {
    if (client.loggedIn()) {
      this.$router.push('/authed/list')
    }
  }

  async login() {
    const { loggedIn, transition } = await client.tryLogin()
    if (loggedIn) {
      alert('already logined')
      this.$router.push('/authed/list')
      return
    } else if (transition) {
      window.location.href = transition
      return
    }
    alert('failed to try login')
  }
}
</script>
