import dotenv from 'dotenv'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

import { modifySetCookieMiddleware } from './utils/set-cookie-middleware'

dotenv.config()

const app = express()

// eslint-disable-next-line no-undef
const domain = process.env.DOMAIN

const proxy = createProxyMiddleware({
  target: 'https://www.kookapp.cn',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      console.log('xx', 'Proxy request', req.url)
    },
    proxyRes: (proxyRes, req, res) => {
      console.log('xx', 'Proxy response', proxyRes.headers)
    },
  },
})

app.use('/mis', (req, res) => {
  res.send('Hello World')
})

app.use(
  '/',
  (req, res, next) => {
    req.url = req.url.replace('/kookapp', '')
    req.headers.host = 'www.kookapp.cn'
    req.headers.referer = 'https://www.kookapp.cn'
    next()
  },
  modifySetCookieMiddleware({
    transform: (cookie) => {
      // Custom transformation logic
      console.log('xx', 'Transforming cookie', cookie)
      return cookie.replace(/Domain=kookapp\.cn/i, `Domain=${domain}`)
    },
  }),
  proxy
)

const PORT = 9872
app.listen(PORT, () => {
  console.log(`Server A (9872) running on port ${PORT}`)
})
