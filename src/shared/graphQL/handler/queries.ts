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
  mutation updateHandler($id: IdDto!, $input: UpdateHandlerDto!) {
    updateHandler(handlerId: $id, updateHandlerDto: $input) {
      success
      message
    }
  }
`;

const SUSPEND_HANDLER = gql`
  mutation suspendHandler($id: SuspendHandlerDto!) {
    suspendHandler(suspendHandlerDto: $id) {
      success
      message
    }
  }
`;

export { CREATE_HANDLER, GET_HANDLERS, UPDATE_HANDLER, SUSPEND_HANDLER };
