import { useLazyQuery } from "@apollo/client";
import { Box, Container, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import SharedTable from "../../shared/components/Table";
import { GET_ADMIN_TRANSACTIONS } from "../../shared/graphQL/settings/queries";
import { makeStyles } from "@mui/styles";

const columns = [
  { id: "transactionHash", label: "Transaction ID", minWidth: "auto" },
  { id: "createdAt", label: "Transaction Date", type: "date", minWidth: "auto" },
  { id: "status", label: "Status", minWidth: "auto" },
];

const transactionStatus = [
  {
    id: "all",
    name: "All",
  },
  {
    id: "nftminted",
    name: "NFT Minted",
  },
  {
    id: "subscription_renewed",
    name: "Subscription Renewed",
  },
  {
    id: "canceled",
    name: "Cancelled",
  },
  {
    id: "subscription_changed",
    name: "Subscription Changed",
  },
  {
    id: "new_subscription_created",
    name: "New Subscription Created",
  },
  {
    id: "new_collection_created",
    name: "New Collection Created",
  },
  {
    id: "new_subscription_plan_created",
    name: "New Subscription Plan Created",
  },
  {
    id: "admin_wallet_not_found",
    name: "Admin Wallet Not Found",
  },
  {
    id: "NOT_AUTHENTICATED",
    name: "NOT AUTHENTICATED",
  },
  {
    id: "TIER_NOT_FOUND",
    name: "TIER NOT FOUND",
  },
  {
    id: "new_subscription_plan_updated",
    name: "New Subscription Plan Updated",
  },
  {
    id: "merchant_address_changed",
    name: "Merchant Address Changed",
  },
  {
    id: "content_upload",
    name: "Content Upload",
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

const Transaction = () => {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    status: null,
  });
  const [getAdminTransaction, { data: getAdminTransactionData, loading: transactionLoading, refetch }] = useLazyQuery(GET_ADMIN_TRANSACTIONS, { fetchPolicy: "no-cache" });

  useEffect(() => {
    getAdminTransaction({ variables: { input1: { page: page + 1, limit: rowsPerPage }, input2: { status: filters.status } } });
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    if (getAdminTransactionData) {
      setTransactions(getAdminTransactionData.GetAdminTransactions.transactions);
      setTotalCount(getAdminTransactionData.GetAdminTransactions.totalCount);
    }
  }, [getAdminTransactionData]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rowperpage) => {
    const newRowsPerPage = parseInt(rowperpage, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset page when changing rows per page
  };

  const formatDate = (dateToFormat) => {
    if (dateToFormat) {
      const date = new Date(dateToFormat);
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const day = ("0" + date.getDate()).slice(-2);
      const hours = ("0" + date.getHours()).slice(-2);
      const minutes = ("0" + date.getMinutes()).slice(-2);
      const formattedDate = `${day}-${month}-${year}`;
      const formattedTime = `${hours}:${minutes}`;
      return (
        <>
          <Typography>{formattedDate}</Typography>
          <Typography>{formattedTime}</Typography>
        </>
      );
    } else {
      return "";
    }
  };

  const handleStatusChange = (e: any): void => {
    const value = e.target.value === "all" ? null : e.target.value;
    setFilters((prevFilters) => ({
      ...prevFilters,
      status: value,
    }));
  };

  const formattedData = transactions.map((data) => {
    return {
      transactionHash: data?.transaction_hash ? data?.transaction_hash.slice(0, 3) + "*******" + data?.transaction_hash.slice(-4) : "",
      createdAt: formatDate(data.createdAt),
      status: data.status,
    };
  });

  return (
    <>
      <Grid container justifyContent="flex-end" alignItems="center">
        <Box width={180} sx={{ m: 1 }}>
          <FormControl fullWidth variant="outlined" className={classes.formControl}>
            <InputLabel className={classes.label} id="txnstatus">
              Transaction Status
            </InputLabel>
            <Select labelId="txnstatus" id="txn-menu" onChange={(e) => handleStatusChange(e)} label="Transaction Status" defaultValue={""} autoWidth>
              {transactionStatus.map((statusOption) => (
                <MenuItem key={statusOption.id} value={statusOption.id}>
                  {statusOption.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Grid>
      <SharedTable
        columns={columns}
        data={formattedData}
        page={page}
        tableBodyLoader={transactionLoading}
        rowsPerPage={rowsPerPage}
        totalRows={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        searchFilter={undefined}
        onSearch={undefined}
        searchFilterVisible={false}
        selectableRows={false}
        onRowClick={undefined}
      ></SharedTable>
    </>
  );
};
export default Transaction;
