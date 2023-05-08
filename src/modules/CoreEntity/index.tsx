import { Box, Button, Card, CardContent, CardHeader, Divider, Grid, Tab, Tabs, TextField, Typography } from "@mui/material";
import { SyntheticEvent, useState } from "react";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import { useForm } from "react-hook-form";

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

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const handleOpen = () => {
    setOpen(true);
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
                      <TextField
                        label="Entity Name"
                        name="entityName"
                        margin="normal"
                        fullWidth
                        required
                        {...register("entityName", {
                          required: {
                            value: true,
                            message: "Entity Name is required",
                          },
                          pattern: {
                            value: /^[A-Za-z][A-Za-z\s]*$/,
                            message: "Please enter valid entity name",
                          },
                          maxLength: {
                            value: 15,
                            message: "Max length exceeded",
                          },
                        })}
                        error={!!errors.entityName}
                        helperText={errors?.entityName?.message}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Entity Type"
                        name="entityType"
                        margin="normal"
                        required
                        fullWidth
                        {...register("entityType", {
                          required: {
                            value: true,
                            message: "Entity Type is required",
                          },
                          pattern: {
                            value: /^[A-Za-z][A-Za-z\s]*$/,
                            message: "Please enter valid entity type",
                          },
                          maxLength: {
                            value: 15,
                            message: "Max length exceeded",
                          },
                        })}
                        error={!!errors.entityType}
                        helperText={errors?.entityType?.message}
                        select
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Entity Name"
                        name="entityName"
                        margin="normal"
                        fullWidth
                        required
                        {...register("entityName", {
                          required: {
                            value: true,
                            message: "Entity Name is required",
                          },
                          pattern: {
                            value: /^[A-Za-z][A-Za-z\s]*$/,
                            message: "Please enter valid entity name",
                          },
                          maxLength: {
                            value: 15,
                            message: "Max length exceeded",
                          },
                        })}
                        error={!!errors.entityName}
                        helperText={errors?.entityName?.message}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Entity Type"
                        name="entityType"
                        margin="normal"
                        required
                        fullWidth
                        {...register("entityType", {
                          required: {
                            value: true,
                            message: "Entity Type is required",
                          },
                          pattern: {
                            value: /^[A-Za-z][A-Za-z\s]*$/,
                            message: "Please enter valid entity type",
                          },
                          maxLength: {
                            value: 15,
                            message: "Max length exceeded",
                          },
                        })}
                        error={!!errors.entityType}
                        helperText={errors?.entityType?.message}
                        select
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Entity Name"
                        name="entityName"
                        margin="normal"
                        fullWidth
                        required
                        {...register("entityName", {
                          required: {
                            value: true,
                            message: "Entity Name is required",
                          },
                          pattern: {
                            value: /^[A-Za-z][A-Za-z\s]*$/,
                            message: "Please enter valid entity name",
                          },
                          maxLength: {
                            value: 15,
                            message: "Max length exceeded",
                          },
                        })}
                        error={!!errors.entityName}
                        helperText={errors?.entityName?.message}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Entity Type"
                        name="entityType"
                        margin="normal"
                        required
                        fullWidth
                        {...register("entityType", {
                          required: {
                            value: true,
                            message: "Entity Type is required",
                          },
                          pattern: {
                            value: /^[A-Za-z][A-Za-z\s]*$/,
                            message: "Please enter valid entity type",
                          },
                          maxLength: {
                            value: 15,
                            message: "Max length exceeded",
                          },
                        })}
                        error={!!errors.entityType}
                        helperText={errors?.entityType?.message}
                        select
                      />
                    </Grid>
                  </Grid>
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
