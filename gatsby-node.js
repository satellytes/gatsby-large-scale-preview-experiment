const path = require('path');
const dotenv = require('dotenv');


let createPagesStatefullyRAN = false;
dotenv.config();

const apiFakeData = require('./plugins/gatsby-another-fake-data/api');

const previewItemTemplateA = path.resolve(`src/templates/preview-item-a.js`)
const previewItemTemplateB = path.resolve(`src/templates/preview-item-b.js`)


exports.onCreateNode = function onCreateNode({ actions, node, store }) {
  const {createPage} = actions;
  const state = store.getState();

  if(createPagesStatefullyRAN) {
    console.log('node');
  }

  if(createPagesStatefullyRAN && apiFakeData.ownsType(node.internal.type)) {
    console.log(node.internal.type, store);

    if(node.internal.type === apiFakeData.NODE_TYPE_B) {
      console.log('found new node of interest -- type a. creating a page');

      const { fields: {slug}, title } = node;
      console.log({slug, title});

      createPage({
        path: slug,
        component: previewItemTemplateA,
        context: {
          slug, title, mypage: true
        }
      })

      // getNodeAndSavePathDependency(node.id, slug);


      // createPage({
      //   path: slug,
      //   component: previewItemTemplateA,
      //   context: {
      //     slug, title, mypage: true
      //   }
      // })
    }
  }
}


exports.onPreExtractQueries = function() {
  console.log('onPreExtractQueries');
}

exports.createPagesStatefully = async function createPages({
  actions: { createPage }, reporter, graphql
}) {

  createPagesStatefullyRAN = true;

  console.log('create createPagesStatefully');

  const { data } = await graphql(`
    {
      allSyDemoDataVariant {
        nodes {
          uuid
          title
          fields { slug }
        }
      }

      allSyDemoData {
        nodes {
          uuid
          title
          fields { slug }
        }
      }
    }
  `)



  // activity = reporter.activityTimer(`create pages`)
  // activity.start();

  // const totalPages = data.allFakeData.nodes.length;

  data.allSyDemoData.nodes.forEach((node) => {
    const { fields: {slug}, title } = node;

    createPage({
      path: slug,
      component: previewItemTemplateA,
      context: {
        slug, title, mypage: true
      }
    })
  });

  data.allSyDemoDataVariant.nodes.forEach((node) => {
    const { fields: {slug}, title } = node;

    createPage({
      path: slug,
      component: previewItemTemplateB,
      context: {
        slug, title, mypage: true
      }
    })
  });
}
