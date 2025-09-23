const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const bodyParser = require('body-parser')

const app = express()

const proxy = createProxyMiddleware({
  target: 'https://www.kookapp.cn',
  logLevel: 'debug',
  changeOrigin: true,
  ws: true,
  cookieDomainRewrite: {
    'www.kookapp.cn': 'localhost',
    '.kookapp.cn': 'localhost',
  },
  cookiePathRewrite: {
    '/': '/',
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('🚀 Proxy request:', req.method, req.url, '-> Target:', proxyReq.path)
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('✅ Proxy response:', proxyRes.statusCode, req.url)
    const setCookieHeader = proxyRes.headers['set-cookie']
    if (setCookieHeader) {
      console.log('🍪 Original cookies:', setCookieHeader)
      proxyRes.headers['set-cookie'] = setCookieHeader.map((cookie) => {
        return cookie
          .replace(/Domain=\.?kookapp\.cn/gi, 'Domain=localhost')
          .replace(/Secure;?/gi, '') // Remove Secure flag for localhost
          .replace(/SameSite=None/gi, 'SameSite=Lax') // Adjust SameSite for localhost
      })
      console.log('🍪 Modified cookies:', proxyRes.headers['set-cookie'])
    }
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err.message)
  },
})

app.use(
  '/',
  (req, res, next) => {
    console.log('xx', 'Intercepted request', req.url)
    req.url = req.url.replace('/kookapp', '')
    req.headers.host = 'www.kookapp.cn'
    req.headers.referer = 'https://www.kookapp.cn'
    next()
  },
  proxy
)

const PORT = 9872
app.listen(PORT, () => {
  console.log(`Server A (9872) running on port ${PORT}`)
})
