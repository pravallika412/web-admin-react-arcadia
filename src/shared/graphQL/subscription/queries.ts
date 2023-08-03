import gql from "graphql-tag";

const CREATE_SUBSCRIPTION = gql`
  mutation CreatePlan($input: CreatePlanDto!) {
    CreatePlan(createPlanInput: $input) {
      _id
      name
      description
      plan_image
      stripe_product_id
      default_price {
        price
        recurring
        renewal_period
        renewal_number
        stripe_price_id
      }
    }
  }
`;

const GET_PLANS = gql`
  query GetPlans($input: FilterDto!) {
    GetPlans(filterDto: $input) {
      plans {
        _id
        name
        description
        createdAt
        plan_image
        stripe_product_id
        default_price {
          price
          recurring
          renewal_period
          renewal_number
          stripe_price_id
        }
      }
      totalCount
    }
  }
`;

const GET_PLAN = gql`
  query GetPlan($input: GetPlanDto!) {
    GetPlan(planInput: $input) {
      _id
      name
      description
      plan_image
      stripe_product_id
      default_price {
        price
        recurring
        renewal_period
        renewal_number
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

const DELETE_PLAN = gql`
  mutation DeletePlan($id: IdDto!) {
    DeletePlan(planId: $id) {
      success
      message
    }
  }
`;

export { CREATE_SUBSCRIPTION, GET_PLANS, GET_PLAN, UPDATE_PLAN, DELETE_PLAN };
