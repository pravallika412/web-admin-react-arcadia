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

const GET_SPONSORS_DETAILS = gql`
  query GetSponsorSubscriptionDetails($input: SponsorSubscriptionDto!) {
    GetSponsorSubscriptionDetails(sponsorSubscriptionDto: $input) {
      _id
      sponsor {
        _id
        email
        name
        profile_picture
        walletAddress
        status
        tvl
        device_id
        stripe_customer_id
        createdAt
        updatedAt
      }
      subscription_start_date
      subscription_end_date
      status
      planDetails {
        _id
        name
      }
    }
  }
`;

export { GET_SPONSORS, GET_SPONSORS_DETAILS };
