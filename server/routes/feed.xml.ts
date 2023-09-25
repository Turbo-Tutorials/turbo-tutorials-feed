import RSS from 'rss';
import { getContentfulClient, enhanceContentfulItem } from "../../helpers"

export default defineEventHandler(async (event) => {

  const {
    public: { hostname },
  } = useRuntimeConfig();

  const feed = new RSS({
    title: 'Turbo Tutorials',
    generator: 'Turbo Tutorials',
    description: 'You can find short instructional videos at Turbo Tutorials that teach you the most common things in modern JavaScript and its meta frameworks.',
    site_url: `${hostname}/`,
    feed_url: `${hostname}/feed.xml`,
    image_url: 'https://res.cloudinary.com/dwfcofnrd/image/upload/w_1200,q_auto,f_auto/Turbo%20Tutorials/share-image.png',
    language: 'en',
    custom_namespaces: {
      'g': 'http://base.google.com/ns/1.0'
    },
  });

  const ctfClient = getContentfulClient();
  const tutorialData = await ctfClient.getEntries({
    content_type: "turboTutorial",
  });

  const tutorials = tutorialData.items.map((tut: any) => {
    const tutorial = enhanceContentfulItem(tut)
    return {
      url: `/tutorials/${tutorial.slug}`,
      title: tutorial.title,
      date: tutorial.publicationDate,
      description: tutorial.description,
      categories: tutorial.tags,
      complexity: tutorial.complexity,
      id: tutorial.videoId,
      image: tutorial.poster.src
    }
  })

  tutorials.forEach((tutorial: any) => {
    feed.item({
      title: tutorial.title ?? '-',
      url: `https://turbo-tutorials.dev${tutorial.url}/`,
      date: tutorial.publicationDate,
      description: tutorial.description,
      categories: tutorial.categories,
      author: 'Tim Benniks',
      custom_elements: [
        { 'g:id': tutorial.id },
        { 'g:image_link': tutorial.image },
        { 'g:price': 0 },
        { 'g:google_product_category': '5032' },
        { complexity: tutorial.complexity },
        { link: `https://turbo-tutorials.dev${tutorial.url}/` },
        { tags: tutorial.categories.toString() }
      ]
    });
  });

  const feedString = feed.xml({ indent: true });
  event.node.res.setHeader('content-type', 'text/xml');
  event.node.res.end(feedString);
});