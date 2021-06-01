import express from 'express'
const app = express()

app.get('/', (req, res) => {
  // eslint-disable-next-line no-console
  console.log(req)
  res.send('hello, world!')
})

export default {
  path: '/api/',
  handler: app,
}
