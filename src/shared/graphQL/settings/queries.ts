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
      brandDetails {
        membership_contract_address
      }
      merchant_address
    }
  }
`;

const GET_ADMIN_NOTIFICATIONS = gql`
  query {
    GetAdminNotificationSettings {
      _id
      admin
      notification_types {
        push
        email
        sms
        inApp
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_ADMIN_TRANSACTIONS = gql`
  query GetAdminTransactions($input1: PageDto!, $input2: TransactionFilter!) {
    GetAdminTransactions(pageDto: $input1, filterDto: $input2) {
      transactions {
        _id
        sponsor
        brand
        plan
        feed
        transaction_hash
        block_number
        status
        transaction_status
        logs
        createdAt
        gasFees
      }
      totalCount
    }
  }
`;

const SHOW_ADMIN_NOTIFICATIONS = gql`
  query AdminInAppNotifications($input1: PageDto!, $input2: NotificationFilterDto!) {
    AdminInAppNotifications(pageDto: $input1, filterDto: $input2) {
      notifications {
        _id
        admin
        handler
        sponsor
        read
        read_at
        subject
        message
        plan
        brand
        product
        feed
        product_collection_name
        notification_type
        image_url {
          mime_type
          url
        }
        createdAt
        updatedAt
      }
      unread_count
      totalCount
    }
  }
`;

const UPDATE_NOTIFICATIONS = gql`
  mutation UpdateAdminNotificationSettings($input: UpdateAdminNotificationDto!) {
    UpdateAdminNotificationSettings(updateAdminNotificationDto: $input) {
      success
      message
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

const MARK_READ = gql`
  mutation MarkReadAdminNotification($input: NotificationId!) {
    MarkReadAdminNotification(notificationId: $input) {
      success
      message
    }
  }
`;

const MARK_ALL_READ = gql`
  mutation {
    MarkReadAllAdminNotifications {
      success
      message
    }
  }
`;

export { GET_ADMIN, UPDATE_PROFILE, CHANGE_PASSWORD, GET_ADMIN_NOTIFICATIONS, UPDATE_NOTIFICATIONS, SHOW_ADMIN_NOTIFICATIONS, MARK_READ, MARK_ALL_READ, GET_ADMIN_TRANSACTIONS };
