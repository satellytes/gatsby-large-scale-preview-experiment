// const api = require(`./api`)
const api = require('./api');

exports.onCreateNode = function onCreateNode({ actions, node }) {
  if(node.internal.type === api.NODE_TYPE) {
    console.log('xxx--- onCreateNode', node.internal.type);
  }
}

let firstExec = true;

exports.sourceNodes = async function sourceNodes({
  actions,
  createNodeId,
  createContentDigest,
  getNode,
  reporter,
  webhookBody,
}) {
  console.log('****samples: source nodes');
  const { createNode, deleteNode } = actions

  const helpers = {
    createNodeId,
    createContentDigest,
  }

  if (webhookBody && webhookBody.cmd) {
    console.log('debug webhook command:', webhookBody.cmd);
    let data = null;

    if(webhookBody.cmd === 'd1') {

    }

    data = webhookBody.cmd;

    const nodes = await api.createSamples({helpers, data});
    nodes.forEach(node => createNode(node));

  }else {


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
