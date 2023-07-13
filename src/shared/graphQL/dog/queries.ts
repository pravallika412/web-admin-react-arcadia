import gql from "graphql-tag";

const CREATE_PRODUCT = gql`
  mutation createProduct($input: CreateProductDto!) {
    createProduct(createProductDto: $input) {
      success
      message
    }
  }
`;

const GET_PRODUCTS = gql`
  query retrieveProductsList($input: ProductFilterDto!) {
    retrieveProductsList(retrieveProductsListDto: $input) {
      productsDataList
      totalCount
    }
  }
`;

const GET_PRODUCT_DETAILS = gql`
  query retrieveProduct($input: RetrieveProductDto!) {
    retrieveProduct(retrieveProductDto: $input) {
      productData
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation editProduct($id: IdDto!, $input: EditProductDto!) {
    editProduct(productId: $id, editProductDto: $input) {
      success
      message
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation deleteProduct($id: DeleteProductDto!) {
    deleteProduct(deleteProductDto: $id) {
      success
      message
    }
  }
`;

const UPDATE_RFID = gql`
  mutation UpdateRFIDTag($input: UpdateRFIDTagDto!) {
    UpdateRFIDTag(updateRFIDTagDto: $input) {
      success
      message
    }
  }
`;

export { CREATE_PRODUCT, GET_PRODUCTS, UPDATE_PRODUCT, DELETE_PRODUCT, GET_PRODUCT_DETAILS, UPDATE_RFID };
