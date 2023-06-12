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
import { useNavigate } from "react-router";
import Label from "../../shared/components/Label";
import SharedTable from "../../shared/components/Table";
import { GET_SPONSORS } from "../../shared/graphQL/sponsor";

const columns = [
  { id: "sponsor_name", label: "Sponsor Name", minWidth: "auto" },
  { id: "email", label: "Email address", minWidth: "auto" },
  { id: "walletAddress", label: "Wallet address", minWidth: "auto" },
  { id: "status", label: "Sponsorship", minWidth: "auto" },
  { id: "plan_name", label: "Subscription Plan", minWidth: "auto" },
  { id: "createdAt", label: "Created On", type: "date", minWidth: "auto" },
  { id: "tvl", label: "TVL", minWidth: "auto" },
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
  const [totalCount, setTotalCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: null,
    plan: null,
  });
  const [getSponsors, { data: getAllSponsors, loading: sponsorLoading, refetch }] = useLazyQuery(GET_SPONSORS);
  const navigate = useNavigate();

  useEffect(() => {
    getSponsors({ variables: { input1: { page: page + 1, limit: rowsPerPage }, input2: { sortBy: "sponsor.createdAt", sortOrder: -1 }, input3: { status: filters.status, plan: filters.plan } } });
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    if (getAllSponsors) {
      setProducts(getAllSponsors.GetSponsorListByBrand.subscribedSponsors);
      setTotalCount(getAllSponsors.GetSponsorListByBrand.totalCount);
    }
  }, [getAllSponsors]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rowperpage) => {
    const newRowsPerPage = parseInt(rowperpage, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset page when changing rows per page
  };

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

  const handleRowClick = (id) => {
    navigate(`/sponsordetails/${id}`);
  };

  const formattedData = products.map((data) => {
    return {
      id: data.sponsor._id,
      sponsor_name: (
        <div style={{ display: "flex", alignItems: "center" }}>
          {data.sponsor.profile_picture ? (
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
              <img src={data.sponsor.profile_picture} style={{ width: "45px", height: "45px", borderRadius: "50%" }} alt="description" />
            </div>
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingLeft: "10px" }}>
            {data.sponsor && data.sponsor.name ? <strong>{data.sponsor.name}</strong> : <strong>N/A</strong>}
          </div>
        </div>
      ),
      email: data.sponsor?.email ? data.sponsor.email : "N/A",
      walletAddress: data.sponsor?.walletAddress ? data.sponsor?.walletAddress.slice(0, 3) + "*******" + data.sponsor.walletAddress.slice(-4) : "",
      status: getStatusLabel(data.status),
      plan_name: (
        <>
          {data.planDetails && data.planDetails?.name ? data.planDetails?.name : "N/A"}
          <span style={{ display: "block", fontSize: 10 }}>{formatTimestamp(data.subscription_end_date)}</span>
        </>
      ),
      createdAt: formatDate(data.sponsor.createdAt),
      tvl: "$" + (data.sponsor.tvl ? parseFloat(data.sponsor.tvl).toFixed(2) : 0),
    };
  });

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
              <Select onChange={(e) => handleStatusChange(e, "plan")} label="Subscription Plan" defaultValue={""} autoWidth>
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
              <Select onChange={(e) => handleStatusChange(e, "status")} label="Sponsorship Status" defaultValue={""} autoWidth>
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

      {/* <Paper>
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
      </Paper> */}
      <SharedTable
        columns={columns}
        data={formattedData}
        page={page}
        tableBodyLoader={sponsorLoading}
        rowsPerPage={rowsPerPage}
        totalRows={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        searchFilter={undefined}
        onSearch={undefined}
        searchFilterVisible={false}
        selectableRows={true}
        onRowClick={handleRowClick}
      ></SharedTable>
    </Container>
  );
};
export default Sponsor;
