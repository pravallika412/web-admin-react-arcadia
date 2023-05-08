import { Box, Button, Card, CardContent, CardHeader, Divider, Grid, MenuItem, Select, Tab, Tabs, TextField, Typography } from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { CREATE_ENTITY, GET_DATATYPES } from "../../shared/graphQL/core-entity/queries";
import { useLazyQuery, useMutation } from "@apollo/client";

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

const CoreEntity = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [ageOptions, setAgeOptions] = useState([]);
  const [getDataTypes, { data: getAllDataTypes, refetch }] = useLazyQuery(GET_DATATYPES);
  const [createEntity, { data: createEntityData }] = useMutation(CREATE_ENTITY);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  useEffect(() => {
    getDataTypes();
  }, []);

  useEffect(() => {
    if (getAllDataTypes) {
      setAgeOptions(getAllDataTypes.retrieveDataTypes);
    }
  }, [getAllDataTypes]);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const onSubmit = (data) => {
    const initialFields = [
      { fieldName: "name", dataType: 1, data: "" },
      { fieldName: "photo_url", dataType: 7, data: "" },
      { fieldName: "status", dataType: 5, data: ["active", "inactive"] },
    ];
    data.fields.push(...initialFields);
    const payload = {
      collectionName: data.collectionName,
      fields: JSON.stringify(data.fields).replace(/"/g, '\\"'),
    };
    console.log(payload);
    createEntity({ variables: { input: payload } });
  };

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
                        <Button variant="contained" sx={{ mt: 2.5 }} onClick={() => append({ fieldName: "", dataType: "", data: "" })}>
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                    {fields.map((field, index) => (
                      <div key={field.id}>
                        <Grid container spacing={2} my={1}>
                          <Grid item xs={6}>
                            <TextField label="Name" variant="outlined" fullWidth {...register(`fields.${index}.fieldName`)} />
                          </Grid>
                          <Grid item xs={5}>
                            <Select label="Type" variant="outlined" defaultValue="" fullWidth {...register(`fields.${index}.dataType`)}>
                              {ageOptions.map((option) => (
                                <MenuItem key={option.order} value={option.order}>
                                  {option.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </Grid>
                          <Grid item xs={1}>
                            <Button variant="contained" sx={{ mt: 0.5 }} onClick={() => remove(index)}>
                              Remove
                            </Button>
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
