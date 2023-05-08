import { useLazyQuery } from "@apollo/client";
import { Box, Card, CardContent, CardHeader, Divider, Grid, Tab, Tabs, TextField, Typography } from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import { GET_ADMIN } from "../../shared/graphQL/settings/queries";

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

const Settings = () => {
  const [value, setValue] = useState(0);
  const [email, setEmail] = useState("");
  const [getAdmin, { data: getAdminData, refetch }] = useLazyQuery(GET_ADMIN);

  useEffect(() => {
    getAdmin();
  }, []);

  useEffect(() => {
    if (getAdminData) setEmail(getAdminData.getAdmin.email);
  }, [getAdminData]);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Grid container justifyContent="end" alignItems="center" sx={{ ms: 2, mt: 2 }}>
      <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Settings" />
            <Divider />
            <CardContent>
              <Box sx={{ width: "100%" }}>
                <Tabs variant="scrollable" scrollButtons="auto" textColor="primary" indicatorColor="primary" value={value} onChange={handleChange} aria-label="core entity">
                  <Tab label="My Profile" {...a11yProps(0)} />
                  <Tab label="Change Password" {...a11yProps(1)} />
                  <Tab label="Notifications" {...a11yProps(2)} />
                  <Tab label="Wallet" {...a11yProps(3)} />
                  <Tab label="Transaction History" {...a11yProps(4)} />
                </Tabs>
                <TabPanel value={value} index={0}>
                  <Grid container>
                    <Grid item xs={6} md={8}>
                      <Typography variant="h4">My Profile</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={6}>
                          <TextField label="First Name" margin="normal" fullWidth />
                        </Grid>
                        <Grid item xs={6} md={6}>
                          <TextField label="Last Name" margin="normal" fullWidth></TextField>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} md={12}>
                        <TextField label="Email Address" value={email} margin="normal" InputLabelProps={{ shrink: true }} fullWidth />
                      </Grid>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={6}>
                          <TextField label="Phone Number" margin="normal" fullWidth />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={6} md={4}></Grid>
                  </Grid>
                </TabPanel>
                <TabPanel value={value} index={1}>
                  <Grid container>
                    <Typography variant="h4">Change Password</Typography>
                    <TextField label="Current Password" margin="normal" fullWidth />
                    <TextField label="New Password" margin="normal" fullWidth />
                    <TextField label="Confirm Password" margin="normal" fullWidth />
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

export default Settings;
