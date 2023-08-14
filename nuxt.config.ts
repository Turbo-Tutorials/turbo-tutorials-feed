// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      contentfulSpaceId: process.env.CONTENTFUL_SPACE_ID,
      contentfulDeliveryApiKey: process.env.CONTENTFUL_DELIVERY_API_KEY,
      contentfulEnvironment: process.env.CONTENTFUL_ENVIRONMENT,
      hostname: "https://turbo-tutorials-feed.netlify.app"
    },
  },
})
