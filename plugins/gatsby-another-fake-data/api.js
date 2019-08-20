const NODE_TYPE_A = `SyDemoData`;
const NODE_TYPE_B = `SyDemoDataVariant`;

const uuidMap = new Map();
uuidMap.set(NODE_TYPE_A, 0);
uuidMap.set(NODE_TYPE_B, 0);

const getNode = (data, {nodeType, prefix}, { createNodeId, createContentDigest }) => {
  const nodeContent = JSON.stringify(data)

  const meta = {
    id: createNodeId(`${prefix}-data-${data.uuid}`),
    parent: null,
    children: [],
    internal: {
      type: nodeType,
      content: nodeContent,
      contentDigest: createContentDigest(data),
    },
  }

  return Object.assign({}, data, meta)
}

function sync() {
  console.log('sync api');

}

function createNode({helpers, data = 'n/a', nodeType, uuid}) {
  if(typeof uuid === 'undefined') {
    throw new Error('Can\'t create node without uuid, given'+ uuid);
  }

  if(typeof nodeType === 'undefined') {
    throw new Error('Can\'t create node without nodeType, given'+ nodeType);
  }

  const newNode = getNode({
      updates: 0,
      data,
      uuid: uuid,
      title: `Hello World (${uuid})`,
      message: `lorem ipsum 💪`
    },
    { nodeType, prefix: nodeType},
    helpers
  );

  return newNode;
}

function createSamples({helpers, data = null, nodeType, count = 1}) {
  // const uuid = uuidMap.get(nodeType);
  let uuid = 0;
  console.log('createSamples for type', nodeType, uuid);

  let nodes = [];

  for(let i = 0; i < count; i++) {
    const newNode = createNode({
      helpers, uuid: uuid++, nodeType, data
    });

    nodes.push(newNode);
  }

  return nodes;
}

function ownsType(type) {
  return [NODE_TYPE_A, NODE_TYPE_B].includes(type);
}

module.exports = {
  sync,
  createSamples,
  createNode,
  ownsType,
  NODE_TYPE_A,
  NODE_TYPE_B
}