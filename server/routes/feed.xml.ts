import RSS from 'rss';
import { request, gql } from "graphql-request";

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

  const query = gql`
    query TurboTutorials {
      turboTutorials {
        id
        slug
        title
        publicationDate
        description
        githubLink
        complexity
        videoId
        poster {
          fileName
          url
        }
        tags {
          name
        }
        transcript
      }
    }`

  const tutorialData: any = await request('https://eu-central-1-shared-euc1-02.cdn.hygraph.com/content/clifk2kla052e01ui88kyhe0c/master', query);

  const tutorials = tutorialData.turboTutorials.map((tut: any) => {
    return {
      id: tut.videoId,
      url: `/tutorials/${tut.slug}`,
      title: tut.title,
      date: tut.publicationDate,
      description: tut.description,
      categories: tut.tags.map((tag: any) => { return tag.name }),
      complexity: tut.complexity,
      transcript: tut.transcript,
      image: tut.poster.url
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
        { tags: tutorial.categories.toString() },
        { transcript: tutorial.transcript },
        { githublink: tutorial.githubLink },
      ]
    });
  });

  const feedString = feed.xml({ indent: true });
  event.node.res.setHeader('content-type', 'text/xml');
  event.node.res.end(feedString);
});