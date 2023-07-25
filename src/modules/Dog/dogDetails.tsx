import { useLazyQuery, useMutation } from "@apollo/client";
import { Button, DialogActions, DialogContent, DialogContentText, Grid, IconButton, InputLabel, Link as MuiLink, Paper, TextField, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Label from "../../shared/components/Label";
import { DELETE_PRODUCT, GET_PRODUCT_DETAILS, UPDATE_RFID } from "../../shared/graphQL/dog/queries";
import QRCode from "react-qr-code";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import DialogComponent from "../../shared/components/Dialog";
import { CloudDownload } from "@mui/icons-material";
import JSZip from "jszip";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import InfoIcon from "@mui/icons-material/Info";
import { useForm } from "react-hook-form";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const instructions = [
  "Open the NFC Tools application and locate the 'Write' button",
  "Click on the 'Write' button and a prompt will appear",
  "Select 'Add a record' from the prompt options",
  "On the new screen, click on the text field and enter the dog ID",
  "After entering the dog ID, confirm the input and return to the previous screen",
  "On the previous screen, click 'OK' to save the record. A new record will appear at the bottom",
  "Locate the 'Write/11 bytes' option and select it",
  "Now, prepare to scan the RF-ID by positioning it near the back of your phone",
  "The NFC Tools application will automatically close after successfully scanning the RF-ID",
];

const verificationSteps = ["After clicking on the 'Write' button, enter the dog ID in the designated field", "Then, click on the 'Read' button to display the RF-ID along with the associated dog ID"];

const DogDetails = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [openDelete, setOpenDelete] = useState(false);
  const [productData, setProductData] = useState(null);
  const [getProductDetails, { data: getProductDetailsData, loading: productDetailsLoading, refetch }] = useLazyQuery(GET_PRODUCT_DETAILS);
  const [deleteProduct, { data: deleteProductData }] = useMutation(DELETE_PRODUCT);
  const [updateRFID, { data: updateRFIDData }] = useMutation(UPDATE_RFID);
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [openRfidg, setOpenRfid] = useState(false);
  const [rfidError, setRfidError] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    getProductDetails({ variables: { input: { customId: id } } });
  }, []);

  useEffect(() => {
    if (getProductDetailsData) {
      setProductData(JSON.parse(getProductDetailsData.retrieveProduct.productData));
    }
  }, [getProductDetailsData]);

  useEffect(() => {
    if (deleteProductData) {
      navigate(`/dog`);
    }
  }, [deleteProductData]);

  useEffect(() => {
    if (updateRFIDData) {
      refetch();
      setOpenRfid(false);
    }
  }, [updateRFIDData]);

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
    setOpenRfid(false);
  };

  const handleDelete = () => {
    deleteProduct({ variables: { id: { id: id } } });
    setOpenDelete(false);
  };

  const handleEditClick = (row) => {
    navigate("/dog/stepper", { state: { row } });
  };

  const handleRFID = () => {
    setOpenRfid(true);
  };

  const downloadFile = (fileUrl, fileName) => {
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
    const isDateUrl = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value);
    const isURL = /^(ftp|http|https):\/\/[^ "]+$/;

    if (typeof value === "object" && value !== null) {
      return Object.values(value).join("");
    }

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
      const date = new Date(value);
      const formattedDate = `${date.getUTCDate()}-${date.getUTCMonth() + 1}-${date.getUTCFullYear()}`;
      return formattedDate;
    }
    return value;
  };

  const handleInfoClick = () => {
    setOpenDialog(true);
  };

  const onSubmit = (data) => {
    updateRFID({ variables: { input: { productId: productData._id, rfidTag: data.rfidData } } });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
  }, []);

  const InstructionListItem = ({ text }) => (
    <li>
      <Typography variant="body1" sx={{ fontWeight: 500, fontSize: 16 }}>
        {text}
      </Typography>
    </li>
  );

  const handleQRCodeClick = () => {
    const qrCodeSvgElement = document.querySelector("#qrCode");
    if (qrCodeSvgElement) {
      const svgContent = new XMLSerializer().serializeToString(qrCodeSvgElement);
      const dataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>QR Code</title>
            </head>
            <body style="display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0;">
              <img src="${dataUrl}" width="500" height="500" />
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        alert("Popup blocked. Please allow pop-ups for this site and try again.");
      }
    }
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
                <Grid item xs={2} md={2} display="flex" flexDirection="column">
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
                <Grid item xs={7} md={7} sx={{ mt: 2 }}>
                  <Grid container spacing={1}>
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
                          {productData?.totalPosts}
                        </Typography>
                      </Box>
                    </Grid>
                    {productData.basicInformation &&
                      Object.entries(productData.basicInformation).map(([label, value], index) => (
                        <Grid item xs={12} md={6} key={label}>
                          <Box sx={{ display: "flex", my: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                              {label.charAt(0).toUpperCase() + label.slice(1)}:
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: 16 }}>
                              {formatValue(value)}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                  </Grid>
                </Grid>
                <Grid item xs={3} md={3} sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Box sx={{ borderRadius: 0.5, border: "1px solid var(--font-400, #808080)", px: 1, pt: 1, pb: 0.5 }} onClick={handleQRCodeClick} style={{ cursor: "pointer" }}>
                      <QRCode id="qrCode" value={productData.custom_id} size={40} level="Q" />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 1 }}>
                    <Typography variant="body1">RF-ID</Typography>
                    <IconButton onClick={handleInfoClick}>
                      <InfoIcon sx={{ color: "#999999" }} fontSize="small" />
                      <span style={{ fontSize: "small" }}>:</span>
                    </IconButton>
                    {productData.rfid_tag != null && (
                      <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                        <Typography
                          variant="h5"
                          sx={{ borderRadius: 1, border: "1px solid var(--primary-300, #1EA2FF)", color: "#FFFFFF", background: "var(--primary-300, #1EA2FF)", padding: "3px 6px" }}
                        >
                          {productData.rfid_tag.length > 6 ? `${productData.rfid_tag.substring(0, 3)}...${productData.rfid_tag.substring(productData.rfid_tag.length - 3)}` : productData.rfid_tag}
                          <IconButton onClick={() => copyToClipboard(productData.rfid_tag ? productData.rfid_tag : "")} size="small">
                            <ContentCopyIcon fontSize="small" sx={{ color: "#FFFFFF" }} />
                          </IconButton>
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ borderRadius: 1, border: "1px solid var(--primary-500, #0360A1);" }}>
                      <IconButton
                        sx={{
                          "&:hover": {
                            background: theme.colors.primary.lighter,
                          },
                          color: theme.palette.primary.main,
                        }}
                        color="inherit"
                        size="small"
                        onClick={handleRFID}
                      >
                        <EditTwoToneIcon fontSize="small" sx={{ color: "#0481D9" }} />
                        {productData.rfid_tag === null && <Typography>Add</Typography>}
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            <Paper elevation={3} sx={{ padding: 1.5, mt: 2 }}>
              <Grid container spacing={2} gap={4}>
                <Grid item xs={12} md={12} ml={3}>
                  {productData.aboutMe && (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: "bold", my: 1, fontSize: 16 }}>
                        About Me
                      </Typography>
                      {Object.entries(productData.aboutMe).map(([label, value], index) => (
                        <Box sx={{ my: 1, display: "flex" }} key={label}>
                          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 14, minWidth: 150 }}>
                            {label.charAt(0).toUpperCase() + label.slice(1)}:
                          </Typography>
                          <Typography variant="body1">{formatValue(value)}</Typography>
                        </Box>
                      ))}
                    </>
                  )}
                  <Grid container spacing={2}>
                    {Object.values(productData.section).map((section: any, index) => (
                      <Grid item xs={12} key={index}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", my: 1, fontSize: 16 }}>
                          {section.section_name}
                        </Typography>
                        {Object.keys(section.section_details[0] || {}).length > 0 ? (
                          section.section_details.map((details, detailsIndex) => (
                            <Grid container spacing={2}>
                              {section.section_details.map((details, detailsIndex) => (
                                <Fragment key={`${detailsIndex}-${details.title}`}>
                                  {Object.entries(details).map(([key, value]) => (
                                    <Grid item xs={12} sm={6} md={6} key={`${key}-${detailsIndex}`}>
                                      <Box sx={{ display: "flex" }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 14, minWidth: 150 }}>
                                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                                        </Typography>
                                        <Typography variant="body1" key={`${key}-${detailsIndex}`}>
                                          {formatValue(value)}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  ))}
                                  {detailsIndex === 2 && <Grid item xs={12} sm={6} md={6} />}
                                </Fragment>
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
                </Grid>
              </Grid>
            </Paper>
          </>
        )}
      </Box>

      <DialogComponent
        open={openRfidg}
        width={496}
        height={286}
        handleClose={handleClose}
        content={
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <form onSubmit={handleSubmit(onSubmit)}>
                <InputLabel sx={{ fontSize: 20, fontWeight: 700, color: "#1A1A1A" }}>RF-ID</InputLabel>
                <TextField
                  autoFocus
                  margin="dense"
                  id="rfidData"
                  type="text"
                  fullWidth
                  {...register("rfidData", { required: true })}
                  error={!!errors["rfidData"]}
                  helperText={errors.rfidData ? "RFID  is required" : rfidError ? "RFID  is required" : ""}
                />
                <DialogActions>
                  <Button onClick={handleClose} variant="outlined">
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" autoFocus>
                    Save
                  </Button>
                </DialogActions>
              </form>
            </DialogContentText>
          </DialogContent>
        }
        actions={undefined}
      />

      <DialogComponent
        open={openDialog}
        width={720}
        height={750}
        handleClose={handleCloseDialog}
        content={
          <Box sx={{ maxHeight: "500px", overflowY: "auto" }}>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 18, textAlign: "center" }}>
              Instructions
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 18, marginBottom: "10px", mt: 1 }}>
              Steps
            </Typography>
            <ol style={{ listStyleType: "unset" }}>
              {instructions.map((step, index) => (
                <InstructionListItem key={index} text={step} />
              ))}
            </ol>

            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 18, marginBottom: "10px", mt: 1 }}>
              Verification Steps
            </Typography>
            <ol style={{ listStyleType: "unset" }}>
              {verificationSteps.map((step, index) => (
                <InstructionListItem key={index} text={step} />
              ))}
            </ol>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 18, marginBottom: "10px", mt: 1 }}>
              Reference
            </Typography>
            <ol style={{ listStyleType: "unset" }}>
              <Typography variant="body1" sx={{ fontWeight: 500, fontSize: 16 }}>
                Here are some popular NFC tools mobile apps for Android and iOS:
              </Typography>
              <li>
                <Typography variant="body1" sx={{ fontWeight: 500, fontSize: 16 }}>
                  Android:{" "}
                  <MuiLink href="https://play.google.com/store/apps/details?id=com.winningapps.nfctagreader" target="_blank" rel="noopener">
                    https://play.google.com/store/apps/details?id=com.winningapps.nfctagreader
                  </MuiLink>
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={{ fontWeight: 500, fontSize: 16 }}>
                  iOS:{" "}
                  <MuiLink href="https://apps.apple.com/us/app/nfc-tools/id1252962749" target="_blank" rel="noopener">
                    https://apps.apple.com/us/app/nfc-tools/id1252962749
                  </MuiLink>
                </Typography>
              </li>
            </ol>
          </Box>
        }
        actions={undefined}
      />
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
