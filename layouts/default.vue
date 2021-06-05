<template>
  <v-app dark>
    <v-app-bar app>
      <v-toolbar-title>pocket-list</v-toolbar-title>
      <v-spacer />
      <span v-if="loggedIn">
        <v-btn @click.stop="logout"> ログアウト </v-btn>
      </span>
      <span v-else>
        <v-btn @click.stop="login"> ログイン </v-btn>
      </span>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import client from '../assets/client'

@Component
export default class Default extends Vue {
  get loggedIn() {
    return /^\/authed/.test(this.$route.path)
  }

  async login() {
    const { loggedIn, transition } = await client.tryLogin()
    if (loggedIn) {
      alert('already logined')
      this.$router.push('/authed/list')
    } else if (transition) {
      window.location.href = transition
    } else {
      alert('failed to try to login')
    }
  }

  logout() {
    client.logout()
    this.$router.push('/')
  }

  items = [
    {
      icon: 'mdi-apps',
      title: 'Welcome',
      to: '/',
    },
    {
      icon: 'mdi-chart-bubble',
      title: 'List',
      to: '/authed/list',
    },
  ]
}
</script>

<style>
html,
body {
  overflow: scroll;
}
</style>
