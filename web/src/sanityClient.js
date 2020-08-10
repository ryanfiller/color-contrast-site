import sanityClient from '@sanity/client'
import { api } from '../../studio/sanity.json'
const { projectId, dataset } = api

// const client = sanityClient({
//   projectId,
//   dataset,
//   // token: process.env.SANITY_TOKEN,
//   useCdn: true
// })

const client = (token = '') => sanityClient({
  projectId,
  dataset,
  token: token,
  useCdn: true
})

export default client
