import React from "react"
import { graphql, Link } from "gatsby"

function PreviewItem({ data: { item } }) {
  return (
    <div>
      <h1 data-testid="preview-item-title">{item.title}</h1>
      <h2>{item.updates}</h2>
      <div dangerouslySetInnerHTML={{ __html: item.message }} />
      <Link to="/">Back to home</Link>
    </div>
  )
}

export default PreviewItem

export const previewQuery = graphql`
  query PreviewItemBySlug($slug: String!) {
    item: fakeData(fields: { slug: { eq: $slug } }) {
      updates
      title
      message
    }
  }
`
