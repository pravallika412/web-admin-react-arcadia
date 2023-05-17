import { gql } from "@apollo/client";

const GET_SPONSORS = gql`
  query GetSponsorListByBrand($input1: PageDto!, $input2: SortDto!, $input3: SponsorPlanFilterDto!) {
    GetSponsorListByBrand(getSponsorListPageDto: $input1, getSponsorListSortDto: $input2, filterDto: $input3) {
      subscribedSponsors {
        _id
        sponsor {
          _id
          email
          name
          profile_picture
          walletAddress
          createdAt
          tvl
        }
        subscription_end_date
        status
        planDetails {
          _id
          name
        }
      }
      totalCount
    }
  }
`;
export { GET_SPONSORS };
