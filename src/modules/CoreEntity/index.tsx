import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextareaAutosize,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { CREATE_ENTITY, GET_COREENTITY, GET_DATATYPES } from "../../shared/graphQL/core-entity/queries";
import { useLazyQuery, useMutation } from "@apollo/client";
import { makeStyles } from "@mui/styles";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
const useStyles = makeStyles((theme) => ({
  chipTextArea: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    minHeight: "80px",
    display: "flex",
    padding: "5px",
    flexWrap: "wrap",
  },
}));

const CoreEntity = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [isCoreEntity, setIsCoreEntity] = useState(false);
  const [dataTypesEntity, setDataTypesEntity] = useState([]);
  const [coreEntityFields, setCoreEntityFields] = useState([]);
  const [getDataTypes, { data: getAllDataTypes }] = useLazyQuery(GET_DATATYPES);
  const [getCoreEntity, { data: getCoreEntityData }] = useLazyQuery(GET_COREENTITY);
  const [createEntity, { data: createEntityData }] = useMutation(CREATE_ENTITY);
  const [text, setText] = useState("");
  const [words, setWords] = useState([]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  useEffect(() => {
    getDataTypes();
    getCoreEntity();
  }, []);

  useEffect(() => {
    if (getCoreEntityData) {
      setCoreEntityFields(JSON.parse(getCoreEntityData.retrieveCoreEntity.product_schema));
      setIsCoreEntity(true);
    }
  }, [getCoreEntityData]);

  useEffect(() => {
    if (getAllDataTypes) {
      setDataTypesEntity(getAllDataTypes.retrieveDataTypes);
    }
  }, [getAllDataTypes]);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const onSubmit = (data) => {
    console.log(data);
    const initialFields = [
      { fieldName: "name", dataType: 1, data: "" },
      { fieldName: "photo_url", dataType: 7, data: "" },
      { fieldName: "status", dataType: 5, data: ["active", "inactive"] },
    ];
    data.fields.push(...initialFields);
    data.fields.forEach((e) => {
      if (e.dataType == 5 && typeof e.data == "string") {
        e.data = e.data.split(",");
      }
    });
    const payload = {
      collectionName: data.collectionName,
      fields: JSON.stringify(data.fields),
    };
    createEntity({ variables: { input: payload } });
  };

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

  const datatypesMap = dataTypesEntity.reduce((acc, datatype) => {
    acc[datatype.order] = datatype;
    return acc;
  }, {});

  const MyComponent = () => (
    <>
      <Grid item xs={12}>
        <TextField label="Collection Name" margin="normal" value={getCoreEntityData && getCoreEntityData.retrieveCoreEntity.product_table_name} disabled fullWidth />
      </Grid>
      {coreEntityFields &&
        coreEntityFields.map((field, index) => {
          const datatype = datatypesMap[field.dataType];

          return (
            <Grid container spacing={2} key={index}>
              <Grid item xs={6}>
                <TextField label="Entity Name" margin="normal" value={field.fieldName} disabled fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Entity Type" name="type" margin="normal" value={datatype.name} InputLabelProps={{ shrink: true }} disabled fullWidth />
              </Grid>
              {datatype.name === "Enum" && field.data.length > 0 && (
                <>
                  <Grid item xs={6}></Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Data:</Typography>
                    <div className={classes.chipTextArea}>
                      {field.data.map((item, itemIndex) => (
                        <Chip label={item} key={itemIndex} />
                      ))}
                    </div>
                  </Grid>
                </>
              )}
            </Grid>
          );
        })}
    </>
  );

  return (
    <Grid container justifyContent="end" alignItems="center" sx={{ ms: 2, mt: 2 }}>
      <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Core Entity" />
            <Divider />
            <CardContent>
              <Box sx={{ width: "100%" }}>
                <Tabs variant="scrollable" scrollButtons="auto" textColor="primary" indicatorColor="primary" value={value} onChange={handleChange} aria-label="core entity">
                  <Tab label="Collection" {...a11yProps(0)} />
                  <Tab label="Entity" {...a11yProps(1)} />
                </Tabs>
                <TabPanel value={value} index={0}>
                  Collection
                </TabPanel>
                <TabPanel value={value} index={1}>
                  {!isCoreEntity ? (
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                      <TextField
                        label="Collection Name"
                        name="collectionName"
                        margin="normal"
                        required
                        fullWidth
                        {...register("collectionName", {
                          required: {
                            value: true,
                            message: "Collection Name is required",
                          },
                          pattern: {
                            value: /^[A-Za-z][A-Za-z\s]*$/,
                            message: "Please enter valid collection name",
                          },
                          maxLength: {
                            value: 15,
                            message: "Max length exceeded",
                          },
                        })}
                        error={!!errors.collectionName}
                        helperText={errors?.collectionName?.message}
                      />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField label="Entity Name" margin="normal" value="name" disabled fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label="Entity Type" name="type" margin="normal" value="String" InputLabelProps={{ shrink: true }} disabled fullWidth></TextField>
                        </Grid>
                      </Grid>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField label="Entity Name" margin="normal" value="photo_url" disabled fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label="Entity Type" name="type" margin="normal" value="File" InputLabelProps={{ shrink: true }} disabled fullWidth></TextField>
                        </Grid>
                      </Grid>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField label="Entity Name" margin="normal" value="status" disabled fullWidth />
                        </Grid>
                        <Grid item xs={5}>
                          <TextField label="Entity Type" name="type" margin="normal" value="Enum" InputLabelProps={{ shrink: true }} disabled fullWidth></TextField>
                        </Grid>
                        <Grid item xs={1}>
                          <Button sx={{ mt: 2.5 }} onClick={() => append({ fieldName: "", dataType: "", data: "" })} startIcon={<AddTwoToneIcon fontSize="small" />}>
                            Add
                          </Button>
                        </Grid>
                      </Grid>
                      {fields.map((field, index) => (
                        <div key={field.id}>
                          <Grid container spacing={2} my={1}>
                            <Grid item xs={6}>
                              <TextField label="Entity Name" variant="outlined" fullWidth {...register(`fields.${index}.fieldName`)} />
                            </Grid>
                            <Grid item xs={5}>
                              {/* <Select label="Entity Type" variant="outlined" defaultValue="" fullWidth {...register(`fields.${index}.dataType`)}>
                                {dataTypesEntity.map((option) => (
                                  <MenuItem key={option.order} value={option.order}>
                                    {option.name}
                                  </MenuItem>
                                ))}
                              </Select> */}
                              <Controller
                                name={`fields.${index}.dataType`}
                                control={control} // assuming you have `control` from useForm()
                                defaultValue=""
                                render={({ field }) => (
                                  <FormControl variant="outlined" fullWidth>
                                    <InputLabel id={`fields-${index}-label`}>Entity Type</InputLabel>
                                    <Select labelId={`fields-${index}-label`} label="Entity Type" {...field}>
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
                            {watch(`fields.${index}.dataType`) === 5 && (
                              <Grid item xs={11} md={11}>
                                <TextField
                                  label="Enter text"
                                  fullWidth
                                  value={text}
                                  InputProps={{
                                    startAdornment: words.map((word, index) => <Chip key={index} label={word} onDelete={() => handleDelete(index)} />),
                                  }}
                                  {...register(`fields.${index}.data`)}
                                  onChange={handleChangeEnumType}
                                  onKeyDown={handleKeyDown}
                                />
                              </Grid>
                            )}
                            <Grid item xs={1} sx={{ display: "flex", justifyContent: "center" }}>
                              <IconButton
                                sx={{
                                  "&:hover": { background: theme.colors.error.lighter },
                                  color: theme.palette.error.main,
                                }}
                                color="inherit"
                                size="small"
                                onClick={() => remove(index)}
                              >
                                <DeleteTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </div>
                      ))}
                      <Grid sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="contained" type="submit">
                          Create
                        </Button>
                      </Grid>
                    </Box>
                  ) : (
                    <MyComponent />
                  )}
                </TabPanel>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default CoreEntity;
