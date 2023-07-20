import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
import { CREATE_ENTITY, GET_COREENTITY, GET_DATATYPES, UPDATE_ENTITY } from "../../shared/graphQL/core-entity/queries";
import { useLazyQuery, useMutation } from "@apollo/client";
import { makeStyles } from "@mui/styles";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Collection from "./collection";
import NestedArray from "./nestedArray";
import EditIcon from "@mui/icons-material/Edit";
import SecEdit from "./sectionEditArray";

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
interface CoreEntityFields {
  entity: {
    fieldName: string;
    dataType: number;
    data: any;
  }[];
  basicInformation: {
    fieldName: string;
    dataType: number;
    data: any;
  }[];
  aboutMe: {
    fieldName: string;
    dataType: number;
    data: any;
  }[];
  section: {
    [sectionName: string]: {
      section_name: string;
      section_details: {
        fieldName: string;
        dataType: number;
        data: any;
      }[];
    };
  };
}

const CoreEntity = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValues] = useState(0);
  const [isCoreEntity, setIsCoreEntity] = useState(false);
  const [coreEntityFields, setCoreEntityFields] = useState<CoreEntityFields>({
    entity: [],
    basicInformation: [],
    aboutMe: [],
    section: {},
  });
  const [dataTypesEntity, setDataTypesEntity] = useState([]);
  const [openEntity, setOpenEntity] = useState(false);
  const [getDataTypes, { data: getAllDataTypes }] = useLazyQuery(GET_DATATYPES);
  const [getCoreEntity, { data: getCoreEntityData, refetch }] = useLazyQuery(GET_COREENTITY, { fetchPolicy: "no-cache" });
  const [createEntity, { data: createEntityData }] = useMutation(CREATE_ENTITY);
  const [updateEntity, { data: updateEntityData }] = useMutation(UPDATE_ENTITY);
  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [additionalFields, setAdditionalFields] = useState([]);
  const [newFields, setNewFields] = useState([]);
  const fieldNamePattern = /^[A-Za-z]+$/;
  const [secOld, setSecOld] = useState({});
  const dogActivityOptions = ["running", "walking", "sleeping"];
  const statusOptions = ["active", "inactive"];
  const [dogActivitySelectedOptions, setDogActivitySelectedOptions] = useState(dogActivityOptions);
  const [statusSelectedOptions, setStatusSelectedOptions] = useState(statusOptions);
  const [dogActivityInputValue, setDogActivityInputValue] = useState("");
  const [statusInputValue, setStatusInputValue] = useState("");

  const defaultValues = isEditMode
    ? {
        collectionName: "",
        fields: [],
        basicinfo: [],
        aboutme: [],
        secEdit: [],
        test: [],
      }
    : {
        collectionName: "",
        fields: [],
        basicinfo: [
          {
            fieldName: "",
            dataType: 0,
            data: "",
          },
        ],
        aboutme: [
          {
            fieldName: "",
            dataType: 0,
            data: "",
          },
        ],
        secEdit: [],
        test: [
          {
            secName: "",
            section: [
              { fieldName: "", dataType: 0, data: "" },
              { fieldName: "", dataType: 0, data: "" },
            ],
          },
        ],
      };

  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const {
    fields: basicinfoFields,
    append: appendBasicInfo,
    remove: removeBasicInfo,
  } = useFieldArray({
    control,
    name: "basicinfo",
  });

  const {
    fields: aboutmeFields,
    append: appendAboutMe,
    remove: removeAboutMe,
  } = useFieldArray({
    control,
    name: "aboutme",
  });

  const {
    fields: secEditFields,
    append: appendSecEdit,
    remove: removeSecEdit,
  } = useFieldArray({
    control,
    name: "secEdit",
  });

  const {
    fields: secFields,
    append: appendSec,
    remove: removeSec,
  } = useFieldArray({
    control,
    name: "test",
  });

  useEffect(() => {
    getDataTypes();
    getCoreEntity();
  }, []);

  useEffect(() => {
    if (createEntityData) {
      setOpenEntity(true);
      refetch();
    }
  }, [createEntityData]);

  useEffect(() => {
    if (updateEntityData) {
      reset();
      setOpenEntity(true);
      refetch();
    }
  }, [updateEntityData]);

  useEffect(() => {
    if (getCoreEntityData) {
      if (getCoreEntityData.RetrieveCoreEntity.product_schema) {
        console.log(JSON.parse(getCoreEntityData.RetrieveCoreEntity.product_schema));
        const entityObject = JSON.parse(getCoreEntityData.RetrieveCoreEntity.product_schema).entity;
        const statusData = entityObject.find((field) => field.fieldName === "status")?.data || [];

        // Store statusData in localStorage
        localStorage.setItem("statusData", JSON.stringify(statusData));
        setSecOld(JSON.parse(getCoreEntityData.RetrieveCoreEntity.product_schema).section);
        setCoreEntityFields(JSON.parse(getCoreEntityData.RetrieveCoreEntity.product_schema));
        setIsCoreEntity(true);
      } else {
        setCoreEntityFields({
          entity: [],
          basicInformation: [],
          aboutMe: [],
          section: {},
        });
        setIsCoreEntity(false);
      }
    }
  }, [getCoreEntityData]);

  useEffect(() => {
    if (getAllDataTypes) {
      setDataTypesEntity(getAllDataTypes.retrieveDataTypes);
    }
  }, [getAllDataTypes]);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValues(newValue);
  };

  const onSubmit = (data) => {
    console.log(dogActivitySelectedOptions);
    console.log(statusSelectedOptions);
    const entityFields = [
      { fieldName: "name", dataType: 1, data: "" },
      { fieldName: "image", dataType: 7, data: "" },
      { fieldName: "status", dataType: 5, data: statusSelectedOptions },
    ];
    data.fields.unshift(...entityFields);

    const initialBasicInfoFields = [{ fieldName: "dogactivity", dataType: 5, data: dogActivitySelectedOptions }];
    data.basicinfo.unshift(...initialBasicInfoFields);

    const restructureDataField = (field) => {
      if (field.dataType === 5 && typeof field.data === "string") {
        field.data = words;
      } else if (field.dataType === 2 && field.data === "") {
        field.data = null;
      }
    };
    // Update data.fields
    data.fields.forEach(restructureDataField);

    // Update basicInformation
    data.basicinfo.forEach(restructureDataField);

    // Update aboutMe
    data.aboutme.forEach(restructureDataField);

    const restructuredData = {
      entity: data.fields.filter((field) => field.fieldName !== ""),
      basicInformation: data.basicinfo.filter((field) => field.fieldName !== ""),
      aboutMe: data.aboutme.filter((field) => field.fieldName !== ""),
      section: {},
    };

    // Map over the `test` array to transform the section details
    data.test.forEach((section, index) => {
      const sectionName = `section${index + 1}`;
      const sectionDetails = section.section.map((field) => ({
        fieldName: field.fieldName,
        dataType: field.dataType,
        data: field.dataType === 2 && field.data === "" ? null : field.data,
      }));

      if (section.secName != "") {
        restructuredData.section[sectionName] = {
          section_name: section.secName,
          section_details: sectionDetails.filter((field) => field.fieldName !== ""),
        };
      }
    });
    console.log(restructuredData);

    const payload = {
      collectionName: data.collectionName,
      fields: JSON.stringify(restructuredData),
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

  const handleEntityClose = () => {
    setOpenEntity(false);
    setIsEditMode(false);
    refetch();
  };

  function findUpdatedSection(newSec: any, oldSec: any): any {
    const updatedSection: any = {};

    for (const key in newSec) {
      if (newSec.hasOwnProperty(key)) {
        const newSectionDetails = newSec[key].section_details;
        const oldSectionDetails = oldSec[key].section_details;

        const updatedDetails = newSectionDetails.filter((newDetail: any) => {
          return !oldSectionDetails.some((oldDetail: any) => {
            return newDetail.fieldName === oldDetail.fieldName && newDetail.dataType === oldDetail.dataType && newDetail.data === oldDetail.data;
          });
        });

        if (updatedDetails.length > 0) {
          updatedSection[key] = {
            section_name: newSec[key].section_name,
            section_details: updatedDetails.map((detail: any) => {
              const { isNew, ...updatedDetail } = detail;
              return updatedDetail;
            }),
          };
        }
      }
    }

    return updatedSection;
  }

  const handleUpdate = () => {
    const formValues = getValues();
    const updatedSection = findUpdatedSection(coreEntityFields.section, secOld);
    const entity = formValues.fields.filter((field) => field.fieldName !== "");
    const basicinfo = formValues.basicinfo.filter((field) => field.fieldName !== "");
    const abtme = formValues.aboutme.filter((field) => field.fieldName !== "");

    const restructuredData = {
      entity: entity,
      basicInformation: basicinfo,
      aboutMe: abtme,
      section: updatedSection,
    };

    formValues.test.forEach((section, index) => {
      const sectionName = section.secName;
      const sectionDetails = section.section.map((field) => ({
        fieldName: field.fieldName,
        dataType: field.dataType,
        data: field.data,
      }));

      restructuredData.section[sectionName] = {
        section_name: section.secName,
        section_details: sectionDetails.filter((field) => field.fieldName !== ""),
      };
    });

    restructuredData.section = removeEmptyKeys(restructuredData.section) as any;
    console.log(restructuredData);
    setNewFields(newFields);
    const payload = {
      fields: JSON.stringify(restructuredData),
    };
    updateEntity({ variables: { input: payload } });
  };

  function removeEmptyKeys(obj) {
    const cleanedObj = { ...obj };

    delete cleanedObj[""];
    return Object.fromEntries(
      Object.entries(cleanedObj).filter(([key, value]) => {
        if (Array.isArray(value) && value.length === 0) {
          return false;
        }
        if (typeof value === "object" && value !== null && Object.keys(value).length === 0) {
          return false;
        }
        return true;
      })
    );
  }

  const handleSectionDataChange = (newSectionData) => {
    setCoreEntityFields((prevFields) => ({
      ...prevFields,
      section: newSectionData,
    }));
  };

  const MyComponent = () => (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={() => setIsEditMode(!isEditMode)}>{isEditMode ? "View" : "Edit"}</Button>
      </Box>

      <Box>
        <Typography variant="h4">Entity</Typography>
        <TextField label="Collection Name" margin="normal" value={getCoreEntityData && getCoreEntityData.RetrieveCoreEntity.product_table_name} disabled fullWidth />
        {coreEntityFields.entity &&
          coreEntityFields.entity.map((field, index) => (
            <Grid container spacing={2} key={index}>
              <Grid item xs={6}>
                <TextField label="Field Name" margin="normal" value={field.fieldName} disabled fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Field Type" name="type" margin="normal" value={datatypesMap[field.dataType].name} InputLabelProps={{ shrink: true }} disabled fullWidth />
                {field.dataType === 5 && <TextField label="Data" name="data" margin="normal" value={field.data.join("\n")} multiline rows={4} variant="outlined" fullWidth disabled />}
              </Grid>
            </Grid>
          ))}
      </Box>
      <Divider sx={{ my: 3 }} />
      <Box>
        <Typography variant="h4">About Me</Typography>
        {coreEntityFields.aboutMe &&
          coreEntityFields.aboutMe.map((field, index) => (
            <Grid container spacing={2} key={index}>
              <Grid item xs={6}>
                <TextField label="Field Name" margin="normal" value={field.fieldName} disabled fullWidth />
              </Grid>
              <Grid item xs={isEditMode ? 5 : 6}>
                <TextField label="Field Type" name="type" margin="normal" value={datatypesMap[field.dataType].name} InputLabelProps={{ shrink: true }} disabled fullWidth />
              </Grid>
              {isEditMode && index === coreEntityFields.aboutMe.length - 1 && (
                <Grid item xs={1}>
                  <Button sx={{ mt: 2 }} onClick={() => appendAboutMe({ fieldName: "", dataType: 0, data: "" })} startIcon={<AddTwoToneIcon fontSize="small" />}>
                    Add
                  </Button>
                </Grid>
              )}
            </Grid>
          ))}
        {isEditMode &&
          aboutmeFields.map((field, index) => (
            <div key={field.id}>
              <Grid container spacing={2} my={1}>
                <Grid item xs={6}>
                  <TextField label="Field Name" variant="outlined" fullWidth {...register(`aboutme.${index}.fieldName`)} />
                </Grid>
                <Grid item xs={5}>
                  <Controller
                    name={`aboutme.${index}.dataType`}
                    control={control} // assuming you have `control` from useForm()
                    render={({ field }) => (
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel id={`aboutme-${index}-label`}>Field Type</InputLabel>
                        <Select labelId={`aboutme-${index}-label`} label="Field Type" {...field}>
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
                {watch(`aboutme.${index}.dataType`) === 5 && (
                  <Grid item xs={11} md={11}>
                    <TextField
                      label="Enter text"
                      fullWidth
                      value={text}
                      InputProps={{
                        startAdornment: words.map((word, index) => <Chip key={index} label={word} onDelete={() => handleDelete(index)} />),
                      }}
                      {...register(`aboutme.${index}.data`)}
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
                    onClick={() => removeAboutMe(index)}
                  >
                    <DeleteTwoToneIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </Grid>
            </div>
          ))}
      </Box>
      <Divider sx={{ my: 3 }} />
      <Box>
        <Typography variant="h4">Basic Info</Typography>
        {coreEntityFields.basicInformation &&
          coreEntityFields.basicInformation.map((field, index) => (
            <Grid container spacing={2} key={index}>
              <Grid item xs={6}>
                <TextField label="Field Name" margin="normal" value={field.fieldName} disabled fullWidth />
              </Grid>
              <Grid item xs={isEditMode ? 5 : 6}>
                <TextField label="Field Type" name="type" margin="normal" value={datatypesMap[field.dataType].name} InputLabelProps={{ shrink: true }} disabled fullWidth />
              </Grid>
              {isEditMode && index === coreEntityFields.basicInformation.length - 1 && (
                <Grid item xs={1}>
                  <Button sx={{ mt: 2 }} onClick={() => appendBasicInfo({ fieldName: "", dataType: 0, data: "" })} startIcon={<AddTwoToneIcon fontSize="small" />}>
                    Add
                  </Button>
                </Grid>
              )}
            </Grid>
          ))}
        {isEditMode &&
          basicinfoFields.map((field, index) => (
            <div key={field.id}>
              <Grid container spacing={2} my={1}>
                <Grid item xs={6}>
                  <TextField label="Field Name" variant="outlined" fullWidth {...register(`basicinfo.${index}.fieldName`)} />
                </Grid>
                <Grid item xs={5}>
                  <Controller
                    name={`basicinfo.${index}.dataType`}
                    control={control} // assuming you have `control` from useForm()
                    render={({ field }) => (
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel id={`basicinfo-${index}-label`}>Field Type</InputLabel>
                        <Select labelId={`basicinfo-${index}-label`} label="Field Type" {...field}>
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
                {watch(`basicinfo.${index}.dataType`) === 5 && (
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
                )}
                <Grid item xs={1} sx={{ display: "flex", justifyContent: "center" }}>
                  <IconButton
                    sx={{
                      "&:hover": { background: theme.colors.error.lighter },
                      color: theme.palette.error.main,
                    }}
                    color="inherit"
                    size="small"
                    onClick={() => removeBasicInfo(index)}
                  >
                    <DeleteTwoToneIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </Grid>
            </div>
          ))}
      </Box>
      <Divider sx={{ my: 3 }} />
      <Grid container>
        <Grid item xs={10}>
          <Typography variant="h3">Sections</Typography>
        </Grid>
        {isEditMode && (
          <Grid item xs={2}>
            <Button variant="outlined" onClick={() => appendSec({ secName: "", section: [{ fieldName: "", dataType: 0, data: "" }] })} startIcon={<AddTwoToneIcon fontSize="small" />}>
              Add Section
            </Button>
          </Grid>
        )}
        <SecEdit datatypesMap={datatypesMap} sectionData={coreEntityFields.section} onSectionDataChange={handleSectionDataChange} isEditMode={isEditMode} />

        {/* {coreEntityFields.section &&
          Object.entries(coreEntityFields.section).map(([sectionName, section], index1) => (
            <>
              <Grid item xs={12} key={sectionName}>
                <Typography variant="h6">{section.section_name}</Typography>
                {section.section_details.map((field, index) => (
                  <Grid container spacing={2} key={index}>
                    <Grid item xs={6}>
                      <TextField label="Field Name" margin="normal" value={field.fieldName} disabled fullWidth />
                    </Grid>
                    <Grid item xs={isEditMode ? 5 : 6}>
                      <TextField label="Field Type" name="type" margin="normal" value={datatypesMap[field.dataType].name} InputLabelProps={{ shrink: true }} disabled fullWidth />
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </>
          ))} */}
      </Grid>

      {isEditMode &&
        secFields.map((field, index) => (
          <Box key={field.id} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={10}>
                <TextField label="Section Name" variant="outlined" fullWidth {...register(`test.${index}.secName`)} />
              </Grid>
              <Grid item xs={2}>
                <Button type="button" variant="outlined" onClick={() => removeSec(index)}>
                  Remove Section
                </Button>
              </Grid>
            </Grid>
            <NestedArray nestIndex={index} {...{ control, register, dataTypesEntity }} />
          </Box>
        ))}

      {isEditMode && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" onClick={handleUpdate}>
            Update
          </Button>
        </Box>
      )}
    </>
  );

  const handleDogActivityChipDelete = (chipToDelete) => () => {
    setDogActivitySelectedOptions((prevOptions) => prevOptions.filter((option) => option !== chipToDelete));
  };

  const handleStatusChipDelete = (chipToDelete) => () => {
    setStatusSelectedOptions((prevOptions) => prevOptions.filter((option) => option !== chipToDelete));
  };

  const handleDogActivityInputChange = (event) => {
    setDogActivityInputValue(event.target.value);
  };

  const handleStatusInputChange = (event) => {
    setStatusInputValue(event.target.value);
  };

  const handleDogActivityInputKeyDown = (event) => {
    if (event.key === "Enter" && dogActivityInputValue.trim() !== "") {
      setDogActivitySelectedOptions((prevOptions) => [...prevOptions, dogActivityInputValue]);
      setDogActivityInputValue("");
    }
  };

  const handleStatusInputKeyDown = (event) => {
    if (event.key === "Enter" && statusInputValue.trim() !== "") {
      setStatusSelectedOptions((prevOptions) => [...prevOptions, statusInputValue]);
      setStatusInputValue("");
    }
  };

  return (
    <>
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
                    <Collection />
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    {!isCoreEntity ? (
                      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <Box>
                          <Typography variant="h3">Entity</Typography>

                          <Grid container spacing={2}>
                            <Grid item xs={12}>
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
                                    value: /^[a-zA-Z]+$/,
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
                            </Grid>
                          </Grid>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <TextField label="Field Name" margin="normal" value="name" disabled fullWidth />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField label="Field Type" name="type" margin="normal" value="String" InputLabelProps={{ shrink: true }} disabled fullWidth></TextField>
                            </Grid>
                          </Grid>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <TextField label="Field Name" margin="normal" value="photo_url" disabled fullWidth />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField label="Field Type" name="type" margin="normal" value="File" InputLabelProps={{ shrink: true }} disabled fullWidth></TextField>
                            </Grid>
                          </Grid>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <TextField label="Field Name" margin="normal" value="status" disabled fullWidth />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField label="Field Type" name="type" margin="normal" value="Enum" InputLabelProps={{ shrink: true }} disabled fullWidth></TextField>
                            </Grid>
                            <Grid item xs={12}>
                              <Autocomplete
                                multiple
                                freeSolo
                                options={statusSelectedOptions}
                                value={statusSelectedOptions}
                                onChange={(event, newOptions) => {
                                  setStatusSelectedOptions(newOptions);
                                }}
                                onInputChange={handleStatusInputChange}
                                renderTags={(tagValue, getTagProps) =>
                                  tagValue.map((option, index) => {
                                    const isDisabled = option === "active" || option === "inactive";
                                    return (
                                      <Chip
                                        key={index}
                                        variant="outlined"
                                        label={option}
                                        onDelete={isDisabled ? undefined : () => handleStatusChipDelete(option)}
                                        {...getTagProps({ index })}
                                        disabled={isDisabled}
                                      />
                                    );
                                  })
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Options"
                                    placeholder="Add more options"
                                    fullWidth
                                    value={statusInputValue}
                                    onKeyDown={handleStatusInputKeyDown}
                                    onChange={handleStatusInputChange}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <Box>
                          <Typography variant="h3">Basic Information</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <TextField label="Field Name" margin="normal" value="dogactivity" disabled fullWidth />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField label="Field Type" name="type" margin="normal" value="Enum" InputLabelProps={{ shrink: true }} disabled fullWidth></TextField>
                            </Grid>
                            <Grid item xs={12}>
                              <Autocomplete
                                multiple
                                freeSolo
                                options={dogActivitySelectedOptions}
                                value={dogActivitySelectedOptions}
                                onChange={(event, newOptions) => {
                                  setDogActivitySelectedOptions(newOptions);
                                }}
                                onInputChange={handleDogActivityInputChange}
                                renderTags={(tagValue, getTagProps) =>
                                  tagValue.map((option, index) => {
                                    const isDisabled = option === "running" || option === "walking" || option === "sleeping";
                                    return (
                                      <Chip
                                        key={index}
                                        variant="outlined"
                                        label={option}
                                        onDelete={isDisabled ? undefined : () => handleDogActivityChipDelete(option)}
                                        {...getTagProps({ index })}
                                        disabled={isDisabled}
                                      />
                                    );
                                  })
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Options"
                                    placeholder="Add more activities"
                                    fullWidth
                                    value={dogActivityInputValue}
                                    onKeyDown={handleDogActivityInputKeyDown}
                                    onChange={handleDogActivityInputChange}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                          {basicinfoFields.map((field, index) => (
                            <div key={field.id}>
                              <Grid container spacing={2} my={1}>
                                <Grid item xs={6}>
                                  <TextField
                                    label="Field Name"
                                    variant="outlined"
                                    fullWidth
                                    {...register(`basicinfo.${index}.fieldName`, {
                                      pattern: {
                                        value: fieldNamePattern,
                                        message: "Field Name should only contain alphabets",
                                      },
                                    })}
                                    error={Boolean(errors?.basicinfo?.[index]?.fieldName)}
                                    helperText={errors?.basicinfo?.[index]?.fieldName?.message}
                                  />
                                </Grid>
                                <Grid item xs={5}>
                                  <Controller
                                    name={`basicinfo.${index}.dataType`}
                                    control={control} // assuming you have `control` from useForm()
                                    render={({ field }) => (
                                      <FormControl variant="outlined" fullWidth>
                                        <InputLabel id={`basicinfo-${index}-label`}>Field Type</InputLabel>
                                        <Select labelId={`basicinfo-${index}-label`} label="Field Type" {...field}>
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
                                {watch(`basicinfo.${index}.dataType`) === 5 && (
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
                                )}
                                {index > 0 && (
                                  <Grid item xs={1} sx={{ display: "flex", justifyContent: "center" }}>
                                    <IconButton
                                      sx={{
                                        "&:hover": { background: theme.colors.error.lighter },
                                        color: theme.palette.error.main,
                                      }}
                                      color="inherit"
                                      size="small"
                                      onClick={() => removeBasicInfo(index)}
                                    >
                                      <DeleteTwoToneIcon fontSize="small" />
                                    </IconButton>
                                  </Grid>
                                )}
                                {index === 0 && (
                                  <Grid item xs={1}>
                                    <Button onClick={() => appendBasicInfo({ fieldName: "", dataType: 0, data: "" })} startIcon={<AddTwoToneIcon fontSize="small" />}>
                                      Add
                                    </Button>
                                  </Grid>
                                )}
                              </Grid>
                            </div>
                          ))}
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <Box>
                          <Typography variant="h3">About me</Typography>
                          {aboutmeFields.map((field, index) => (
                            <div key={field.id}>
                              <Grid container spacing={2} my={1}>
                                <Grid item xs={6}>
                                  <TextField
                                    label="Field Name"
                                    variant="outlined"
                                    fullWidth
                                    {...register(`aboutme.${index}.fieldName`, {
                                      pattern: {
                                        value: fieldNamePattern,
                                        message: "Field Name should only contain alphabets",
                                      },
                                    })}
                                    error={Boolean(errors?.aboutme?.[index]?.fieldName)}
                                    helperText={errors?.aboutme?.[index]?.fieldName?.message}
                                  />
                                </Grid>
                                <Grid item xs={5}>
                                  <Controller
                                    name={`aboutme.${index}.dataType`}
                                    control={control} // assuming you have `control` from useForm()
                                    render={({ field }) => (
                                      <FormControl variant="outlined" fullWidth>
                                        <InputLabel id={`aboutme-${index}-label`}>Field Type</InputLabel>
                                        <Select labelId={`aboutme-${index}-label`} label="Field Type" {...field}>
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
                                {watch(`aboutme.${index}.dataType`) === 5 && (
                                  <Grid item xs={11} md={11}>
                                    <TextField
                                      label="Enter text"
                                      fullWidth
                                      value={text}
                                      InputProps={{
                                        startAdornment: words.map((word, index) => <Chip key={index} label={word} onDelete={() => handleDelete(index)} />),
                                      }}
                                      {...register(`aboutme.${index}.data`)}
                                      onChange={handleChangeEnumType}
                                      onKeyDown={handleKeyDown}
                                    />
                                  </Grid>
                                )}
                                {index > 0 && (
                                  <Grid item xs={1} sx={{ display: "flex", justifyContent: "center" }}>
                                    <IconButton
                                      sx={{
                                        "&:hover": { background: theme.colors.error.lighter },
                                        color: theme.palette.error.main,
                                      }}
                                      color="inherit"
                                      size="small"
                                      onClick={() => removeAboutMe(index)}
                                    >
                                      <DeleteTwoToneIcon fontSize="small" />
                                    </IconButton>
                                  </Grid>
                                )}
                                {index === 0 && (
                                  <Grid item xs={1}>
                                    <Button onClick={() => appendAboutMe({ fieldName: "", dataType: 0, data: "" })} startIcon={<AddTwoToneIcon fontSize="small" />}>
                                      Add
                                    </Button>
                                  </Grid>
                                )}
                              </Grid>
                            </div>
                          ))}
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <Box>
                          <Grid container spacing={2}>
                            <Grid item xs={10}>
                              <Typography variant="h3">Section</Typography>
                            </Grid>
                            <Grid item xs={2}>
                              <Button
                                variant="outlined"
                                onClick={() => appendSec({ secName: "", section: [{ fieldName: "", dataType: 0, data: "" }] })}
                                startIcon={<AddTwoToneIcon fontSize="small" />}
                              >
                                Add Section
                              </Button>
                            </Grid>
                          </Grid>
                          {secFields.map((field, index) => (
                            <Box key={field.id} sx={{ mt: 3 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={10}>
                                  <TextField
                                    label="Section Name"
                                    variant="outlined"
                                    fullWidth
                                    {...register(`test.${index}.secName`, {
                                      pattern: {
                                        value: /^(?! )[A-Za-z ]*$/,
                                        message: "Section Name should only contain alphabets",
                                      },
                                    })}
                                    error={Boolean(errors?.test?.[index]?.secName)}
                                    helperText={errors?.test?.[index]?.secName?.message}
                                  />
                                </Grid>
                                <Grid item xs={2}>
                                  {index > 0 && (
                                    <Button type="button" variant="outlined" onClick={() => removeSec(index)}>
                                      Remove Section
                                    </Button>
                                  )}
                                </Grid>
                              </Grid>
                              <NestedArray nestIndex={index} {...{ control, register, dataTypesEntity }} />
                            </Box>
                          ))}
                        </Box>
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
      <Dialog open={openEntity} onClose={handleEntityClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, m: 2 }} />
            <DialogContentText id="alert-dialog-description">Entity {isEditMode ? "updated" : "created"} successfully</DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEntityClose}>close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default CoreEntity;
