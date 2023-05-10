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

export { CREATE_ENTITY, GET_DATATYPES };
