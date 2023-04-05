import gql from "graphql-tag";

const LOGIN_ADMIN = gql`
  mutation signIn($input: LoginDto!) {
    signIn(loginDto: $input) {
      jwtToken
    }
  }
`;

export { LOGIN_ADMIN };
