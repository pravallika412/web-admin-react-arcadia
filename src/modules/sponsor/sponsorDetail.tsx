import { useLazyQuery } from "@apollo/client";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GET_SPONSORS_DETAILS } from "../../shared/graphQL/sponsor";
import DetailComponent from "./detail";
import SupportDogs from "./supportdogs";
import TransactionHistory from "./transactionhistory";

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
        <Box sx={{ py: 2 }}>
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

const SponsorDetailComponent = () => {
  const { id } = useParams();
  const [value, setValue] = useState(0);
  const [sponsorData, setSponsorData] = useState([]);

  const [getSponsorsDetails, { data: getSponsorDetailsData, loading: sponsorDetailsLoading, refetch }] = useLazyQuery(GET_SPONSORS_DETAILS);

  useEffect(() => {
    getSponsorsDetails({ variables: { input: { sponsorId: id } } });
  }, []);

  useEffect(() => {
    if (getSponsorDetailsData) {
      setSponsorData(getSponsorDetailsData.GetSponsorSubscriptionDetails);
    }
  }, [getSponsorDetailsData]);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ m: 2 }}>
      <DetailComponent sponsorData={sponsorData} />
      <Box sx={{ width: "100%", mt: 2 }}>
        <Tabs variant="scrollable" scrollButtons="auto" textColor="primary" indicatorColor="primary" value={value} onChange={handleChange} aria-label="core entity">
          <Tab label="Supported Dogs" {...a11yProps(0)} />
          <Tab label="Transaction History" {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <SupportDogs id={id} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <TransactionHistory id={id} />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default SponsorDetailComponent;
