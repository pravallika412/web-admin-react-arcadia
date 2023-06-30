import { Button, Chip, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, useTheme } from "@mui/material";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";

const NestedArray = ({ nestIndex, control, register, dataTypesEntity }) => {
  console.log(nestIndex, control, register);
  const theme = useTheme();
  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const { watch } = useForm();

  const {
    fields,
    remove: removeNestedSec,
    append: appendNestedSec,
  } = useFieldArray({
    control,
    name: `test.${nestIndex}.section`,
  });

  const handleDelete = (index) => {
    setWords(words.filter((_, i) => i !== index)); // remove the word at the given index
  };

  const handleChangeEnumType = (event) => {
    setText(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const word = text.trim().replace(/,/g, "");
      if (word) {
        setWords([...words, word]);
      }
      setText("");
    }
  };

  return (
    <>
      {fields.map((field, index) => {
        return (
          <div key={field.id}>
            <Grid container spacing={2} my={1}>
              <Grid item xs={6}>
                <TextField label="Field Name" variant="outlined" fullWidth {...register(`test.${nestIndex}.section.${index}.fieldName`)} />
              </Grid>
              <Grid item xs={5}>
                <Controller
                  name={`test.${nestIndex}.section.${index}.dataType`}
                  control={control} // assuming you have `control` from useForm()
                  render={({ field }) => (
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel id={`test.${nestIndex}.section.${index}.dataType`}>Field Type</InputLabel>
                      <Select labelId={`test.${nestIndex}.section.${index}.dataType`} label="Field Type" {...field}>
                        {dataTypesEntity.map((option) => (
                          <MenuItem key={option.order} value={option.order}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              {watch(`test.${nestIndex}.section.${index}.dataType`) === 5 && (
                <Grid item xs={11} md={11}>
                  <TextField
                    label="Enter text"
                    fullWidth
                    value={text}
                    InputProps={{
                      startAdornment: words.map((word, index) => <Chip key={index} label={word} onDelete={() => handleDelete(index)} />),
                    }}
                    {...register(`basicinfo.${index}.data`)}
                    onChange={handleChangeEnumType}
                    onKeyDown={handleKeyDown}
                  />
                </Grid>
              )}{" "}
              {index > 0 && ( // Only show the delete button from the second row onwards
                <Grid item xs={1} sx={{ display: "flex", justifyContent: "center" }}>
                  <IconButton
                    sx={{
                      "&:hover": { background: theme.colors.error.lighter },
                      color: theme.palette.error.main,
                    }}
                    color="inherit"
                    size="small"
                    onClick={() => removeNestedSec(index)}
                  >
                    <DeleteTwoToneIcon fontSize="small" />
                  </IconButton>
                </Grid>
              )}
              {index === 0 && (
                <Grid item xs={1} sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    onClick={() =>
                      appendNestedSec({
                        fieldName: "",
                        dataType: "",
                        data: "",
                      })
                    }
                    startIcon={<AddTwoToneIcon fontSize="small" />}
                  >
                    Add
                  </Button>
                </Grid>
              )}
            </Grid>
          </div>
        );
      })}
    </>
  );
};
export default NestedArray;
