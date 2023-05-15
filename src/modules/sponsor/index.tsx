import { ApolloClient, InMemoryCache, useLazyQuery } from "@apollo/client";
import { Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Label from "../../shared/components/Label";
import { GET_SPONSORS } from "../../shared/graphQL/sponsor";

const columns = [
  { _id: 1, id: "name", subtype: "sponsor", label: "Name", minWidth: "auto" },
  { _id: 2, id: "email", subtype: "sponsor", label: "Email", minWidth: "auto" },
  { _id: 3, id: "walletAddress", subtype: "sponsor", label: "Wallet Address", minWidth: "auto" },
  { _id: 4, id: "name", subtype: "planDetails", label: "Plan", minWidth: "auto" },
  { _id: 5, id: "createdAt", subtype: "sponsor", label: "Created At", type: "date", minWidth: "auto" },
  { _id: 6, id: "status", label: "Status", minWidth: "auto" },
  { _id: 7, id: "tvl", subtype: "sponsor", label: "TVL", minWidth: "auto" },
];

const Sponsor = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [getSponsors, { data: getAllSponsors, refetch }] = useLazyQuery(GET_SPONSORS);

  useEffect(() => {
    getSponsors({ variables: { input1: {}, input2: {} } });
  }, []);

  useEffect(() => {
    if (getAllSponsors) {
      setProducts(getAllSponsors.GetSponsorListByBrand.subscribedSponsors);
    }
  }, [getAllSponsors]);

  const formatDate = (dateToFormat) => {
    const date = new Date(dateToFormat);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
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
  return (
    <Container component="main">
      <Grid container justifyContent="space-between" alignItems="center" sx={{ ms: 2, mt: 2 }}>
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            List of Sponsors
          </Typography>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table aria-label="Product table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column._id} style={{ minWidth: column.minWidth }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length > 0 ? (
                products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => {
                  return (
                    <TableRow hover tabIndex={-1} key={product._id}>
                      {columns.map((column) => {
                        const value = product[column.id];
                        const subValue = column.subtype && product[column.subtype][column.id];
                        return (
                          <TableCell key={column._id}>
                            {column.subtype ? (
                              column.type === "date" ? (
                                formatDate(subValue)
                              ) : column.id === "tvl" ? (
                                "$" + (subValue ? subValue : 0)
                              ) : column.id === "walletAddress" ? (
                                subValue.slice(0, 3) + "*******" + subValue.slice(-3)
                              ) : column.id === "name" && column.subtype === "planDetails" ? (
                                <div>
                                  {subValue}
                                  <span style={{ display: "block", fontSize: 10 }}>{formatDate(product["subscription_end_date"])}</span>
                                </div>
                              ) : column.id === "name" && column.subtype === "sponsor" ? (
                                <>
                                  {product[column.subtype]["profile_picture"] ? (
                                    <img src={product[column.subtype]["profile_picture"]} style={{ width: "20px", height: "20px" }} alt="description" />
                                  ) : (
                                    ""
                                  )}
                                  <span>{subValue}</span>
                                </>
                              ) : (
                                subValue
                              )
                            ) : column.id === "status" ? (
                              getStatusLabel(value)
                            ) : (
                              value
                            )}
                          </TableCell>
                        );
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
          count={products.length}
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
