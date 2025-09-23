const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const bodyParser = require('body-parser')

const app = express()

const proxy = createProxyMiddleware({
  target: 'https://www.kookapp.cn',
  logLevel: 'debug',
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    console.log('xx', 'Proxy request', req.body)
  },
})

app.use(
  '/',
  (req, res, next) => {
    console.log('xx', 'Intercepted request', req.url)
    req.url = req.url.replace('/kookapp', '')
    req.headers.host = 'www.kookapp.cn'
    req.headers.referer = 'https://www.kookapp.cn'

    const setCookie = req.headers['set-cookie']
    if (setCookie) {
      req.headers['set-cookie'] = setCookie.map((cookie) => {
        return cookie
          .replace(/Domain=kookapp.cn/i, 'Domain=localhost')
          .replace(/Secure/i, '')
          .replace(/SameSite=None/i, 'SameSite=Lax')
      })
    }
    next()
  },
  proxy
)

app.use(bodyParser.json())

const PORT = 9872
app.listen(PORT, () => {
  console.log(`Server A (9872) running on port ${PORT}`)
})
