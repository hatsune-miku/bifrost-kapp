const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const bodyParser = require('body-parser')

const app = express()

// Middleware to parse JSON only if Content-Type is application/json
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'application/json') {
    bodyParser.json()(req, res, next)
  } else {
    next()
  }
})

// Parse URL-encoded form data (e.g., HTML forms)
app.use(bodyParser.urlencoded({ extended: true }))

// Handle raw/text/binary data (optional)
app.use(
  bodyParser.raw({
    type: [
      'text/plain',
      'application/octet-stream',
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
    ],
  })
)

// Proxy configuration (same as before)
const proxy = createProxyMiddleware({
  target: 'https://www.kookapp.cn',
  changeOrigin: true,
  ws: true,
  onProxyReq: (proxyReq, req) => {
    proxyReq.write(req.body)

    // Forward body if it exists (works for JSON, form-data, etc.)
    // if (req.body && !Buffer.isBuffer(req.body) && !req.bodyAlreadyModified) {
    //   const bodyData = JSON.stringify(req.body)
    //   proxyReq.setHeader('Content-Type', 'application/json')
    //   proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
    //   proxyReq.write(bodyData)
    // } else if (Buffer.isBuffer(req.body)) {
    //   // Forward raw/binary data as-is
    //   proxyReq.write(req.body)
    // }
  },
})

// Intercept and modify /api/1 (same as before)
app.use('/api/v3/aaa/bbb', (req, res, next) => {
  console.log('Intercepted /api/v3/aaa/bbb request')
  if (req.body) {
    req.bodyAlreadyModified = true
  }
  next() // Forward to proxy
})

// Proxy all other requests
app.use('/', proxy)

// Start server
const PORT = 9872
app.listen(PORT, () => {
  console.log(`Server A (9872) running on port ${PORT}`)
})
