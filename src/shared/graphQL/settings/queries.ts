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
      first_name
      last_name
      profile_image
      merchant_address
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation updateAdminProfile($input: UpdateAdminDto!) {
    updateAdminProfile(updateAdminDto: $input) {
      success
      message
    }
  }
`;

export { GET_ADMIN, UPDATE_PROFILE };
