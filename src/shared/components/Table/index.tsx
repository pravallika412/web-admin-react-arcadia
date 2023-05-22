import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, IconButton, Toolbar, InputAdornment } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import VisibilityIcon from "@mui/icons-material/Visibility";

const SharedTable = ({ columns, data, onRowAction }) => {
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
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, index) => (
                <TableCell key={index}>
                  {column.id === "action" ? (
                    <IconButton onClick={() => onRowAction(row)}>
                      <VisibilityIcon />
                    </IconButton>
                  ) : (
                    row[column.id]
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SharedTable;
