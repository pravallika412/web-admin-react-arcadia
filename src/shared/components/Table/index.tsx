import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, IconButton, Toolbar, InputAdornment, TablePagination, Skeleton } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { debounce } from "lodash";
import { Link, useNavigate } from "react-router-dom";

const SharedTable = ({ columns, data, page, rowsPerPage, totalRows, onPageChange, onRowsPerPageChange, tableBodyLoader, onSearch, searchFilter, searchFilterVisible, selectableRows, onRowClick }) => {
  const [searchValue, setSearchValue] = useState("");
  const [visibleData, setVisibleData] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    updateVisibleData();
  }, [data, page, rowsPerPage, searchValue]);

  const handleChangePage = (event, newPage) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    onRowsPerPageChange(newRowsPerPage);
  };

  const handleSearchChange = debounce((value) => {
    onSearch && onSearch(value);
  }, 300);

  const updateVisibleData = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = Math.min((page + 1) * rowsPerPage, totalRows);
    const filteredData = data.filter((row) => {
      // Filter based on search value
      if (searchValue === "") {
        return true;
      }
      for (const column of columns) {
        const cellValue = row[column.id];
        if (cellValue && cellValue.toString().toLowerCase().includes(searchValue.toLowerCase())) {
          return true;
        }
      }
      return false;
    });
    const slicedData = filteredData;
    setVisibleData(slicedData);
  };

  const handleRowClick = (row) => {
    if (selectableRows) {
      onRowClick(row.id);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {searchFilterVisible && (
            <Box sx={{ m: 2 }}>
              <InputBase
                placeholder="Search…"
                sx={{
                  border: "1px solid #CCCCCC",
                  borderRadius: "6px",
                  width: "170px",
                  height: "36px",
                }}
                inputProps={{ "aria-label": "search" }}
                startAdornment={
                  <InputAdornment position="start">
                    <IconButton>
                      <SearchIcon color="info" />
                    </IconButton>
                  </InputAdornment>
                }
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </Box>
          )}
        </Box>
        {searchFilter}
      </Toolbar>

      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell key={index} sx={{ height: "43px", backgroundColor: "#E6F4FF", textTransform: "none", minHeight: "43px" }}>
                <Box sx={index === columns.length - 1 ? { display: "flex", justifyContent: "flex-end" } : {}}>{column.label}</Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableBodyLoader ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Skeleton variant="rectangular" animation="wave" height={400} />
              </TableCell>
            </TableRow>
          ) : visibleData.length > 0 ? (
            visibleData.map((row, rowIndex) => (
              <TableRow key={rowIndex} onClick={() => handleRowClick(row)} style={selectableRows ? { cursor: "pointer" } : {}}>
                {columns.map((column, index) => (
                  <TableCell key={index}>
                    <Box sx={index === columns.length - 1 ? { display: "flex", justifyContent: "flex-end" } : {}}>{row[column.id]}</Box>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell align="center" colSpan={6}>
                No results found!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
};

export default SharedTable;
