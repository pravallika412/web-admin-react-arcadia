import { useLazyQuery } from "@apollo/client";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import { RETRIEVE_HANDLERS } from "../../shared/graphQL/handler/queries";
import { GET_SPONSORS_DETAILS, GET_SPONSORS_PRODUCT_DETAILS } from "../../shared/graphQL/sponsor";
import HandlerPosts from "./handlerPost";
import HandlerProfileComponent from "./handlerProfile";
import UserActivities from "./userActivities";

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

const HandlerDetailComponent = () => {
  const { id } = useParams();
  const [value, setValue] = useState(0);
  const [handlerData, setHandlerData] = useState([]);

  const [getHandlerDetails, { data: getHandlerDetailsData, loading: handlerDetailsLoading, refetch }] = useLazyQuery(RETRIEVE_HANDLERS);

  useEffect(() => {
    getHandlerDetails({ variables: { input: { id: id } } });
  }, []);

  useEffect(() => {
    if (getHandlerDetailsData) {
      setHandlerData(getHandlerDetailsData.retrieveHandler);
    }
  }, [getHandlerDetailsData]);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ m: 2 }}>
      {handlerDetailsLoading && <SuspenseLoader left={10} />}
      <HandlerProfileComponent handlerData={handlerData} />
      <Box sx={{ width: "100%", mt: 2 }}>
        <Tabs variant="scrollable" scrollButtons="auto" textColor="primary" indicatorColor="primary" value={value} onChange={handleChange} aria-label="core entity">
          <Tab label="User Activities" {...a11yProps(0)} />
          <Tab label="Posts" {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <UserActivities id={id} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <HandlerPosts id={id} />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default HandlerDetailComponent;
