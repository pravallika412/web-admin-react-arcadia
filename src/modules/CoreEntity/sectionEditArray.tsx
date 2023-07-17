import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Select, MenuItem, IconButton, Grid, Typography, Button, useTheme } from "@mui/material";

import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";

const SecEdit = ({ datatypesMap, sectionData, onSectionDataChange, isEditMode }) => {
  const theme = useTheme();

  const [sections, setSections] = useState(sectionData);

  useEffect(() => {
    setSections(sectionData);
  }, [sectionData]);

  useEffect(() => {
    if (JSON.stringify(sections) !== JSON.stringify(sectionData)) {
      onSectionDataChange(sections);
    }
  }, [sections, sectionData, onSectionDataChange]);

  const handleAddRow = (sectionKey) => {
    const newField = {
      fieldName: "",
      dataType: 1,
      data: "",
      isNew: true,
    };

    setSections((prevSections) => ({
      ...prevSections,
      [sectionKey]: {
        ...prevSections[sectionKey],
        section_details: [...prevSections[sectionKey].section_details, newField],
      },
    }));
  };

  const handleRemoveRow = (sectionKey, rowIndex) => {
    setSections((prevSections) => {
      const section = prevSections[sectionKey];
      const sectionDetails = section.section_details.filter((field, index) => !(field.isNew && index === rowIndex));

      return {
        ...prevSections,
        [sectionKey]: {
          ...section,
          section_details: sectionDetails,
        },
      };
    });
  };

  const handleChange = (sectionKey, rowIndex, fieldKey, value) => {
    setSections((prevSections) => {
      const section = prevSections[sectionKey];
      const sectionDetails = [...section.section_details];
      sectionDetails[rowIndex][fieldKey] = value;

      return {
        ...prevSections,
        [sectionKey]: {
          ...section,
          section_details: sectionDetails,
        },
      };
    });
  };

  return (
    <Grid container spacing={2}>
      {Object.keys(sections).map((sectionKey) => {
        const section = sections[sectionKey];
        const sectionDetails = section.section_details;

        return (
          <Grid item xs={12} key={sectionKey}>
            <Typography variant="h6">{section.section_name}</Typography>
            {sectionDetails.map((field, index) => (
              <Grid container spacing={2} key={index}>
                <Grid item xs={6}>
                  <TextField
                    label="Field Name"
                    margin="normal"
                    value={field.fieldName}
                    disabled={!field.isNew}
                    fullWidth
                    onChange={(e) => handleChange(sectionKey, index, "fieldName", e.target.value)}
                  />
                </Grid>
                <Grid item xs={isEditMode ? 5 : 6}>
                  <Select label="Field Type" name="type" value={field.dataType} disabled={!field.isNew} onChange={(e) => handleChange(sectionKey, index, "dataType", e.target.value)} fullWidth>
                    {Object.keys(datatypesMap).map((key) => (
                      <MenuItem key={key} value={Number(key)}>
                        {datatypesMap[key].name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                {field.isNew && isEditMode && (
                  <Grid item xs={1}>
                    <IconButton
                      sx={{
                        "&:hover": { background: theme.colors.error.lighter },
                        color: theme.palette.error.main,
                      }}
                      onClick={() => handleRemoveRow(sectionKey, index)}
                    >
                      <DeleteTwoToneIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                )}
              </Grid>
            ))}
            {isEditMode && (
              <Grid container spacing={2}>
                <Grid item xs={11} /> {/* Empty grid item to push the AddCircle icon to the right */}
                <Grid item xs={1}>
                  {/* <IconButton onClick={() => handleAddRow(sectionKey)}>
                    <AddTwoToneIcon />
                  </IconButton> */}
                  <Button onClick={() => handleAddRow(sectionKey)} startIcon={<AddTwoToneIcon fontSize="small" />}>
                    Add
                  </Button>
                </Grid>
              </Grid>
            )}
          </Grid>
        );
      })}
    </Grid>
  );
};

export default SecEdit;
