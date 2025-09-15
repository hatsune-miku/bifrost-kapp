const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const bodyParser = require('body-parser')

const app = express()

app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('application/json')) {
    bodyParser.json()(req, res, next)
  } else if (
    req.headers['content-type']?.includes('application/x-www-form-urlencoded')
  ) {
    bodyParser.urlencoded({ extended: true })(req, res, next)
  } else {
    next()
  }
})

app.use(bodyParser.raw())
const proxy = createProxyMiddleware({
  target: 'https://www.kookapp.cn',
  changeOrigin: true,
  ws: true,
  followRedirects: true,
  logLevel: 'debug',
  //   onProxyReq: (proxyReq, req) => {
  //     proxyReq.write(req.body)
  //   },
})

app.use('/api/v3/aaa/bbb', (req, res, next) => {
  console.log('Intercepted /api/v3/aaa/bbb request')
  if (req.body) {
    req.bodyAlreadyModified = true
  }
  next()
})

app.use('/', proxy)

const PORT = 9872
app.listen(PORT, () => {
  console.log(`Server A (9872) running on port ${PORT}`)
})
