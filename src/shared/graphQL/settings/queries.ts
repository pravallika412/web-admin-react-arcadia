import gql from "graphql-tag";

const GET_ADMIN = gql`
  query {
    getAdmin {
      _id
      email
      brand
      matic_wallet {
        wallet_address
      }
      role
    }
  }
`;

export { GET_ADMIN };
