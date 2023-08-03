import { useLazyQuery } from "@apollo/client";
import { Box, FormControl, Grid, IconButton, InputLabel, MenuItem, Select } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useCallback, useEffect, useState } from "react";
import Label from "../../shared/components/Label";
import SharedTable from "../../shared/components/Table";
import { GET_SPONSORS_CRYPTO_DETAILS, GET_SPONSORS_STRIPE_DETAILS } from "../../shared/graphQL/sponsor";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

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

const useStyles = makeStyles((theme) => ({
  formControl: {
    width: "100%", // Set a default width for the form control
  },
  label: {
    whiteSpace: "normal", // Allow the label to wrap to multiple lines
  },
}));

const SearchFilter = ({ handleStatusChange, selectedPayment }) => {
  const classes = useStyles();
  return (
    <Grid display="flex">
      <Box width={160} sx={{ m: 1 }}>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel className={classes.label} id="payment-status-label">
            Payment Status
          </InputLabel>
          <Select labelId="payment-status-label" id="payment-status-select" defaultValue={""} onChange={(e) => handleStatusChange(e, "status")} label="Payment Status">
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
  });

  const columnsStripe = [
    { id: "stripeID", label: "ID", minWidth: 170 },
    { id: "amount", label: "Amount", minWidth: 170 },
    { id: "transactionType", label: "Transaction Type", minWidth: 170 },
    { id: "transactionDate", label: "Transaction Date", type: "date", minWidth: 170 },
    { id: "status", label: "Payment Status", minWidth: 170 },
  ];

  const [getSponsorStripeDetails, { data: getSponsorStripeDetailsData, loading: sponsorStripeLoading }] = useLazyQuery(GET_SPONSORS_STRIPE_DETAILS);

  useEffect(() => {
    const variables = { input1: { page: page + 1, limit: rowsPerPage }, input2: { status: filters.status, sponsorId: id } };

    getSponsorStripeDetails({ variables });
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    if (getSponsorStripeDetailsData) {
      setSponsorStripeData(getSponsorStripeDetailsData.SponsorStripeTransactionList.transactions);
      setTotalCount(getSponsorStripeDetailsData.SponsorStripeTransactionList.totalCount);
    }
  }, [getSponsorStripeDetailsData]);

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

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
  }, []);

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

  isLoading = sponsorStripeLoading;
  formattedData = sponsorStripeData.map((row) => ({
    stripeID: (
      <>
        {row?.logs?.paymentIntent ? row.logs.paymentIntent : "N/A"}
        {row.logs.paymentIntent && (
          <IconButton onClick={() => copyToClipboard(row?.logs ? row.logs.paymentIntent : "")} size="small" style={{ marginLeft: 8 }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        )}
      </>
    ),
    amount: row?.amount_paid ? "$" + row.amount_paid : "N/A",
    transactionType: row?.subscription_status ? row?.subscription_status : "",
    transactionDate: formatDate(row?.createdAt),
    status: getStatusLabel(row?.payment_status),
  }));

  return (
    <SharedTable
      columns={columnsStripe}
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
      onRowClick={undefined}
    />
  );
};
export default TransactionHistory;
