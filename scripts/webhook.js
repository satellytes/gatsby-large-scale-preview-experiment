require(`isomorphic-fetch`)

fetch(`http://localhost:8000/__refresh`, {
  method: `POST`,
  headers: {
    "Content-Type": `application/json`,
  },
  body: JSON.stringify({
    items: [
      {
        updates: 0,
        uuid: 1234567,
        title: `Hello World from a Webhook (111)`,
        message: `testing`,
      },
    ],
  }),
})
