import { ApolloClient, InMemoryCache, useLazyQuery } from "@apollo/client";
import {
  Box,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import Label from "../../shared/components/Label";
import { GET_SPONSORS } from "../../shared/graphQL/sponsor";

const columns = [
  { _id: 1, id: "name", subtype: "sponsor", label: "Sponsor Name", minWidth: "auto" },
  { _id: 2, id: "email", subtype: "sponsor", label: "Email address", minWidth: "auto" },
  { _id: 3, id: "walletAddress", subtype: "sponsor", label: "Wallet address", minWidth: "auto" },
  { _id: 6, id: "status", label: "Sponsorship", minWidth: "auto" },
  { _id: 4, id: "name", subtype: "planDetails", label: "Subscription Plan", minWidth: "auto" },
  { _id: 5, id: "createdAt", subtype: "sponsor", label: "Created On", type: "date", minWidth: "auto" },
  { _id: 7, id: "tvl", subtype: "sponsor", label: "TVL", minWidth: "auto" },
];

const sponsorshipStatus = [
  {
    id: "all",
    name: "All",
  },
  {
    id: "active",
    name: "Active",
  },
  {
    id: "inactive",
    name: "Inactive",
  },
];
const subscriptionStatus = [
  {
    id: "all",
    name: "All",
  },
  {
    id: "Basic Plan",
    name: "Basic Plan",
  },
  {
    id: "Premium Plan",
    name: "Premium Plan",
  },
  {
    id: "Platinum Plan",
    name: "Platinum Plan",
  },
];

const Sponsor = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: null,
    plan: null,
  });
  const [getSponsors, { data: getAllSponsors, loading: sponsorLoading, refetch }] = useLazyQuery(GET_SPONSORS);

  useEffect(() => {
    getSponsors({ variables: { input1: { page: page + 1, limit: rowsPerPage }, input2: {}, input3: { status: filters.status, plan: filters.plan } } });
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    if (getAllSponsors) {
      setProducts(getAllSponsors.GetSponsorListByBrand.subscribedSponsors);
    }
  }, [getAllSponsors]);

  const handleStatusChange = (e: any, type: string): void => {
    let value = null;

    if (e.target.value !== "all") {
      value = e.target.value;
    }
    if (type == "status") {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: value,
      }));
    }
    if (type == "plan") {
      setFilters((prevFilters) => ({
        ...prevFilters,
        plan: value,
      }));
    }
  };

  const formatTimestamp = (dateToFormat) => {
    if (dateToFormat) {
      const date = new Date(dateToFormat * 1000);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;
    } else {
      return "";
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

  type Color = "error" | "info" | "secondary";
  const getStatusLabel = (status: "active" | "inactive" | "suspended"): JSX.Element => {
    let color = "";
    let text = "";
    switch (status) {
      case "active":
        text = "Active";
        color = "info";
        break;
      case "inactive":
        text = "Inactive";
        color = "secondary";
        break;
      case "suspended":
        text = "Suspended";
        color = "error";
        break;
      default:
        color = "warning";
        text = "Inactive";
        break;
    }
    return <Label color={color as Color}>{text}</Label>;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderColumn = (column, subValue, product, value) => {
    switch (column.id) {
      case "tvl":
        return "$" + (subValue ? subValue : 0);
      case "walletAddress":
        return subValue ? subValue.slice(0, 3) + "*******" + subValue.slice(-4) : "";
      case "name":
        if (column.subtype === "planDetails") {
          return (
            <div>
              {subValue}
              <span style={{ display: "block", fontSize: 10 }}>{formatTimestamp(product["subscription_end_date"])}</span>
            </div>
          );
        }
        if (column.subtype === "sponsor") {
          return (
            <div style={{ display: "flex" }}>
              {product[column.subtype] && product[column.subtype]["profile_picture"] ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundImage: "linear-gradient(to right, rgba(85, 105, 255, 1), rgba(30, 136, 229, 1), rgba(52, 163, 83, 1))",
                    borderRadius: "50%",
                    padding: "2px",
                    width: "50px",
                    height: "50px",
                  }}
                >
                  <img src={product[column.subtype]["profile_picture"]} style={{ width: "45px", height: "45px", borderRadius: "50%" }} alt="description" />
                </div>
              ) : (
                ""
              )}
              {subValue ? (
                <div style={{ alignItems: "center", paddingTop: "15px", paddingLeft: "10px" }}>
                  <strong>{subValue}</strong>
                </div>
              ) : (
                <div style={{ alignItems: "center", paddingLeft: "10px" }}>
                  <strong>{"N/A"}</strong>
                </div>
              )}
            </div>
          );
        }
        return subValue;
      case "status":
        return getStatusLabel(value);
      default:
        return subValue ? subValue : "N/A";
    }
  };

  return (
    <Container component="main">
      <Grid container justifyContent="space-between" alignItems="center" sx={{ ms: 2, mt: 2 }}>
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            List of Sponsors
          </Typography>
        </Grid>
        <Grid sx={{ display: "flex" }}>
          <Box width={160} sx={{ m: 1 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Subscription Plan</InputLabel>
              <Select onChange={(e) => handleStatusChange(e, "plan")} label="Subscription Plan" autoWidth>
                {subscriptionStatus.map((statusOption) => (
                  <MenuItem key={statusOption.id} value={statusOption.id}>
                    {statusOption.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box width={170} sx={{ m: 1 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sponsorhsip Status</InputLabel>
              <Select onChange={(e) => handleStatusChange(e, "status")} label="Sponsorship Status" autoWidth>
                {sponsorshipStatus.map((statusOption) => (
                  <MenuItem key={statusOption.id} value={statusOption.id}>
                    {statusOption.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table aria-label="Product table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column._id} style={{ minWidth: column.minWidth, textTransform: "none" }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sponsorLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <Skeleton variant="rectangular" animation="wave" height={500} />
                  </TableCell>
                </TableRow>
              ) : products.length > 0 ? (
                products.map((product) => {
                  return (
                    <TableRow hover tabIndex={-1} key={product._id}>
                      {columns.map((column) => {
                        const value = product[column.id] ? product[column.id] : "";
                        const subValue = column.subtype && product[column.subtype] ? product[column.subtype][column.id] : undefined;

                        return <TableCell key={column._id}>{column.subtype && column.type === "date" ? formatDate(subValue) : renderColumn(column, subValue, product, value)}</TableCell>;
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell align="center" colSpan={6}>
                    No results found!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={getAllSponsors?.GetSponsorListByBrand?.totalCount || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};
export default Sponsor;
