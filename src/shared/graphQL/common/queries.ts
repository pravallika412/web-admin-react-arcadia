import gql from "graphql-tag";

const LOGIN_ADMIN = gql`
  mutation signIn($input: LoginDto!) {
    signIn(loginDto: $input) {
      jwtToken
    }
  }
`;

const VERIFY_OTP = gql`
  mutation VerifyOtp($input: VerifyOtpDto!) {
    VerifyOtp(verifyOtpDto: $input) {
      success
      message
    }
  }
`;

const RESEND_OTP = gql`
  mutation resendOtp($input: ResendOtpDto!) {
    resendOtp(resendOtpDto: $input) {
      token
    }
  }
`;

const FORGET_PASSWORD = gql`
  mutation ForgotPassword($input: ForgotPasswordDto!) {
    ForgotPassword(forgotPasswordDto: $input) {
      token
    }
  }
`;

const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordDto!) {
    ResetPassword(resetPasswordDto: $input) {
      success
      message
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

const SPONSOR_STATS = gql`
  query GetSponsorSubscriptionStats($input: GetSponsorSubscriptionStatsDto!) {
    GetSponsorSubscriptionStats(getSponsorSubscriptionStatsDto: $input) {
      sponsorSubscriptionStats {
        _id {
          year
          month
          day
          dayOfWeek
          week
        }
        timestamp
        sponsorCount
      }
      totalCount
    }
  }
`;

const GET_USER_COUNT = gql`
  query {
    GetUsersCount {
      sponsorCount
      handlerCount
      productCount
      totalAmount
    }
  }
`;

export { LOGIN_ADMIN, GENERATE_PRESIGNED_URL, FORGET_PASSWORD, VERIFY_OTP, RESEND_OTP, RESET_PASSWORD, SPONSOR_STATS, GET_USER_COUNT };
