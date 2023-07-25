import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  TableCell,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import SharedTable from "../../shared/components/Table";
import { GET_FEED, GET_POST_COUNT, REVIEW_POST } from "../../shared/graphQL/post/queries";
import VisibilityIcon from "@mui/icons-material/Visibility";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import Label from "../../shared/components/Label";
import DialogComponent from "../../shared/components/Dialog";
import Transaction from "../../assets/images/personwaiting.gif";
import TransactionSubmitted from "../../assets/images/clock.gif";
import { makeStyles } from "@mui/styles";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import CancelIcon from "@mui/icons-material/Cancel";

const columns = [
  { id: "product", label: "Name of the dog", minWidth: 170 },
  { id: "handler", label: "Created By", minWidth: 170 },
  { id: "createdAt", label: "Created On", minWidth: 170 },
  { id: "status", label: "Post Status", type: "date", minWidth: 170 },
  { id: "action", label: "Action", minWidth: 170 },
];
const postStatuses1 = [
  { status: "Total Posts", count: 0, color: "#FFFFFF", borderColor: "#999999", countColor: "#4D4D4D" },
  { status: "Approved Posts", count: 0, color: "#F6FFFC", borderColor: "#2D9972", countColor: "#2D9972" },
  { status: "Pending Posts", count: 0, color: "#FFF9EE", borderColor: "#EE8212", countColor: "#EE8212" },
  { status: "Rejected Posts", count: 0, color: "#FFF5F5", borderColor: "#E6313C", countColor: "#E6313C" },
];

const postStatus = [
  {
    id: "all",
    name: "All",
  },
  {
    id: "approved",
    name: "Approved",
  },
  {
    id: "pending",
    name: "Pending",
  },
  {
    id: "rejected",
    name: "Rejected",
  },
];

const useStyles = makeStyles({
  carouselContainer: {
    width: 420,
    height: 280,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    objectFit: "cover",
    width: "100%",
    height: "100%",
  },
  carouselSlide: {
    width: "420px !important", // Set the desired width here
    "& .carousel.carousel-slider .control-arrow:hover": {
      background: "none",
    },
    "& .carousel.carousel-slider": {
      borderRadius: 5,
    },
  },
});

const GasFeeDialogContent = ({ gasFees }) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography sx={{ fontSize: "24px", fontWeight: 700 }}>Transaction History</Typography>
      <DialogContentText id="alert-dialog-description" sx={{ m: 2, fontWeight: 600, textAlign: "center" }}>
        <img src={Transaction} alt="GIF Image" />
        <Typography sx={{ fontSize: "18px", fontWeight: 500, color: "rgba(3, 96, 161, 1)" }}>Waiting for Confirmation.</Typography>
        <Typography sx={{ fontSize: "16px", fontWeight: 700 }}>Gas Fee - {gasFees} Matic</Typography>
      </DialogContentText>
    </Box>
  );
};

const GasFeeDialogActions = ({ handleClose, handlePostTransaction, updateLoading }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", m: 2 }}>
      <Button onClick={handleClose} color="error" variant="outlined">
        Reject
      </Button>
      <Button onClick={handlePostTransaction} color="primary" variant="contained" disabled={updateLoading}>
        Confirm
      </Button>
    </Box>
  );
};

const TransactionDialogContent = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <DialogContentText id="alert-dialog-description" sx={{ m: 2, fontWeight: 600, textAlign: "center" }}>
        <img src={TransactionSubmitted} alt="GIF Image" />
        <Typography sx={{ fontSize: "24px", fontWeight: 700 }}>Transaction Submitted</Typography>
        <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>Your transaction will be updated in a short period of time.</Typography>
      </DialogContentText>
    </Box>
  );
};

const TransactionDialogActions = ({ handleTransactionHash }) => {
  return (
    <Box sx={{ display: "flex", width: "100%", m: 2 }}>
      <Button onClick={handleTransactionHash} color="primary" variant="contained" sx={{ width: "100%" }}>
        View Transaction
      </Button>
    </Box>
  );
};

