import gql from "graphql-tag";

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

const GET_PLANS = gql`
  query {
    GetPlans {
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

const GET_PLAN = gql`
  query GetPlan($input: GetPlanDto!) {
    GetPlan(planInput: $input) {
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

const UPDATE_PLAN = gql`
  mutation UpdatePlan($input: UpdatePlanDto!) {
    UpdatePlan(updatePlanDto: $input) {
      status
      message
    }
  }
`;
export { CREATE_SUBSCRIPTION, GET_PLANS, GET_PLAN, UPDATE_PLAN };