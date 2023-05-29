import gql from "graphql-tag";

const REVIEW_POST = gql`
  mutation reviewPost($input: ReviewPostDto!) {
    reviewPost(reviewPostDto: $input) {
      success
      message
      gasFees
      transaction_hash
    }
  }
`;

const GET_FEED = gql`
  query listFeeds($input: FilterDto!) {
    listFeeds(listFeedDto: $input) {
      feeds {
        _id
        caption
        post_gallery {
          url
          mime_type
        }
        session_start
        session_end
        comment_count
        product
        handler
        status
        signature
        admin_feedback
        createdAt
        updatedAt
        handlerData {
          id
          name
          createdAt
        }
        productData {
          name
          image
        }
      }
      totalCount
    }
  }
`;

const GET_POST_COUNT = gql`
  query {
    GetPostCounts {
      totalPosts
      approvedPosts
      pendingPosts
      rejectedPosts
    }
  }
`;

export { REVIEW_POST, GET_FEED, GET_POST_COUNT };
