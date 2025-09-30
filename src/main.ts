import dotenv from 'dotenv'
import express from 'express'
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware'

import { configureInterceptor } from './interceptor'
import { ResponseInterceptor } from './utils/interceptor'
import { modifySetCookieMiddleware } from './utils/set-cookie-middleware'

dotenv.config()

const app = express()

const interceptor = new ResponseInterceptor()

configureInterceptor(interceptor)

// eslint-disable-next-line no-undef
const domain = process.env.DOMAIN

const proxy = createProxyMiddleware({
  target: 'https://www.kookapp.cn',
  changeOrigin: true,
  selfHandleResponse: true,
  on: {
    proxyRes: responseInterceptor(interceptor.intercept.bind(interceptor)),
  },
})

const staticProxy = createProxyMiddleware({
  target: 'https://static.kookapp.cn',
  changeOrigin: true,
  selfHandleResponse: true,
})

app.use('/mis', (req, res) => {
  res.send('Hello World')
})

app.use('/static', staticProxy)

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
      return cookie.replace(/Domain=kookapp\.cn/i, `Domain=${domain}`)
    },
  }),
  proxy
)

const PORT = 9872
app.listen(PORT, () => {
  console.log(`Server A (9872) running on port ${PORT}`)
})
