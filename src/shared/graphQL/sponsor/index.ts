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

const GET_SPONSORS_PRODUCT_DETAILS = gql`
  query SponsorProducts($input: SponsorSubscriptionDto!, $input1: PageDto!, $input2: Filter!, $input3: SearchDto!) {
    SponsorProducts(sponsorSubscriptionDto: $input, pageDto: $input1, filterDto: $input2, searchDto: $input3) {
      products {
        _id
        sponsor
        brand
        product_collection_name
        products
        sponsor_products_count
      }
      totalCount
    }
  }
`;

const GET_SPONSORS_STRIPE_DETAILS = gql`
  query SponsorStripeTransactionList($input1: PageDto!, $input2: TransactionFilterDto!) {
    SponsorStripeTransactionList(pageDto: $input1, filterDto: $input2) {
      transactions {
        _id
        sponsor
        brand
        plan
        amount_paid
        currency
        payment_status
        subscription_status
        logs {
          paymentIntent
        }
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

const GET_SPONSORS_CRYPTO_DETAILS = gql`
  query SponsorCryptoTransactionList($input1: PageDto!, $input2: TransactionFilterDto!) {
    SponsorCryptoTransactionList(pageDto: $input1, filterDto: $input2) {
      transactions {
        _id
        sponsor
        brand
        plan
        amount_paid
        currency
        payment_status
        subscription_status
        transaction_hash
        logs
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export { GET_SPONSORS, GET_SPONSORS_DETAILS, GET_SPONSORS_PRODUCT_DETAILS, GET_SPONSORS_STRIPE_DETAILS, GET_SPONSORS_CRYPTO_DETAILS };
