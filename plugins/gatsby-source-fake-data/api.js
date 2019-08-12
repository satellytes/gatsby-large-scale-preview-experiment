const fs = require(`fs`)
const util = require(`util`)
const path = require(`path`)

const NODE_TYPE = `FakeData`

const readFile = file =>
  util
    .promisify(fs.readFile)(file, `utf8`)
    .then(contents => JSON.parse(contents))
    .catch(() => [])

const writeFile = (file, contents) =>
  util
    .promisify(fs.writeFile)(file, JSON.stringify(contents), `utf8`)
    .catch(() => null)

const difference = (updated, existing) => {
  const lookup = updated.reduce((merged, node) => {
    merged[node.uuid] = node
    return merged
  }, {})
  return existing.filter(node => !lookup[node.uuid])
}



function createMultipleNodes({uuidStart, count, helpers}) {
  const nodes = [];
  for(let i = 0; i<count; i++) {
    const node = getNode(
      {
        updates: 0,
        uuid: uuidStart + i,
        title: `Hello World (${uuidStart + i})`,
        message: `lorem ipsum 💪
      `.trim(),
      },
      helpers
    );

    nodes.push(node);
  }

  return nodes;
}

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

const max = nodes =>
  nodes.reduce((maxValue, node) => {
    if (node.uuid > maxValue) {
      return node.uuid
    }
    return maxValue
  }, 0)

module.exports = {
  dbFilePath: path.join(__dirname, `db.json`),
  nodeType: NODE_TYPE,
  nodes: [],
  createMultipleNodes,
  async hugeInitialSync({count, helpers}) {
    const nodes = createMultipleNodes({uuidStart: 0, count, helpers});
    await writeFile(this.dbFilePath, nodes, `utf8`);
    return nodes;
  },
  async sync({helpers, updateAllNodes = false}) {
    // empty array
    const existing = await readFile(this.dbFilePath)

    // 01 always create new node in the full sync example
    const uuid = max(existing) + 1
    const newNode = getNode(
      {
        updates: 0,
        uuid,
        title: `Hello World (${uuid})`,
        message: `lorem ipsum 💪
      `.trim(),
      },
      helpers
    );

    let updated = [newNode];
    let touched = [];

    if(updateAllNodes) {
      touched = (existing
        .map(node =>
          getNode(
            Object.assign({}, node, {
              updates: node.updates + 1,
            }),
            helpers
          )
        ))
    }

    // merge the touched nodes to prevent their deletion.
    updated = [...touched, ...updated];

    await writeFile(this.dbFilePath, updated, `utf8`)

    return [updated, difference(updated, existing)]
  },
  async reset() {
    return writeFile(this.dbFilePath, [])
  },
}

module.exports.getNode = getNode
