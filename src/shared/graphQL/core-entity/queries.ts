import gql from "graphql-tag";

const CREATE_ENTITY = gql`
  mutation createCoreEntity($input: CoreEntityDto!) {
    createCoreEntity(coreEntityDto: $input) {
      success
      message
    }
  }
`;

const GET_DATATYPES = gql`
  query {
    retrieveDataTypes {
      order
      name
      fieldType
    }
  }
`;

const GET_COREENTITY = gql`
  query {
    retrieveCoreEntity {
      _id
      product_table_name
      product_schema
    }
  }
`;

export { CREATE_ENTITY, GET_DATATYPES, GET_COREENTITY };
