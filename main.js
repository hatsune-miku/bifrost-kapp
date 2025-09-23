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
  },
  modifySetCookieMiddleware({
    transform: (cookie) => {
      // Custom transformation logic
      console.log('xx', 'Transforming cookie', cookie)
      return cookie
        .replace(/Domain=kookapp\.cn/i, 'Domain=localhost')
        .replace(/Secure/i, '')
        .replace(/SameSite=None/i, 'SameSite=Lax')
    },
  }),
  proxy
)

const PORT = 9872
app.listen(PORT, () => {
  console.log(`Server A (9872) running on port ${PORT}`)
})

function modifySetCookieMiddleware(options = {}) {
  return function (req, res, next) {
    const originalSetHeader = res.setHeader

    // Override setHeader to intercept Set-Cookie headers
    res.setHeader = function (name, value) {
      if (name.toLowerCase() === 'set-cookie') {
        let cookies = Array.isArray(value) ? value : [value]

        // Modify cookies as needed
        cookies = cookies.map((cookie) => {
          // Example modifications:
          // 1. Add Secure flag if not present
          if (!cookie.includes('Secure') && options.forceSecure) {
            cookie += '; Secure'
          }

          // 2. Add SameSite attribute if not present
          if (!cookie.includes('SameSite') && options.sameSite) {
            cookie += `; SameSite=${options.sameSite}`
          }

          // 3. Add domain if specified
          if (options.domain && !cookie.includes('Domain=')) {
            cookie += `; Domain=${options.domain}`
          }

          // 4. Modify specific cookie values
          if (options.transform) {
            cookie = options.transform(cookie)
          }

          return cookie
        })

        return originalSetHeader.call(this, name, cookies)
      }

      return originalSetHeader.apply(this, arguments)
    }

    next()
  }
}
