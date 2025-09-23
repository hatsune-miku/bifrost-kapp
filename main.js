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
  onProxyRes: (proxyRes, req, res) => {
    // Handle set-cookie headers
    const setCookieHeader = proxyRes.headers['set-cookie']
    process.exit(0)
    if (setCookieHeader) {
      proxyRes.headers['set-cookie'] = setCookieHeader.map((cookie) => {
        return cookie
          .replace(/Domain=\.?kookapp\.cn/gi, 'Domain=localhost')
          .replace(/Secure;?/gi, '') // Remove Secure flag for localhost
          .replace(/SameSite=None/gi, 'SameSite=Lax') // Adjust SameSite for localhost
      })
    }
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
