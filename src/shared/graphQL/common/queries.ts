import gql from "graphql-tag";

const LOGIN_ADMIN = gql`
  mutation signIn($input: LoginDto!) {
    signIn(loginDto: $input) {
      jwtToken
    }
  }
`;

const GENERATE_PRESIGNED_URL = gql`
  mutation GeneratePresignedUrl($input: SignedUrlDto!) {
    GeneratePresignedUrl(signedUrlDto: $input) {
      presignedUrl
    }
  }
`;

export { LOGIN_ADMIN, GENERATE_PRESIGNED_URL };
