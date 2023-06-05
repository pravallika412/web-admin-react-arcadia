import { useLazyQuery } from "@apollo/client";
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Label from "../../shared/components/Label";
import SharedTable from "../../shared/components/Table";
import { GET_HANDLER_FEED } from "../../shared/graphQL/handler/queries";

const columns = [
  { id: "postID", label: "Post ID", minWidth: 170 },
  { id: "dogName", label: "Name of Dog", minWidth: 170 },
  { id: "description", label: "Description", minWidth: 170 },
  { id: "createdOn", label: "Created On", minWidth: 170 },
  { id: "status", label: "Post Status", minWidth: 170 },
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

const SearchFilter = ({ handleStatusChange }) => {
  return (
    <Box width={160} sx={{ m: 1 }}>
      <FormControl fullWidth variant="outlined">
        <InputLabel>Dog Status</InputLabel>
        <Select onChange={(e) => handleStatusChange(e)} defaultValue={""} label="Post Status" autoWidth>
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

const HandlerPosts = ({ id }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [handlerFeedData, setHandlerFeedData] = useState([]);
  const [filters, setFilters] = useState({
    feedStatus: null,
  });

  const [getHandlerFeed, { data: getHandlerFeedData, loading: handlerFeedLoading }] = useLazyQuery(GET_HANDLER_FEED);

  useEffect(() => {
    getHandlerFeed({ variables: { input1: { id: id }, input2: { search: searchValue, feedStatus: filters.feedStatus, pageDto: { page: page + 1, limit: rowsPerPage } } } });
  }, [page, rowsPerPage, searchValue, filters]);

  useEffect(() => {
    if (getHandlerFeedData) {
      setHandlerFeedData(getHandlerFeedData.RetrieveHandlerProductsFeeds.productsFeeds);
      setTotalCount(getHandlerFeedData?.RetrieveHandlerProductsFeeds.totalCount);
    }
  }, [getHandlerFeedData]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rowperpage) => {
    const newRowsPerPage = parseInt(rowperpage, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset page when changing rows per page
  };

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleStatusChange = (e: any): void => {
    const value = e.target.value === "all" ? null : e.target.value;
    setFilters((prevFilters) => ({
      ...prevFilters,
      feedStatus: value,
    }));
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

  const formattedData = handlerFeedData.map((row) => {
    console.log(handlerFeedData);
    let imageUrl = row.product.image || "";

    if (imageUrl.includes("?")) {
      imageUrl = imageUrl.split("?")[0];
    }

    return {
      postID: "WDF" + row._id,
      dogName: (
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
                <img src={imageUrl} style={{ width: "45px", height: "45px", borderRadius: "50%" }} alt={row.name} />
              </div>
            ) : (
              ""
            )}
            <div style={{ alignItems: "center", paddingTop: "15px", paddingLeft: "10px" }}>
              <strong>{row.product.name ? row.product.name : "N/A"}</strong>
              <Typography sx={{ fontSize: "10px", fontWeight: 400 }}>WDF{row.product._id ? row.product._id : ""}</Typography>
            </div>
          </div>
        </>
      ),
      description: row.caption ? row.caption : "",
      createdOn: row.createdAt ? formatDate(row.createdAt) : "",
      status: row.status ? getStatusLabel(row.status) : "",
    };
  });

  return (
    <SharedTable
      columns={columns}
      data={formattedData}
      page={page}
      tableBodyLoader={handlerFeedLoading}
      rowsPerPage={rowsPerPage}
      totalRows={totalCount}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      onSearch={handleSearch}
      searchFilter={<SearchFilter handleStatusChange={handleStatusChange} />}
      searchFilterVisible={true}
      selectableRows={false}
      onRowClick={undefined}
    />
  );
};
export default HandlerPosts;
