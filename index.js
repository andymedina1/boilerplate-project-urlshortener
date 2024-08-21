require('dotenv').config()
const express = require('express')
const dns = require('node:dns')
const cors = require('cors')
const app = express()

const port = process.env.PORT || 3000

app.use(cors())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/public', express.static(`${process.cwd()}/public`))

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

const storage = []

function validateUrl (inputUrl) {
  return new Promise((resolve) => {
    try {
      const hostname = new URL(inputUrl).hostname
      dns.lookup(hostname, (err) => {
        if (err) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    } catch (e) {
      resolve(false)
    }
  })
}

app.post('/api/shorturl', async (req, res) => {
  const { url: input } = req.body

  if (!await validateUrl(input)) {
    return res.json({ error: 'invalid url' })
  }

  const id = storage.push(input) - 1

  res.json({ original_url: input, short_url: id })
})

app.get('/api/shorturl/:id', (req, res) => {
  const input = req.params.id
  const newUrl = storage[input]
  res.redirect(newUrl)
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})
