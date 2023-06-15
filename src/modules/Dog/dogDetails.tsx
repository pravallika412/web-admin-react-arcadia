import { useLazyQuery } from "@apollo/client";
import { Grid, Icon, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Label from "../../shared/components/Label";
import { GET_PRODUCT_DETAILS } from "../../shared/graphQL/dog/queries";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const DogDetails = () => {
  const { id } = useParams();
  const [productData, setProductData] = useState(null);
  const [getProductDetails, { data: getProductDetailsData, loading: productDetailsLoading, refetch }] = useLazyQuery(GET_PRODUCT_DETAILS);

  useEffect(() => {
    getProductDetails({ variables: { input: { productId: id } } });
  }, []);

  useEffect(() => {
    if (getProductDetailsData) {
      console.log(JSON.parse(getProductDetailsData.retrieveProduct.productData));
      setProductData(JSON.parse(getProductDetailsData.retrieveProduct.productData));
    }
  }, [getProductDetailsData]);

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
  const getStatusLabel = (status: "active" | "inactive" | "suspended" | "atheaven" | "adopted"): JSX.Element => {
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
      case "atheaven":
        text = "At Heaven";
        color = "error";
        break;
      case "adopted":
        text = "Adopted";
        color = "success";
        break;
      default:
        color = "warning";
        text = "Inactive";
        break;
    }
    return <Label color={color as Color}>{text}</Label>;
  };

  return (
    <Box sx={{ m: 2 }}>
      <Box>
        {productData && (
          <>
            <Typography variant="h6" style={{ fontSize: 30, fontWeight: 700 }}>
              Details of {productData.name}
            </Typography>
            <Paper elevation={3} sx={{ padding: 1.5 }}>
              <Grid container spacing={2} gap={3}>
                <Grid item xs={2} display="flex" flexDirection="column">
                  <Box flexGrow={1} display="flex" flexDirection="column" sx={{ pe: 2 }}>
                    <Paper style={{ marginBottom: "16px", height: 164, width: 164 }}>
                      {productData.image && <img src={productData.image} alt="Sponsor" style={{ width: "100%", height: "100%" }} />}
                    </Paper>
                    <Typography variant="h6" style={{ fontSize: 16, fontWeight: 700, textAlign: "center" }}>
                      {productData.name}
                    </Typography>
                    <Typography variant="body1" style={{ textAlign: "center" }}>
                      {getStatusLabel(productData.status) || "N/A"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={9} sx={{ display: "flex", mt: 2 }}>
                  <Grid container spacing={2} gap={4}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: "flex", my: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                          Breed:
                        </Typography>
                        <Typography variant="body1">{productData.breed}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", my: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                          Age:
                        </Typography>
                        <Typography variant="body1">{productData?.age}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", my: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                          Height:
                        </Typography>
                        <Typography variant="body1">{productData?.height}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", my: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                          Weight:
                        </Typography>
                        <Typography variant="body1">{productData?.weight}</Typography>
                      </Box>
                    </Grid>
                    <Box sx={{ width: "0.5px", backgroundColor: "rgba(204, 204, 204, 1)", my: 3, mx: 2 }} />
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: "flex", my: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                          Gender:
                        </Typography>
                        <Typography variant="body1">{productData.gender}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", my: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                          Color:
                        </Typography>
                        <Typography variant="body1">{productData?.color}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", my: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                          Created on:
                        </Typography>
                        <Typography variant="body1">{new Date(productData.adoption_date).toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", my: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                          Total Posts:
                        </Typography>
                        <Typography variant="body1">{productData.totalPosts}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
            <Paper elevation={3} sx={{ padding: 1.5, mt: 2 }}>
              <Grid container spacing={2} gap={4}>
                <Grid item xs={12} md={5} ml={3}>
                  <Box sx={{ my: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                      Dog Sotry:
                    </Typography>
                    <Typography variant="body1">{productData.more_info.story}</Typography>
                  </Box>
                  <Box sx={{ my: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                      Service History:
                    </Typography>
                    <List>
                      {productData.more_info.history.map((historyItem, index) => (
                        <ListItem key={index} disablePadding sx={{ display: "flex", alignItems: "start" }}>
                          <Box sx={{ color: "#00385F", paddingRight: "10px", paddingTop: "5px", fontSize: 12 }}>
                            <FiberManualRecordIcon fontSize="inherit" />
                          </Box>
                          <Box>
                            <Typography variant="body1" sx={{ color: "#0A3B8A", fontSize: 14, fontWeight: 500 }}>
                              {historyItem.title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#808080", fontSize: 10 }}>
                              {formatDate(historyItem.fromDate)} - {formatDate(historyItem.toDate)}
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: 10 }}>
                              {historyItem.description}
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Box sx={{ my: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                      Awards Information:
                    </Typography>
                    <List>
                      {productData.more_info.awards.map((awardsItem, index) => (
                        <ListItem key={index} disablePadding sx={{ display: "flex", alignItems: "start" }}>
                          <Box sx={{ color: "#00385F", paddingRight: "10px", paddingTop: "5px", fontSize: 12 }}>
                            <FiberManualRecordIcon fontSize="inherit" />
                          </Box>
                          <Box>
                            <Typography variant="body1" sx={{ color: "#0A3B8A", fontSize: 14, fontWeight: 500 }}>
                              {awardsItem.title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#808080", fontSize: 10 }}>
                              {formatDate(awardsItem.fromDate)} - {formatDate(awardsItem.toDate)}
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>
                <Box sx={{ width: "0.5px", backgroundColor: "rgba(204, 204, 204, 1)", my: 3, mx: 2 }} />
                <Grid item xs={12} md={5}>
                  <Box sx={{ my: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                      Medical reports:
                    </Typography>

                    {productData.more_info.reports.map((reportsItem, index) => (
                      <ListItem key={index} disablePadding sx={{ display: "flex", alignItems: "start" }}>
                        <Box sx={{ color: "#00385F", paddingRight: "10px", paddingTop: "5px", fontSize: 12 }}>
                          <FiberManualRecordIcon fontSize="inherit" />
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ color: "#0A3B8A", fontSize: 14, fontWeight: 500 }}>
                            {reportsItem.title}
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#808080", fontSize: 10 }}>
                            {formatDate(reportsItem.fromDate)} - {formatDate(reportsItem.toDate)}
                          </Typography>
                          <Typography variant="body1" sx={{ fontSize: 10 }}>
                            {reportsItem.description}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </Box>
                  <Box sx={{ my: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                      Others:
                    </Typography>
                    {productData.more_info.others.map((otherItem, index) => (
                      <ListItem key={index} disablePadding sx={{ display: "flex", alignItems: "start" }}>
                        <Box sx={{ color: "#00385F", paddingRight: "10px", paddingTop: "5px", fontSize: 12 }}>
                          <FiberManualRecordIcon fontSize="inherit" />
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ color: "#0A3B8A", fontSize: 14, fontWeight: 500 }}>
                            {otherItem.documentName}
                          </Typography>
                          <Typography variant="body1" sx={{ fontSize: 10 }}>
                            {otherItem.documentType}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};
export default DogDetails;
