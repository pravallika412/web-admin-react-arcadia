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
  query listHandlers($input: PageDto!) {
    listHandlers(listHandlerDto: $input) {
      handlers {
        email
        name
        status
        handling_products_count
        device_id
        brand
        createdAt
        profile_image
        handler_ID
      }
      totalCount
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

const DELETE_HANDLER = gql`
  mutation deleteHandler($id: DeleteHandlerDto!) {
    deleteHandler(deleteHandlerDto: $id) {
      success
      message
    }
  }
`;

export { CREATE_HANDLER, GET_HANDLERS, UPDATE_HANDLER, DELETE_HANDLER };
