<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import client from '../assets/client'

@Component
export default class RedirectedPage extends Vue {
  async mounted() {
    if (await client.login()) {
      this.$router.push('/authed/list')
    } else {
      this.$router.push('/')
    }
  }
}
</script>