const SearchFilter = ({ handleStatusChange }) => {
  return (
    <Box width={160} sx={{ m: 1 }}>
      <FormControl fullWidth variant="outlined">
        <InputLabel>Post Status</InputLabel>
        <Select onChange={(e) => handleStatusChange(e)} label="Post Status" defaultValue={""} autoWidth>
          {postStatus.map((statusOption) => (
            <MenuItem key={statusOption.id} value={statusOption.id}>
              {statusOption.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

const Posts = () => {
  const classes = useStyles();
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [postStatuses, setPostStatuses] = useState(postStatuses1);
  const [reason, setReason] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [gasFees, setGasFees] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [postStatus, setPostStatus] = useState("");
  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [openTransactionModal, setOpenTransactionModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [errors, setErrors] = useState({ reason: null });
  const [filters, setFilters] = useState({
    feedStatus: null,
  });
  const [updatePost, { data: updatePostData, loading: updateLoading }] = useMutation(REVIEW_POST);
  const [getFeed, { data: getFeedData, loading: feedLoading, refetch: refetchFeed }] = useLazyQuery(GET_FEED);
  const [getPostCount, { data: getPostCountData, loading: countLoading, refetch: refetchPostCount }] = useLazyQuery(GET_POST_COUNT);

  useEffect(() => {
    getFeed({ variables: { input: { pageDto: { page: page + 1, limit: rowsPerPage }, search: searchValue, feedStatus: filters.feedStatus } } });
    getPostCount();
  }, [page, rowsPerPage, searchValue, filters]);

  useEffect(() => {
    if (getFeedData) {
      setProducts(getFeedData.listFeeds.feeds);
      setTotalCount(getFeedData.listFeeds.totalCount);
    }
  }, [getFeedData]);

  useEffect(() => {
    if (getPostCountData) {
      const { totalPosts, approvedPosts, pendingPosts, rejectedPosts } = getPostCountData.GetPostCounts;
      const updatedPostStatuses = [
        { status: "Total Posts", count: totalPosts, color: "#FFFFFF", borderColor: "#999999", countColor: "#4D4D4D" },
        { status: "Approved Posts", count: approvedPosts, color: "#F6FFFC", borderColor: "#2D9972", countColor: "#2D9972" },
        { status: "Pending Posts", count: pendingPosts, color: "#FFF9EE", borderColor: "#EE8212", countColor: "#EE8212" },
        { status: "Rejected Posts", count: rejectedPosts, color: "#FFF5F5", borderColor: "#E6313C", countColor: "#E6313C" },
      ];
      setPostStatuses(updatedPostStatuses);
    }
  }, [getPostCountData]);

  useEffect(() => {
    if (updatePostData) {
      if (updatePostData.reviewPost?.gasFees) {
        setGasFees(parseFloat(updatePostData.reviewPost.gasFees).toFixed(4));
        setOpenApprovalModal(true);
      } else if (updatePostData.reviewPost?.gasFees == null) {
        if (postStatus === "approved") {
          setOpenApprovalModal(false);
          setTransactionHash(updatePostData.reviewPost?.transaction_hash);
          setOpenTransactionModal(true);
          refetchFeed();
          refetchPostCount();
        } else if (postStatus === "rejected") {
          refetchFeed();
          refetchPostCount();
        }
      }
    }
  }, [updatePostData]);

  const handleClickOpen = (product) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleClose = () => {
    // setSelectedProduct(null);
    setOpenDialog(false);
  };

  const handleOpenRejectDialog = () => {
    setOpenRejectDialog(true);
    setOpenDialog(false);
  };

  const handleApproval = async (data) => {
    if (!reason && data === "rejected") {
      setErrors({ ...errors, reason: { message: "Please select a reason for rejection." } });
      return;
    }
    setPostStatus(data);
    updatePost({ variables: { input: { id: selectedProduct._id, status: data, getGasFees: data == "approved" ? true : false, rejectReason: data == "rejected" ? reason : null } } });
    handleClose(); // close the dialog
    handleCloseRejectDialog();
  };

  const handlePostTransaction = () => {
    updatePost({ variables: { input: { id: selectedProduct._id, status: "approved", getGasFees: false } } });
  };

  const handleTransactionHash = () => {
    const url = `https://mumbai.polygonscan.com/tx/${transactionHash}`;
    window.open(url, "_blank");
    setOpenTransactionModal(false);
  };

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setErrors({ ...errors, reason: null });
  };

  const handleChangeReason = (event) => {
    setReason(event.target.value);
    setErrors({ ...errors, reason: null });
  };

  const handleCloseGasFee = () => {
    setOpenApprovalModal(false);
  };

  const handleCloseTransaction = () => {
    setOpenTransactionModal(false);
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

  const handleStatusChange = (e: any): void => {
    const value = e.target.value === "all" ? null : e.target.value;
    setFilters((prevFilters) => ({
      ...prevFilters,
      feedStatus: value,
    }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rowperpage) => {
    const newRowsPerPage = parseInt(rowperpage, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset page when changing rows per page
  };

  type Color = "error" | "info" | "secondary";
  const getStatusLabel = (status: "approved" | "pending" | "rejected"): JSX.Element => {
    let color = "";
    let text = "";
    switch (status) {
      case "approved":
        text = "Approved";
        color = "success";
        break;
      case "pending":
        text = "Pending";
        color = "secondary";
        break;
      case "rejected":
        text = "Rejected";
        color = "error";
        break;
      default:
        color = "warning";
        text = "Inactive";
        break;
    }
    return <Label color={color as Color}>{text}</Label>;
  };

  const formattedData = products.map((row) => {
    let imageUrl = row.productData.image || "";

    if (imageUrl.includes("?")) {
      imageUrl = imageUrl.split("?")[0];
    }

    return {
      product: (
        <>
          <div style={{ display: "flex" }}>
            {imageUrl ? (
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
                <img src={imageUrl} style={{ width: "45px", height: "45px", borderRadius: "50%" }} alt={row.productData.name} />
              </div>
            ) : (
              ""
            )}
            <div style={{ alignItems: "center", paddingTop: "15px", paddingLeft: "10px" }}>
              <strong>{row.productData.name}</strong>
              <Typography sx={{ fontSize: "10px", fontWeight: 400 }}>WDF{row.product}</Typography>
            </div>
          </div>
        </>
      ),
      handler: (
        <>
          {row.handlerData.name != "Handler Deleted" ? (
            <>
              <strong>{row.handlerData.name}</strong>
              <Typography sx={{ fontSize: "10px", fontWeight: 400 }}>WDF{row.handler}</Typography>
            </>
          ) : (
            <Label color="error">{"Account Removed"}</Label>
          )}
        </>
      ),
      createdAt: formatDate(row.createdAt),
      status: getStatusLabel(row.status),
      action: (
        <Tooltip title="View">
          <IconButton onClick={() => handleClickOpen(row)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ),
    };
  });

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
                  {countLoading ? <Skeleton animation="wave" width={40} height={40} /> : <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: value.countColor }}>{value.count}</Typography>}
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 500 }}>{value.status}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
        {updateLoading && <SuspenseLoader left={10} />}
        <SharedTable
          columns={columns}
          data={formattedData}
          page={page}
          tableBodyLoader={feedLoading}
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
      </Container>

      {selectedProduct && (
        <Dialog
          open={openDialog}
          onClose={handleClose}
          PaperProps={{
            style: {
              width: "1057",
              maxWidth: "100%",
              height: 446, // Ensure it does not exceed screen width
            },
          }}
        >
          <DialogTitle id="form-dialog-title">
            <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }} alignItems="center">
              <Typography sx={{ fontSize: "20px", fontWeight: 700 }}>Details of Post</Typography>

              <IconButton edge="end" color="primary" onClick={handleClose} aria-label="close">
                <CancelIcon sx={{ fontSize: 30, color: "#0481D9" }} />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ width: 1057 }}>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <Carousel infiniteLoop={true} autoPlay={true} showThumbs={false} className={classes.carouselSlide} showStatus={false} interval={5000} showArrows={true}>
                {selectedProduct.post_gallery.map((item, index) => (
                  <div key={index} className={classes.carouselContainer}>
                    {item.mime_type.includes("image") ? (
                      <img src={item.url} alt={`Image ${index}`} className={classes.media} />
                    ) : item.mime_type.includes("video") ? (
                      <video src={item.url} className={classes.media} controls />
                    ) : (
                      <span>Unsupported media type</span>
                    )}
                  </div>
                ))}
              </Carousel>
              <Box sx={{ width: 648, mx: 2 }}>
                <TextField
                  margin="dense"
                  id="description"
                  value={selectedProduct.caption}
                  label="Description"
                  type="text"
                  fullWidth
                  multiline
                  rows={6}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                {selectedProduct.status === "rejected" && (
                  <TextField
                    margin="dense"
                    id="rejectionReason"
                    value={selectedProduct?.admin_feedback}
                    label="Reason for Rejection"
                    type="text"
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                )}
                <DialogActions>
                  {selectedProduct.status !== "approved" && selectedProduct.status !== "rejected" && (
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <Button variant="outlined" color="error" sx={{ mr: 1 }} onClick={handleOpenRejectDialog}>
                        Reject
                      </Button>
                      <Button variant="contained" onClick={() => handleApproval("approved")} color="success">
                        Approve
                      </Button>
                    </Box>
                  )}
                </DialogActions>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={openRejectDialog}
        onClose={handleCloseRejectDialog}
        PaperProps={{
          style: {
            width: "537px",
            maxWidth: "100%", // Ensure it does not exceed screen width
          },
        }}
      >
        <DialogTitle>Reject of Reject</DialogTitle>
        <DialogContent sx={{ overflow: "hidden" }}>
          <FormControl fullWidth sx={{ m: 1 }}>
            <InputLabel>Reason of Rejection</InputLabel>
            <Select value={reason} onChange={handleChangeReason} label="Reason for Rejection" error={!!errors.reason}>
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="Low-quality content">Low-quality content</MenuItem>
              <MenuItem value="Offensive or inaccurate content">Offensive or inaccurate content</MenuItem>
              <MenuItem value="Plagiarism on the post">Plagiarism on the post</MenuItem>
              <MenuItem value="Inappropriate description">Inappropriate description</MenuItem>
            </Select>
            {errors.reason && <FormHelperText error={!!errors.reason}>{errors.reason.message}</FormHelperText>}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Box display="flex" justifyContent="space-between" width="100%" sx={{ m: 2 }}>
            <Button onClick={handleCloseRejectDialog} color="primary" variant="outlined">
              Cancel
            </Button>
            <Button color="primary" onClick={() => handleApproval("rejected")} variant="contained">
              Save
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <DialogComponent
        open={openApprovalModal}
        width={448}
        height={520}
        handleClose={handleCloseGasFee}
        content={<GasFeeDialogContent gasFees={gasFees} />}
        actions={<GasFeeDialogActions handleClose={handleCloseGasFee} handlePostTransaction={handlePostTransaction} updateLoading={updateLoading} />}
      />
      <DialogComponent
        open={openTransactionModal}
        width={401}
        height={514}
        handleClose={handleCloseTransaction}
        content={<TransactionDialogContent />}
        actions={<TransactionDialogActions handleTransactionHash={handleTransactionHash} />}
      />
    </>
  );
};
export default Posts;
