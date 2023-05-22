import { useLazyQuery } from "@apollo/client";
import { Container, Grid, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import SharedTable from "../../shared/components/Table";
import { GET_FEED } from "../../shared/graphQL/post/queries";

const columns = [
  { id: "name", label: "Name", minWidth: 170 },
  { id: "email", label: "Email", minWidth: 170 },
  { id: "handling_products_count", label: "Product Count", minWidth: 170 },
  { id: "createdAt", label: "Created At", type: "date", minWidth: 170 },
  { id: "status", label: "Status", minWidth: 170 },
  { id: "action", label: "Action", minWidth: 170 },
];
const postStatuses = [
  { status: "Total Posts", count: 100, color: "#FFFFFF", borderColor: "#999999", countColor: "#4D4D4D" },
  { status: "Approved Posts", count: 80, color: "#F6FFFC", borderColor: "#2D9972", countColor: "#2D9972" },
  { status: "Pending Posts", count: 5, color: "#FFF9EE", borderColor: "#EE8212", countColor: "#EE8212" },
  { status: "Rejected Posts", count: 15, color: "#FFF5F5", borderColor: "#E6313C", countColor: "#E6313C" },
];

const Posts = () => {
  const [products, setProducts] = useState([]);
  const [getFeed, { data: getFeedData, refetch }] = useLazyQuery(GET_FEED);

  useEffect(() => {
    getFeed({ variables: { input: { pageDto: {} } } });
  }, []);

  useEffect(() => {
    if (getFeedData) {
      setProducts(getFeedData.listFeeds.feeds);
    }
  }, [getFeedData]);

  const onRowAction = (row) => {
    console.log(row);
    // setSelectedRow(row);
    // setOpenDialog(true);
  };

  return (
    <>
      <Container sx={{ pt: "3rem" }}>
        <Typography variant="h2" sx={{ mb: "1rem" }}>
          List of Posts
        </Typography>
        <Grid item xs={12} sx={{ my: "1rem" }}>
          <Grid container justifyContent="start" spacing={6}>
            {postStatuses.map((value, index) => (
              <Grid key={index} item>
                <Paper
                  sx={{
                    height: 98,
                    width: 160,
                    backgroundColor: value.color,
                    display: "flex",
                    border: "1px solid " + value.borderColor,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: value.countColor }}>{value.count}</Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 500 }}>{value.status}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <SharedTable columns={columns} data={products} onRowAction={onRowAction}></SharedTable>
      </Container>
    </>
  );
};
export default Posts;
