import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, IconButton, Toolbar, InputAdornment, TablePagination, Skeleton } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import VisibilityIcon from "@mui/icons-material/Visibility";

const SharedTable = ({ columns, data, page, rowsPerPage, totalRows, onPageChange, onRowsPerPageChange, tableBodyLoader }) => {
  const [searchValue, setSearchValue] = useState("");
  const [visibleData, setVisibleData] = useState([]);

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

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

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

  return (
    <TableContainer component={Paper}>
      <Toolbar sx={{ justifyContent: "start" }}>
        <div />
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
            value={searchValue}
            onChange={handleSearchChange}
          />
        </Box>
      </Toolbar>

      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell
                key={index}
                sx={{
                  height: "43px",
                  backgroundColor: "#E6F4FF",
                  textTransform: "none",
                  minHeight: "43px",
                }}
              >
                {column.label}
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
          ) : (
            visibleData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, index) => (
                  <TableCell key={index}>{row[column.id]}</TableCell>
                ))}
              </TableRow>
            ))
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
