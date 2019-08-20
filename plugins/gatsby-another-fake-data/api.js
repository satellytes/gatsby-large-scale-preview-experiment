const NODE_TYPE = `SyDemoData`
let uuid = 0;

const getNode = (data, { createNodeId, createContentDigest }) => {
  const nodeContent = JSON.stringify(data)

  const meta = {
    id: createNodeId(`fake-data-${data.uuid}`),
    parent: null,
    children: [],
    internal: {
      type: NODE_TYPE,
      content: nodeContent,
      contentDigest: createContentDigest(data),
    },
  }

  return Object.assign({}, data, meta)
}


function createSamples({helpers, data = null}) {
  console.log('createSamples');
  // uuid++;

  const newNode = getNode(
    {
      updates: 0,
      data: data,
      uuid,
      title: `Hello World (${uuid})`,
      message: `lorem ipsum 💪`,
    },
    helpers
  );

  return [newNode];
}

module.exports = {
  createSamples,
  NODE_TYPE
}