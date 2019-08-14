# Gatsby & Preview in a large scale environment.

We are working on a rather large Gatsby Installation with an expected set of 50k to 100k pages derived single internal node type.
A full build will be triggered from time to time and we are already excited to learn about the future incremental build feature.

That being said, our current challenge is related to serving a preview — not the actual build. To be prepared for the technical challenges, we dug through many package sources including the core of Gatsby itself and we read all of the excellent documentation about the "Gatsby Internals". Kudos for that awesome summary! Things are still not 100% clear but the image is already starting to build up.

We already achieved a working prototype by using the `__refresh` endpoint activated by `ENABLE_GATSBY_REFRESH_ENDPOINT`. This was a really nice experience,
how Gatsby handled any webhook callback (empty) and rebuild everything. It got interesting when we scaled things up. We tried to build 5000 pages and it took many minutes. I save you the details of that installation but this brought us back to plan things more thoroughly. This experiment is the summary of our actions.

It's based on the preview/webhook parts of gatsby's e2e [test project](https://github.com/gatsbyjs/gatsby/tree/master/e2e-tests/development-runtime) (via @DSchau).

The core question to answer:
> How can we add/update/delete pages for specific nodes to achieve a good update performance in preview mode, even in a project with tens of thousands of pages.

**The motivation:**<br>
Handle a large amount of pages (~ 50k-100k) being created from nodes during bootstrap and selectively update/add/delete a few during runtime by calling the `/__refresh` endpoint and passing the ids of pages to update.
We are aware that we have to write our own source plugins but we are searching for the best lifecycle combination to achieve our goal.

**Current experiment status:**<br>
Currently `createPages` always runs over ALL nodes whenever the webhook is triggered. It's not happening with `createPagesStatefully` as described in the docs but we are unsure how to handle added nodes to create our pages. Is `onCreateNode` the solution, the right place to use `createPage({})`? Are delete and updated nodes handled automatically by Gatsby and we are fine?

Even when we use `createPagesStatefully`, calling the refresh endpoint causes the page queries of all pages to be re-evaluated. In our case this means that even when we update only a single page, our backend is hit by tens of thousands of requests.
This seems to happen before `onCreateNode` is called, so we currently don't see any way to avoid this and only run the relevant page queries. 

The following lifecycle hooks or methods seem to be part of the final solution:
+ sourceNodes
+ onCreateNode
+ createPages
+ createPagesStatefully
+ createPageDependency (helper)

---
Here details of the story:

## Goal
We want to check how Gatsby behaves with thousands of pages in develop mode + preview/webhook mode enabled (via ENABLE_GATSBY_REFRESH_ENDPOINT) as we have observed pretty slow updates and we don't know if this is a problem with the source plugins, our gatsby lifecycle hook implementations or a limitation inside Gatsby's development server itself.

## Changes to the e2e base project
`plugins/gatsby-source-fake-data` was copied from the e2e project and modified slightly to initially create a large amount of nodes and update a few later. Those are the changes:

+ Provide method `hugeInitialSync` in api.js to allow the creation of an initial large set of nodes (given by ENABLE_GATSBY_REFRESH_ENDPOINT). That way we simulate the first api call to retrieve all data.
+ The `api.sync` method is modified to not update all nodes. It's main task is to add a single node only — triggered with `yarn update:preview` which calls the __refresh endpoint with no payload.

We also removed most of the stuff from `gatsby-node.js` to focus on the page creation:
+ We added an activity status for the page creation. That way we can quickly see that Gatsby spends a long time just iterating over all nodes whenever that lifecycle hooks is called.

## The problem
Problem I want to show/tackle with this experiment.
The terminal windows shows the execution of the following commands:

```bash
# 01 start gatsby dev server (preview is active see .env file)
#    this will create 1000 nodes and derived pages
INITIAL_NODES_TO_CREATE=1000 yarn develop

# 02 do a full sync (add one node, touch all existing)
yarn webhook:full-sync

# 03 trigger an empty webhook call multiple times
#    this will cause the pages to be recreated at some point
yarn webhook:webhook-empty
yarn webhook:webhook-empty
yarn webhook:webhook-empty

# 04 create a new item by providing the data through the webhook
yarn webhook:new-item
```

![](docs/bash.gif)

The activity timer for "create-pages" clearly shows, that gatsby spends quite some time iterating over all nodes inside the `createPages` lifecycle. We use the following query to retrieve the data.

```
const { data } = await graphql(`
  {
    allFakeData {
      nodes {
        fields {
          slug
        }
      }
    }
  }
`);
```
and we iterate over all nodes whenever createPages is called.

```
const totalPages = data.allFakeData.nodes.length;

data.allFakeData.nodes.forEach((node, index) => {
  activity.setStatus(
    `Creating ${index + 1} of ${totalPages} total pages`
  );
  //...
```

That's the moment where we output the progress activity `create-pages Ns — Creating XXX pages of YYY total pages`. You can see it counting upwards in the left panel in the gif whenever we trigger some changes.


Imagine a set of 100.000 pages — well or try it with 10.000 nodes

```
 INITIAL_NODES_TO_CREATE=10000 yarn develop
```

On my machine this will take roughly 10s for the `createPages` lifecycle hook part and 40s for the queries (260 queries/second) when being started the first time (bootstrap phase). That's expected and fine.

After that an update with `yarn webhook:new-item`, which adds a node through the webhook payload, it takes 15s for `createPages` to run, although nothing was touched. There was only a node added. The same happens with ` yarn webhook:empty`. Nothing has changed, but Gatsby in Preview Mode will run all `sourceNodes` hooks through the api runner followed by the `createPages` lifecycle. That's somehow expected behaviour: createPages runs through all pages, because that's what we tell Gatsby to do in [gatsby-node.js](gatsby-node.js).

The question is:
> How can we add pages for new nodes only after the initial bootstrap.

We already discovered [createPagesStatefully](https://www.gatsbyjs.org/docs/node-apis/#createPagesStatefully) which does somehow help in this scenario. The docs tell us this:

> createPagesStatefully..for plugins who want to manage creating and removing pages themselves in response to changes in data not managed by Gatsby. Plugins implementing createPages will get called regularly to recompute page information as Gatsby’s data changes but those implementing createPagesStatefully will not.

And indeed, it's called only once. So this would be fine for the bootstrap but where to add new pages? Where to call `createPage({})`? The idiomatic idea: Run `createPage` inside our `sourceNodes` which seems to be a very wrong place in the lifecycle as Gatsby doesn't give us access to the boundActionCreators with the createPage method.

What about `onCreateNode` ? This could work:

```javascript
exports.onCreateNode = function onCreateNode({ actions, node, boundActionCreators }) {
  cosnt { createPage } = boundActionCreators;
  // createPage is available here
}
```

Is this the place to work in or does it make no sense? A quick test showed all initial pages being created but a webhook update through __refresh destroyed all pages. Probably because the nodes weren't touched?

Is this the way to go? `createPage` inside `onCreateNode`?
Do we need `createPageDependency` at any place or is this managed internally by Gatsby depending of the queries being run in the used page template?
How can we avoid the page queries for all pages to be re-evaluated, causing a large amount of unnecessary requests to the backend?
