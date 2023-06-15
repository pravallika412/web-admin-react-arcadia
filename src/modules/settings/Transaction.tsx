import { useLazyQuery } from "@apollo/client";
import { Box, Container, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import SharedTable from "../../shared/components/Table";
import { GET_ADMIN_TRANSACTIONS } from "../../shared/graphQL/settings/queries";
import { makeStyles } from "@mui/styles";
import Label from "../../shared/components/Label";

const columns = [
  { id: "transactionHash", label: "Transaction ID", minWidth: "auto" },
  { id: "gasfee", label: "Gas fee (MATIC)", minWidth: "auto" },
  { id: "createdAt", label: "Transaction Date", type: "date", minWidth: "auto" },
  { id: "type", label: "Transaction Type", minWidth: "auto" },
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
    name: "Not Authenticated",
  },
  {
    id: "TIER_NOT_FOUND",
    name: "Tier Not Found",
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

const SearchFilter = ({ handleStatusChange }) => {
  return (
    <Box width={180} sx={{ m: 1 }}>
      <FormControl fullWidth variant="outlined">
        <InputLabel id="txnstatus">Transaction Type</InputLabel>
        <Select labelId="txnstatus" id="txn-menu" onChange={(e) => handleStatusChange(e)} label="Transaction Status" defaultValue={""} autoWidth>
          {transactionStatus.map((statusOption) => (
            <MenuItem key={statusOption.id} value={statusOption.id}>
              {statusOption.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

const Transaction = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    status: null,
  });
  const [getAdminTransaction, { data: getAdminTransactionData, loading: transactionLoading, refetch }] = useLazyQuery(GET_ADMIN_TRANSACTIONS, { fetchPolicy: "no-cache" });

  useEffect(() => {
    getAdminTransaction({ variables: { input1: { page: page + 1, limit: rowsPerPage }, input2: { status: filters.status, transactionHash: searchValue } } });
  }, [page, rowsPerPage, filters, searchValue]);

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
        color = "warning";
        text = "failed";
        break;
    }
    return <Label color={color as Color}>{text}</Label>;
  };

  const formattedData = transactions.map((data) => {
    return {
      transactionHash: data?.transaction_hash ? data?.transaction_hash.slice(0, 3) + "*******" + data?.transaction_hash.slice(-4) : "",
      gasfee: data?.gasFees ? parseFloat(data?.gasFees).toFixed(6) : 0,
      createdAt: formatDate(data.createdAt),
      type: data?.status ? transactionStatus.find((item) => item.id === data?.status).name : "",
      status: data?.transaction_status ? getStatusLabel(data.transaction_status) : "",
    };
  });

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  return (
    <>
      <SharedTable
        columns={columns}
        data={formattedData}
        page={page}
        tableBodyLoader={transactionLoading}
        rowsPerPage={rowsPerPage}
        totalRows={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSearch={handleSearch}
        searchFilter={<SearchFilter handleStatusChange={handleStatusChange} />}
        searchFilterVisible={true}
        selectableRows={false}
        onRowClick={undefined}
      ></SharedTable>
    </>
  );
};
export default Transaction;
