import { useLazyQuery, useMutation } from "@apollo/client";
import { Button, DialogActions, DialogContent, DialogContentText, Grid, Icon, IconButton, List, ListItem, ListItemText, Paper, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Label from "../../shared/components/Label";
import { DELETE_PRODUCT, GET_PRODUCT_DETAILS } from "../../shared/graphQL/dog/queries";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import QRCode from "react-qr-code";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import DialogComponent from "../../shared/components/Dialog";
import { CloudDownload } from "@mui/icons-material";
import JSZip from "jszip";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import { Link } from "react-router-dom";

const DogDetails = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [openDelete, setOpenDelete] = useState(false);
  const [productData, setProductData] = useState(null);
  const [getProductDetails, { data: getProductDetailsData, loading: productDetailsLoading, refetch }] = useLazyQuery(GET_PRODUCT_DETAILS);
  const [deleteProduct, { data: deleteProductData }] = useMutation(DELETE_PRODUCT);
  const navigate = useNavigate();

  useEffect(() => {
    getProductDetails({ variables: { input: { customId: id } } });
  }, []);

  useEffect(() => {
    if (getProductDetailsData) {
      console.log(JSON.parse(getProductDetailsData.retrieveProduct.productData));
      setProductData(JSON.parse(getProductDetailsData.retrieveProduct.productData));
    }
  }, [getProductDetailsData]);

  useEffect(() => {
    if (deleteProductData) {
      navigate(`/dog`);
    }
  }, [deleteProductData]);

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

  const handleDeleteClick = (row) => {
    setOpenDelete(true);
  };

  const handleClose = (rw) => {
    setOpenDelete(false);
  };

  const handleDelete = () => {
    deleteProduct({ variables: { id: { id: id } } });
    setOpenDelete(false);
  };

  const handleEditClick = (row) => {
    console.log(row);
    navigate("/dog/stepper", { state: { row } });
  };

  const downloadFile = (fileUrl, fileName) => {
    console.log(fileUrl);
    fetch(fileUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("File download failed:", error);
      });
  };

  const downloadFilesAsZip = async (fileUrls) => {
    const zip = new JSZip();

    for (let i = 0; i < fileUrls.length; i++) {
      const fileUrl = fileUrls[i];
      const response = await fetch(fileUrl);
      const fileBlob = await response.blob();
      const fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
      zip.file(fileName, fileBlob);
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "files.zip";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  const formatValue = (value) => {
    console.log(value);
    const isDateUrl = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value);
    const isURL = /^(ftp|http|https):\/\/[^ "]+$/;

    if (isURL.test(value) && !Array.isArray(value)) {
      const fileName = value.substring(value.lastIndexOf("/") + 1);
      return (
        <span style={{ cursor: "pointer" }} onClick={() => downloadFile(value, fileName)}>
          <CloudDownload />
        </span>
      );
    }

    if (Array.isArray(value) && value.every((item) => isURL.test(item))) {
      return (
        <span style={{ cursor: "pointer" }} onClick={() => downloadFilesAsZip(value)}>
          <CloudDownload />
        </span>
      );
    }

    if (isDateUrl) {
      console.log("date", value);
      const date = new Date(value);
      const formattedDate = `${date.getUTCDate()}-${date.getUTCMonth() + 1}-${date.getUTCFullYear()}`;
      return formattedDate;
    }
    return value;
  };

  return (
    <Box sx={{ m: 2 }}>
      <Box>
        {productData && (
          <>
            <Box display="flex" justifyContent={"space-between"}>
              <Typography variant="h6" style={{ fontSize: 30, fontWeight: 700 }}>
                Details of {productData.name}
              </Typography>

              <div style={{ marginLeft: "auto" }}>
                <IconButton
                  sx={{
                    "&:hover": {
                      background: theme.colors.primary.lighter,
                    },
                    color: theme.palette.primary.main,
                  }}
                  color="inherit"
                  size="small"
                  onClick={() => handleEditClick(productData)}
                >
                  <EditTwoToneIcon fontSize="small" sx={{ color: "#0481D9" }} />
                </IconButton>

                <IconButton
                  sx={{
                    "&:hover": { background: theme.colors.error.lighter },
                    color: theme.palette.error.main,
                  }}
                  color="inherit"
                  size="small"
                  onClick={() => handleDeleteClick(productData)}
                >
                  <DeleteTwoToneIcon fontSize="small" />
                </IconButton>
              </div>
            </Box>
            <Paper elevation={3} sx={{ padding: 1.5 }}>
              <Grid container spacing={2}>
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
                <Grid item xs={10} sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: "flex", my: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                          Custom ID:
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: 16 }}>
                          {productData.custom_id}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: "flex", my: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                          Total Posts:
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: 16 }}>
                          {productData.totalPosts}
                        </Typography>
                      </Box>
                    </Grid>
                    {Object.entries(productData.basicInformation).map(([label, value], index) => (
                      <Grid item xs={12} md={6} key={label}>
                        <Box sx={{ display: "flex", my: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                            {label}:
                          </Typography>
                          <Typography variant="body1" sx={{ fontSize: 16 }}>
                            {value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
            <Paper elevation={3} sx={{ padding: 1.5, mt: 2 }}>
              <Grid container spacing={2} gap={4}>
                <Grid item xs={12} md={5} ml={3}>
                  {Object.entries(productData.aboutMe).map(([label, value], index) => (
                    <Box sx={{ my: 1 }} key={label}>
                      <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150, my: 1 }}>
                        {label}:
                      </Typography>
                      <Typography variant="body1">{value}</Typography>
                    </Box>
                  ))}
                  <Grid container spacing={2}>
                    {Object.values(productData.section).map((section: any, index) => (
                      <Grid item xs={12} key={index}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", my: 1, fontSize: 16 }}>
                          {section.section_name}
                        </Typography>
                        {Object.keys(section.section_details[0] || {}).length > 0 ? (
                          section.section_details.map((details, detailsIndex) => (
                            <Grid container spacing={2} key={`${detailsIndex}-${details.title}`}>
                              {Object.entries(details).map(([key, value]) => (
                                <Grid item xs={12} sm={6} md={12} key={`${key}-${detailsIndex}`}>
                                  <Box sx={{ display: "flex" }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 14, minWidth: 150 }}>
                                      {key}:
                                    </Typography>
                                    <Typography variant="body1" key={`${key}-${detailsIndex}`}>
                                      {formatValue(value)}
                                    </Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          ))
                        ) : (
                          <Typography variant="body1" key={`no-details-${index}`}>
                            No details available
                          </Typography>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                  {/* <Box sx={{ my: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                      Service History:
                    </Typography>
                    <List>
                      {productData?.section?.history.map((historyItem, index) => (
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
                      {productData?.section?.awards.map((awardsItem, index) => (
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
                  </Box> */}
                </Grid>
                {/* <Box sx={{ width: "0.5px", backgroundColor: "rgba(204, 204, 204, 1)", my: 3, mx: 2 }} />
                <Grid item xs={12} md={5}>
                  <Box sx={{ my: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                      Medical reports:
                    </Typography>

                    {productData?.section?.reports.map((reportsItem, index) => (
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
                </Grid> */}
              </Grid>
            </Paper>
          </>
        )}
      </Box>

      <DialogComponent
        open={openDelete}
        width={324}
        height={240}
        handleClose={handleClose}
        content={
          <DialogContent>
            <DialogContentText id="alert-dialog-description">Are you sure you want to delete this Dog?</DialogContentText>
          </DialogContent>
        }
        actions={
          <DialogActions>
            <Button onClick={handleClose}>No</Button>
            <Button onClick={handleDelete} autoFocus>
              Yes
            </Button>
          </DialogActions>
        }
      />
    </Box>
  );
};
export default DogDetails;
