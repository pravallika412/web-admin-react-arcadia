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

const CHANGE_PASSWORD = gql`
  mutation ChangeAdminPassword($input: ChangeAdminPasswordDto!) {
    ChangeAdminPassword(changeAdminPasswordDto: $input) {
      success
      message
    }
  }
`;

export { GET_ADMIN, UPDATE_PROFILE, CHANGE_PASSWORD };
