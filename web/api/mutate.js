require('dotenv').config()
const sanityClient = require('@sanity/client')
const client = sanityClient({
  projectId: process.env.SANITY_ID,
  dataset: 'production',
  token: process.env.SANITY_TOKEN
})

exports.handler = async function(event, _context, callback) {
  const payload = JSON.parse(event.body)
  const result = await client.mutate(payload)
  callback(null, {
    statusCode: 200,
    body: JSON.stringify(result)
  })
}