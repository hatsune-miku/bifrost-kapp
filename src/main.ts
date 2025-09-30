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
  on: {
    proxyReq: (proxyReq, req, res) => {
      const headers = new Map()
      const obj = {
        'cache-control': 'no-cache',
        'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'sec-fetch-site': 'none',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        'sec-fetch-dest': 'document',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6',
        referer: 'https://www.kookapp.cn',
      }
      Object.entries(obj).forEach(([key, value]) => {
        headers.set(key, value)
      })
      proxyReq.setHeaders(headers)
      // req.headers['authority'] = 'static.kookapp.cn'
      // req.headers['host'] = 'www.kookapp.cn'
      // req.headers['referer'] = 'https://www.kookapp.cn'
      // req.headers['sec-ch-ua'] = '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"'
      // req.headers['sec-ch-ua-mobile'] = '?0'
      // req.headers['sec-ch-ua-platform'] = '"Windows"'
      // req.headers['user-agent'] =
      //   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
      // req.headers['accept'] = '*/*'
      // req.headers['accept-encoding'] = 'gzip, deflate, br, zstd'
      // req.headers['accept-language'] = 'en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6'
      // req.headers['cache-control'] = 'no-cache'
      // req.headers['pragma'] = 'no-cache'
      // req.headers['priority'] = 'u=2'
      // req.headers['sec-fetch-dest'] = 'script'
      // req.headers['sec-fetch-mode'] = 'no-cors'
      // req.headers['sec-fetch-site'] = 'same-site'
      console.log('xx', 'e', req.headers)
    },
    proxyRes: (proxyRes, req, res) => {
      console.log('xx', 'proxyRes', proxyRes.statusCode, proxyRes.headers)
    },
  },
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
