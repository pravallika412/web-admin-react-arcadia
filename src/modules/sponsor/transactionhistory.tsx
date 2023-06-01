import { useLazyQuery } from "@apollo/client";
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Label from "../../shared/components/Label";
import SharedTable from "../../shared/components/Table";
import { GET_SPONSORS_CRYPTO_DETAILS, GET_SPONSORS_STRIPE_DETAILS } from "../../shared/graphQL/sponsor";

const paymentGateway = [
  { id: 1, name: "Stripe", value: "stripe" },
  { id: 2, name: "Crypto", value: "crypto" },
];

const paymentStatus = [
  {
    id: "all",
    name: "All",
  },
  {
    id: "success",
    name: "Success",
  },
  {
    id: "failed",
    name: "Failed",
  },
];

const SearchFilter = ({ handleStatusChange, selectedPayment }) => {
  return (
    <Grid display="flex">
      <Box width={160} sx={{ m: 1 }}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Payment Gateway</InputLabel>
          <Select onChange={(e) => handleStatusChange(e, "gateway")} value={selectedPayment.gateway} label="Post Status" autoWidth>
            {paymentGateway.map((statusOption) => (
              <MenuItem key={statusOption.id} value={statusOption.value}>
                {statusOption.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box width={160} sx={{ m: 1 }}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Payment Status</InputLabel>
          <Select onChange={(e) => handleStatusChange(e, "status")} label="Post Status" autoWidth>
            {paymentStatus.map((statusOption) => (
              <MenuItem key={statusOption.id} value={statusOption.id}>
                {statusOption.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Grid>
  );
};

const TransactionHistory = ({ id }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sponsorStripeData, setSponsorStripeData] = useState([]);
  const [sponsorCryptoData, setSponsorCryptoData] = useState([]);
  const [filters, setFilters] = useState({
    status: null,
    gateway: paymentGateway[0].value,
  });

  const columnsStripe = [
    { id: "stripeID", label: "ID", minWidth: 170 },
    { id: "amount", label: "Amount", minWidth: 170 },
    { id: "transactionType", label: "Transaction Type", minWidth: 170 },
    { id: "transactionDate", label: "Transaction Date", type: "date", minWidth: 170 },
    { id: "status", label: "Status", minWidth: 170 },
  ];

  const columnsCrypto = [
    { id: "cryptoID", label: "Transaction Hash", minWidth: 170 },
    { id: "amount", label: "Amount", minWidth: 170 },
    { id: "transactionType", label: "Transaction Type", minWidth: 170 },
    { id: "transactionDate", label: "Transaction Date", type: "date", minWidth: 170 },
    { id: "status", label: "Status", minWidth: 170 },
  ];

  const columns = filters.gateway === "stripe" ? columnsStripe : columnsCrypto;

  const [getSponsorStripeDetails, { data: getSponsorStripeDetailsData, loading: sponsorStripeLoading }] = useLazyQuery(GET_SPONSORS_STRIPE_DETAILS);
  const [getSponsorCryptoDetails, { data: getSponsorCryptoDetailsData, loading: sponsorCryptoLoading }] = useLazyQuery(GET_SPONSORS_CRYPTO_DETAILS);

  useEffect(() => {
    const variables = { input: { sponsorId: id }, input1: { page: page + 1, limit: rowsPerPage }, input2: { status: filters.status } };

    if (filters.gateway === "stripe") {
      getSponsorStripeDetails({ variables });
    } else if (filters.gateway === "crypto") {
      getSponsorCryptoDetails({ variables });
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    if (getSponsorStripeDetailsData && filters.gateway === "stripe") {
      setSponsorStripeData(getSponsorStripeDetailsData.SponsorStripeTransactionList.transactions);
      setTotalCount(getSponsorStripeDetailsData.SponsorStripeTransactionList.totalCount);
    } else if (getSponsorCryptoDetailsData && filters.gateway === "crypto") {
      setSponsorCryptoData(getSponsorCryptoDetailsData.SponsorCryptoTransactionList.transactions);
      setTotalCount(getSponsorCryptoDetailsData.SponsorCryptoTransactionList.totalCount);
    }
  }, [getSponsorStripeDetailsData, getSponsorCryptoDetailsData, filters.gateway]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rowperpage) => {
    const newRowsPerPage = parseInt(rowperpage, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset page when changing rows per page
  };

  const handleStatusChange = (e: any, type: string): void => {
    const value = e.target.value === "all" ? null : e.target.value;
    if (type == "status") {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: value,
      }));
    }
    if (type == "gateway") {
      setFilters((prevFilters) => ({
        ...prevFilters,
        gateway: value,
      }));
    }
  };

  const formatDate = (dateToFormat) => {
    if (dateToFormat) {
      const date = new Date(dateToFormat);
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const day = ("0" + date.getDate()).slice(-2);
      const formattedDate = `${day}-${month}-${year}`;
      return formattedDate;
    } else {
      return "";
    }
  };

  type Color = "error" | "info" | "secondary" | "primary" | "warning" | "success";
  const getStatusLabel = (status: "success" | "failed"): JSX.Element => {
    let color = "";
    let text = "";
    switch (status) {
      case "success":
        text = "Success";
        color = "success";
        break;
      case "failed":
        text = "Failed";
        color = "error";
        break;
      default:
        text = "Failed";
        color = "error";
        break;
    }
    return <Label color={color as Color}>{text}</Label>;
  };

  let formattedData: Array<any>;
  let isLoading: boolean;

  if (filters.gateway === "stripe") {
    isLoading = sponsorStripeLoading;
    formattedData = sponsorStripeData.map((row) => ({
      stripeID: row?.logs ? row.logs.paymentIntent : "",
      amount: "$" + row?.amount_paid ? row?.amount_paid : "",
      transactionType: row?.subscription_status ? row?.subscription_status : "",
      transactionDate: formatDate(row?.createdAt),
      status: getStatusLabel(row?.payment_status),
    }));
  } else {
    isLoading = sponsorCryptoLoading;
    formattedData = sponsorCryptoData.map((row) => ({
      cryptoID: row?.transaction_hash ? row?.transaction_hash.slice(0, 3) + "*******" + row?.transaction_hash.slice(-4) : "",
      amount: row?.amount_paid ? parseFloat(row?.amount_paid).toFixed(2) : "" + " " + row?.currency == null ? "" : row?.currency,
      transactionType: row?.subscription_status ? row?.subscription_status : "",
      transactionDate: formatDate(row?.createdAt),
      status: getStatusLabel(row?.payment_status),
    }));
  }

  return (
    <SharedTable
      columns={columns}
      data={formattedData}
      page={page}
      tableBodyLoader={isLoading}
      rowsPerPage={rowsPerPage}
      totalRows={totalCount}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      onSearch={undefined}
      searchFilter={<SearchFilter handleStatusChange={handleStatusChange} selectedPayment={filters} />}
      searchFilterVisible={false}
      selectableRows={false}
    />
  );
};
export default TransactionHistory;
