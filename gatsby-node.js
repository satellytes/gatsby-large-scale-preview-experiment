const dotenv = require('dotenv');
dotenv.config();

const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = function onCreateNode({ actions, node, boundActionCreators }) {
  // const { createPage } = boundActionCreators;

  // if (node.internal.type === `FakeData`) {
  //   console.log('create new page');

  //   const previewItemTemplate = path.resolve(`src/templates/preview-item.js`)

  //   createPage({
  //     path: node.fields.slug,
  //     component: previewItemTemplate,
  //     context: {
  //       slug: node.fields.slug, title: node.title
  //     },
  //   })
  // }
}


exports.createPages = async function createPages({
  actions: { createPage }, reporter, graphql
}) {
  const { data } = await graphql(`
    {
      allFakeData {
        nodes {
          title
          fields {
            slug
          }
        }
      }
    }
  `)

  const previewItemTemplate = path.resolve(`src/templates/preview-item.js`)

  activity = reporter.activityTimer(`create pages`)
  activity.start();

  const totalPages = data.allFakeData.nodes.length;
  console.log('createPages', totalPages)

  data.allFakeData.nodes.forEach((node, index) => {
    const { fields: {slug}, title } = node;
    // activity.setStatus(
    //   `Creating ${index + 1} of ${totalPages} total pages`
    // );

    createPage({
      path: slug,
      component: previewItemTemplate,
      context: {
        slug, title
      },
    })
  });

  activity.end();

}
