import React from "react";
import { Link, graphql } from "gatsby";

const IndexPage = ({ data }) => (
  <div>
    hello index

    Total of {data.allSitePage.nodes.length} pages, see the last 10.
    <ul>
    {data.allSitePage.nodes.slice(-10).map(({ id, path, context }) => {
      return (
        <li key={id}>
          <Link to={path}>{`${context.title}`})</Link>
        </li>
      )})}
    </ul>
  </div>
)

export default (IndexPage)
export const indexQuery = graphql`
  {
    allSitePage(filter: {context: {mypage: {eq: true}}}) {
      nodes {
        id,
        componentPath
        path
        componentChunkName,
        context {
          title
        }
      }
    }
  }
`