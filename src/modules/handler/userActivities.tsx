import { useLazyQuery } from "@apollo/client";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import SharedTable from "../../shared/components/Table";
import { HANDLER_ACTIVITIES } from "../../shared/graphQL/handler/queries";

const columns = [
  { id: "dogName", label: "Dog Allotted", minWidth: 170 },
  { id: "posts", label: "Posts", minWidth: 170 },
  { id: "loginDate", label: "Login Date", minWidth: 170 },
  { id: "loginTime", label: "Login Time", minWidth: 170 },
];

const UserActivities = ({ id }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [handlerActivityData, setHandlerActivityDataa] = useState([]);
  const [filters, setFilters] = useState({
    dogStatus: null,
  });

  const [getHandlerActivities, { data: getHandlerActivitiesData, loading: handlerActivitytLoading }] = useLazyQuery(HANDLER_ACTIVITIES);

  useEffect(() => {
    getHandlerActivities({ variables: { input1: { id: id }, input2: { search: searchValue, pageDto: { page: page + 1, limit: rowsPerPage } } } });
  }, [page, rowsPerPage, searchValue, filters]);

  useEffect(() => {
    if (getHandlerActivitiesData) {
      setHandlerActivityDataa(getHandlerActivitiesData.HandlerActivities.handlerActivities);
      setTotalCount(getHandlerActivitiesData?.HandlerActivities.totalCount);
    }
  }, [getHandlerActivitiesData]);

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

  const formattedData = handlerActivityData.map((row) => {
    let imageUrl = row.product.image || "";

    if (imageUrl.includes("?")) {
      imageUrl = imageUrl.split("?")[0];
    }

    return {
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
      posts: row.post_count ? row.post_count : 0,
      loginDate: row.login_date ? formatDate(row.login_date) : "",
      loginTime: row.login_time ? row.login_time : "",
    };
  });

  return (
    <SharedTable
      columns={columns}
      data={formattedData}
      page={page}
      tableBodyLoader={handlerActivitytLoading}
      rowsPerPage={rowsPerPage}
      totalRows={totalCount}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      onSearch={handleSearch}
      searchFilter={undefined}
      searchFilterVisible={true}
      selectableRows={false}
      onRowClick={undefined}
    />
  );
};
export default UserActivities;
