import React from "react"
import { graphql, Link } from "gatsby"

function PreviewItem({ data: { item } }) {
  return (
    <div>
      bbb
      <br/>
      data: {item.data}
      <h1 data-testid="preview-item-title">{item.title}</h1>
      <h2>{item.updates}</h2>
      <div dangerouslySetInnerHTML={{ __html: item.message }} />
      <Link to="/">Back to home</Link>
    </div>
  )
}

export default PreviewItem

export const previewQuery = graphql`
  query PreviewItemBBySlug($slug: String!) {
    item: syDemoDataVariant(fields: { slug: { eq: $slug } }) {
      data
      updates
      title
      message
    }
  }
`
