import sanityClient from '@sanity/client'
import { api } from '../../studio/sanity.json'
const { projectId, dataset } = api

const client = sanityClient({
  projectId,
  dataset,
  // token: process.env.SANITY_TOKEN,
  useCdn: true
})

export default client
