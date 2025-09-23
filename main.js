const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const bodyParser = require('body-parser')

const app = express()

// app.use((req, res, next) => {
//   if (req.headers['content-type']?.includes('application/json')) {
//     bodyParser.json()(req, res, next)
//   } else if (
//     req.headers['content-type']?.includes('application/x-www-form-urlencoded')
//   ) {
//     bodyParser.urlencoded({ extended: true })(req, res, next)
//   } else {
//     next()
//   }
// })

// app.use(bodyParser.raw())

const proxy = createProxyMiddleware({
  target: 'https://www.kookapp.cn',
  changeOrigin: true,
  ws: true,
  headers: {
    Referer: 'https://www.kookapp.cn',
  },
  onProxyReq: (proxyReq, req) => {
    console.log('xx', 'Changing Referer from', proxyReq.getHeader('Referer'), 'to', 'https://www.kookapp.cn')
    proxyReq.setHeader('Referer', 'https://www.kookapp.cn')
  },
})

// app.use('/api/v3/aaa/bbb', (req, res, next) => {
//   console.log('Intercepted /api/v3/aaa/bbb request')
//   if (req.body) {
//     req.bodyAlreadyModified = true
//   }
//   next()
// })

app.use('/', proxy)

const PORT = 9872
app.listen(PORT, () => {
  console.log(`Server A (9872) running on port ${PORT}`)
})
