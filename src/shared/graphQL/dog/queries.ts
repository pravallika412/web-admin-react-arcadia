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
  query listProducts($input: PageDto!) {
    listProducts(listProductDto: $input) {
      products {
        id
        name
        dob
        adoption_date
        rest_date
        service
        service_start
        service_end
        photo_url
        gallery
        medals
        medical_report
        status
        profile_status
        handlers_count
        brand
        breed_name
      }
      totalCount
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation updateProduct($id: IdDto!, $input: UpdateProductDto!) {
    updateProduct(productId: $id, updateProductDto: $input) {
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

export { CREATE_PRODUCT, GET_PRODUCTS, UPDATE_PRODUCT, DELETE_PRODUCT };
