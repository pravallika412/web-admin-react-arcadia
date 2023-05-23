import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Box,
  Button,
  Card,
  CardMedia,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
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

const Posts = () => {
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [postStatuses, setPostStatuses] = useState(postStatuses1);
  const [reason, setReason] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [updatePost, { data: updatePostData }] = useMutation(REVIEW_POST);
  const [getFeed, { data: getFeedData, loading: feedLoading, refetch: refetchFeed }] = useLazyQuery(GET_FEED);
  const [getPostCount, { data: getPostCountData, loading: countLoading, refetch: refetchPostCount }] = useLazyQuery(GET_POST_COUNT);

  useEffect(() => {
    getFeed({ variables: { input: { pageDto: { page: page + 1, limit: rowsPerPage } } } });
    getPostCount();
  }, [page, rowsPerPage]);

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
      refetchFeed();
      refetchPostCount();
    }
  }, [updatePostData]);

  const handleClickOpen = (product) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setOpenDialog(false);
  };

  const handleOpenRejectDialog = () => {
    setOpenRejectDialog(true);
    setOpenDialog(false);
  };

  const handleApproval = async (data) => {
    updatePost({ variables: { input: { id: selectedProduct._id, status: data, rejectReason: data == "rejected" ? reason : null } } });
    handleClose(); // close the dialog
    handleCloseRejectDialog();
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
  };

  const handleChangeReason = (event) => {
    setReason(event.target.value);
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
        text = "Waiting";
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

  const formattedData = products.map((row) => ({
    product: (
      <>
        <div style={{ display: "flex" }}>
          {row.productData.image ? (
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
              <img src={row.productData.image} style={{ width: "45px", height: "45px", borderRadius: "50%" }} alt={row.productData.name} />
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
        <strong>{row.handlerData.name}</strong>
        <Typography sx={{ fontSize: "10px", fontWeight: 400 }}>WDF{row.handler}</Typography>
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
  }));

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
        <SharedTable
          columns={columns}
          data={formattedData}
          page={page}
          tableBodyLoader={feedLoading}
          rowsPerPage={rowsPerPage}
          totalRows={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        ></SharedTable>
      </Container>
      {selectedProduct && (
        <Dialog
          open={openDialog}
          onClose={handleClose}
          PaperProps={{
            style: {
              width: "1215",
              maxWidth: "100%",
              height: 472, // Ensure it does not exceed screen width
            },
          }}
        >
          <DialogTitle id="form-dialog-title">Details of Post</DialogTitle>
          <DialogContent sx={{ width: 1215 }}>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <Box sx={{ width: 648, m: 2 }}>
                <TextField
                  autoFocus
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
                    value={selectedProduct?.rejectionReason}
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
                      <Button variant="outlined" onClick={handleClose} color="primary">
                        Cancel
                      </Button>
                      <Box>
                        <Button variant="outlined" color="error" sx={{ mr: 1 }} onClick={handleOpenRejectDialog}>
                          Reject
                        </Button>
                        <Button variant="contained" onClick={() => handleApproval("approved")} color="success">
                          Approve
                        </Button>
                      </Box>
                    </Box>
                  )}
                </DialogActions>
              </Box>
              <Box sx={{ flexGrow: 1, width: 400, height: 200 }}>
                <Carousel showThumbs={false}>
                  {selectedProduct.post_gallery.map((media, index) =>
                    media.mime_type.startsWith("image") ? (
                      <div key={index}>
                        <img src={media.url} alt={selectedProduct.productData.name} />
                      </div>
                    ) : (
                      <div key={index}>
                        <video controls>
                          <source src={media.url} type={media.mime_type} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )
                  )}
                </Carousel>
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
        <DialogTitle>Reject Post</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ m: 1 }}>
            <InputLabel>Reason for Rejection</InputLabel>
            <Select value={reason} onChange={handleChangeReason} label="Reason for Rejection">
              <MenuItem value="low-quality">Low-quality content</MenuItem>
              <MenuItem value="offensive">Offensive or inaccurate content</MenuItem>
              <MenuItem value="plagiarism">Plagiarism on the post</MenuItem>
              <MenuItem value="inappropriate">Inappropriate description</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Button onClick={handleCloseRejectDialog} color="primary">
              Cancel
            </Button>
            <Button color="primary" onClick={() => handleApproval("rejected")}>
              Save
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default Posts;
