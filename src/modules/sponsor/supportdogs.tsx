import { useLazyQuery } from "@apollo/client";
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Label from "../../shared/components/Label";
import SharedTable from "../../shared/components/Table";
import { GET_SPONSORS_PRODUCT_DETAILS } from "../../shared/graphQL/sponsor";

const columns = [
  { id: "dogName", label: "Dog's Name" },
  { id: "createdOn", label: "Created On" },
  { id: "dogstatus", label: "Dog's Status" },
];

const dogStatus = [
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
  {
    id: "adopted",
    name: "Adopted",
  },
  {
    id: "atheaven",
    name: "At Heaven",
  },
  {
    id: "suspended",
    name: "Suspended",
  },
];

const SearchFilter = ({ handleStatusChange }) => {
  return (
    <Box width={160} sx={{ m: 1 }}>
      <FormControl fullWidth variant="outlined">
        <InputLabel>Dog Status</InputLabel>
        <Select onChange={(e) => handleStatusChange(e)} defaultValue={""} label="Post Status" autoWidth>
          {dogStatus.map((statusOption) => (
            <MenuItem key={statusOption.id} value={statusOption.id}>
              {statusOption.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

const SupportDogs = ({ id }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [sponsorProductData, setSponsorProductData] = useState([]);
  const [filters, setFilters] = useState({
    dogStatus: null,
  });
  const navigate = useNavigate();
  const [getSponsorProductDetails, { data: getSponsorProductDetailsData, loading: sponsorProductLoading }] = useLazyQuery(GET_SPONSORS_PRODUCT_DETAILS, { fetchPolicy: "no-cache" });

  useEffect(() => {
    getSponsorProductDetails({
      variables: { input: { sponsorId: id }, input1: { page: page + 1, limit: rowsPerPage }, input2: { status: filters.dogStatus }, input3: { name: searchValue ? searchValue : null } },
    });
  }, [page, rowsPerPage, searchValue, filters]);

  useEffect(() => {
    if (getSponsorProductDetailsData) {
      const parsedProducts = JSON.parse(getSponsorProductDetailsData.SponsorProducts.products[0].products);
      console.log(parsedProducts);
      setSponsorProductData(parsedProducts);
      setTotalCount(getSponsorProductDetailsData.SponsorProducts.totalCount);
    }
  }, [getSponsorProductDetailsData]);

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
      dogStatus: value,
    }));
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

  const handleRowClick = (id) => {
    console.log(id);
    navigate(`/dogdetails/${id}`);
  };

  const formattedData = sponsorProductData.map((row) => {
    let imageUrl = row.image || "";

    if (imageUrl.includes("?")) {
      imageUrl = imageUrl.split("?")[0];
    }

    return {
      id: row.custom_id,
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
              <strong>{row.name}</strong>
              <Typography sx={{ fontSize: "10px", fontWeight: 400 }}>WDF{row.product}</Typography>
            </div>
          </div>
        </>
      ),
      createdOn: formatDate(row.createdAt),
      dogstatus: getStatusLabel(row.status),
    };
  });

  return (
    <SharedTable
      columns={columns}
      data={formattedData}
      page={page}
      tableBodyLoader={sponsorProductLoading}
      rowsPerPage={rowsPerPage}
      totalRows={totalCount}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      onSearch={handleSearch}
      searchFilter={<SearchFilter handleStatusChange={handleStatusChange} />}
      searchFilterVisible={true}
      selectableRows={true}
      onRowClick={handleRowClick}
    />
  );
};
export default SupportDogs;
