import gql from "graphql-tag";

const LOGIN_ADMIN = gql`
  mutation signIn($input: LoginDto!) {
    signIn(loginDto: $input) {
      jwtToken
    }
  }
`;

const CREATE_SUBSCRIPTION = gql`
  mutation CreatePlan($input: CreatePlanDto!) {
    CreatePlan(createPlanInput: $input) {
      _id
      name
      description
      contract_address
      nft_media_url
      plan_image
      stripe_product_id
      default_price {
        price
        recurring
        renewal_period
        renewal_number
        supportable_product_count
        stripe_price_id
      }
    }
  }
`;

const GENERATE_PRESIGNED_URL = gql`
  mutation GeneratePresignedUrl($input: SignedUrlDto!) {
    GeneratePresignedUrl(signedUrlDto: $input) {
      presignedUrl
    }
  }
`;

export { LOGIN_ADMIN, CREATE_SUBSCRIPTION, GENERATE_PRESIGNED_URL };
