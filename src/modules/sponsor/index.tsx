import { ApolloClient, InMemoryCache, useLazyQuery } from "@apollo/client";
import { Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Label from "../../shared/components/Label";
import { GET_SPONSORS } from "../../shared/graphQL/sponsor";

const columns = [
  { id: "name", label: "Name", minWidth: 170 },
  { id: "email", label: "Email", minWidth: 170 },
  { id: "walletAddress", label: "Wallet Address", minWidth: 170 },
  { id: "planName", label: "Plan", minWidth: 170 },
  { id: "createdAt", label: "Created At", type: "date", minWidth: 170 },
  { id: "status", label: "Status", minWidth: 170 },
  { id: "tvl", label: "TVL", minWidth: 170 },
];

// need to remove later
const client = new ApolloClient({
  uri: "http://localhost:3000/graphql",
  cache: new InMemoryCache(),
});

const Sponsor = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const getAllSponsors = client.query({
    query: GET_SPONSORS,
  });

  const getSponsorData = async () => {
    setProducts((await getAllSponsors).data.allSponsors);
  };

  useEffect(() => {
    if (getAllSponsors) {
      getSponsorData();
    }
  }, [getAllSponsors]);

  const formatDate = (dateToFormat) => {
    const date = new Date(dateToFormat);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;
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
                  <TableCell key={column.id} style={{ minWidth: column.minWidth }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length > 0 ? (
                products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => {
                  return (
                    <TableRow hover tabIndex={-1} key={product.id}>
                      {columns.map((column) => {
                        const value = product[column.id];
                        return (
                          <TableCell key={column.id}>
                            {column.type === "date" ? formatDate(value) : column.id === "tvl" ? "$" + value : column.id === "status" ? getStatusLabel(value) : value}
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
