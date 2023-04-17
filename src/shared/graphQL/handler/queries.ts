import gql from "graphql-tag";

const CREATE_HANDLER = gql`
  mutation addHandler($input: AddHandlerDto!) {
    addHandler(addHandlerDto: $input) {
      success
      message
    }
  }
`;

const GET_HANDLERS = gql`
  query {
    listHandlers {
      handlers {
        id
        email
        official_email
        status
        handling_products_count
        joining_date
        device_id
        brand
      }
    }
  }
`;

const UPDATE_HANDLER = gql`
  mutation UpdatePlan($input: UpdatePlanDto!) {
    UpdatePlan(updatePlanDto: $input) {
      status
      message
    }
  }
`;
export { CREATE_HANDLER, GET_HANDLERS, UPDATE_HANDLER };
