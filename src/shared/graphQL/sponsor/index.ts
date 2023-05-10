import { gql } from "@apollo/client";

const GET_SPONSORS = gql`
  {
    allSponsors(page: 0) {
      id
      name
      email
      walletAddress
      status
      planName
      tvl
      createdAt
    }
  }
`;
export { GET_SPONSORS };
