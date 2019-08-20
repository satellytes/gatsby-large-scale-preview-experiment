// const api = require(`./api`)
const api = require('./api');

exports.onCreateNode = function onCreateNode({ actions, node }) {
  if(api.ownsType(node.internal.type)) {
    if(node.internal.type === api.NODE_TYPE_A) {
      actions.createNodeField({
        name: `slug`,
        value: `/test-a/${node.uuid}`,
        node,
      })
    }else {
      actions.createNodeField({
        name: `slug`,
        value: `/test-b/${node.uuid}`,
        node,
      })
    }

  }
}

let firstExec = true;

exports.sourceNodes = async function sourceNodes({
  actions,
  createNodeId,
  createContentDigest,
  getNode,
  getNodes,
  getNodesByType,
  reporter,
  webhookBody,
}) {
  console.log('****samples: source nodes');
  const { createNode, deleteNode } = actions

  const helpers = {
    createNodeId,
    createContentDigest,
    getNode,
    getNodes,
    getNodesByType
  }

  if (webhookBody && webhookBody.cmd) {
    console.log('debug webhook command:', webhookBody.cmd);

    switch(webhookBody.cmd) {
      case 'sync': api.sync({helpers}); break;
      case 'd3':
        console.log('update only a single node (type A')
        // update only a single node (type A)
        const nodesA = await api.createSamples({helpers, data: 'only a single update on a', nodeType: api.NODE_TYPE_A});
        nodesA.forEach(node => createNode(node));
        break;
      case 'd4':
        console.log('update only a single node (type B')
        // update only a single node (type A)
        const nodesB = await api.createSamples({helpers, data: 'only a single update on b', nodeType: api.NODE_TYPE_B});
        nodesB.forEach(node => createNode(node));
        break;
      case 'd5':
        console.log('update only a single node (type B')
        // update only a single node (type A)
        const newNode = await api.createNode({helpers, data: 'a fresh new b page', nodeType: api.NODE_TYPE_B, uuid: 9999});
        createNode(newNode);

        break;
      default:
        updateNodesAB({data: webhookBody.cmd, helpers});
    }
  } else {
    // empty/startup/initial
    updateNodesAB({data: 'initial', helpers})
  }

async function updateNodesAB({data, helpers}) {
  console.log('a')
  const nodesA = await api.createSamples({helpers, data, nodeType: api.NODE_TYPE_A, count: 3});
  nodesA.forEach(node => createNode(node));

  console.log('b')
  const nodesB = await api.createSamples({helpers, data, nodeType: api.NODE_TYPE_B, count: 3});
  nodesB.forEach(node => createNode(node));
}

console.log('done with samples');

  // if(firstExec) {
  //   firstExec = false;
  //   // create initial large source set on first sourceSodes run
  //   // during a preview (ENABLE_GATSBY_REFRESH_ENDPOINT is true)
  //   // we either handle the webhook payload or make an "api sync"
  //   // where a new node is created
  //   reporter.info(`Create large source set`);
  //   const count = process.env.INITIAL_NODES_TO_CREATE || 1000
  //   const nodes = await api.hugeInitialSync({count, helpers });
  //   nodes.forEach(node => createNode(node))
  //   return;
  // }

  // if (webhookBody && webhookBody.items) {
  //   reporter.info(`__refresh call with webhook payload detected; updating given nodes (webhookBody.items)`)
  //   webhookBody.items.forEach(node => createNode(api.getNode(node, helpers)))
  // } else if(webhookBody && webhookBody.touchAll) {
  //   reporter.info(`__refresh call with touchAll flag detected; touching all nodes and add one`)
  //   const [updated, deleted = []] = await api.sync({helpers, updateAllNodes: true})

  //   updated.forEach(node => createNode(node))
  //   deleted.forEach(node => {
  //     const existing = getNode(node.id)
  //     if (existing) {
  //       deleteNode({
  //         node: existing,
  //       })
  //     }
  //   })
  // } else {
  //   reporter.info(`__refresh call, no payload; ignore`)
  // }
}
