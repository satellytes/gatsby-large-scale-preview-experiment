const dotenv = require('dotenv');
dotenv.config();

exports.onCreateNode = function onCreateNode({ actions, node }) {
  console.log('onCreateNode', node.internal.type);
}

exports.createPagesStatefully = async function({reporter, emitter}) {
  console.log('---createPagesStatefully', typeof emitter);
}

exports.createPages = async function createPages({
  actions: { createPage }, reporter, graphql
}) {

  console.log('create pages');

  // const { data } = await graphql(`
  //   {
  //     allFakeData {
  //       nodes {
  //         title
  //         fields {
  //           slug
  //         }
  //       }
  //     }
  //   }
  // `)

  // const previewItemTemplate = path.resolve(`src/templates/preview-item.js`)

  // activity = reporter.activityTimer(`create pages`)
  // activity.start();


  // const totalPages = data.allFakeData.nodes.length;

  // data.allFakeData.nodes.forEach((node, index) => {
  //   const { fields: {slug}, title } = node;
  //   activity.setStatus(
  //     `Creating ${index + 1} of ${totalPages} total pages`
  //   );

  //   createPage({
  //     path: slug,
  //     component: previewItemTemplate,
  //     context: {
  //       slug, title
  //     },
  //   })
  // });

  // activity.end();

}
