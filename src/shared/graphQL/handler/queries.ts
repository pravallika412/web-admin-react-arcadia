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
        id
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

const RETRIEVE_HANDLERS = gql`
  query retrieveHandler($input: IdDto!) {
    retrieveHandler(handlerId: $input) {
      id
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
  }
`;

const HANDLER_ACTIVITIES = gql`
  query HandlerActivities($input1: IdDto!, $input2: FilterDto!) {
    HandlerActivities(handlerId: $input1, filterDto: $input2) {
      handlerActivities {
        _id
        product {
          _id
          name
          image
        }
        post_count
        login_date
        login_time
      }
      totalCount
    }
  }
`;

const GET_HANDLER_FEED = gql`
  query RetrieveHandlerProductsFeeds($input1: IdDto!, $input2: FilterDto!) {
    RetrieveHandlerProductsFeeds(handlerId: $input1, filterDto: $input2) {
      productsFeeds {
        _id
        caption
        post_gallery {
          url
        }
        handler
        product_collection_name
        brand
        status
        admin_feedback
        createdAt
        updatedAt
        like_count
        product {
          image
          name
          _id
        }
      }
      totalCount
    }
  }
`;

export { CREATE_HANDLER, GET_HANDLERS, UPDATE_HANDLER, DELETE_HANDLER, RETRIEVE_HANDLERS, HANDLER_ACTIVITIES, GET_HANDLER_FEED };
