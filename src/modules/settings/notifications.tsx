import { useLazyQuery, useMutation } from "@apollo/client";
import { FormControlLabel, Grid, Skeleton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Switch, { SwitchProps } from "@mui/material/Switch";
import { useEffect, useState } from "react";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import { GET_ADMIN_NOTIFICATIONS, UPDATE_NOTIFICATIONS } from "../../shared/graphQL/settings/queries";

const IOSSwitch = styled((props: SwitchProps) => <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />)(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#FFFFFF",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

const Notifications = () => {
  const [notification, setNotification] = useState(null);
  const [getAdminNotifications, { data: getAdminNotificationData, loading: notificationLoader, refetch }] = useLazyQuery(GET_ADMIN_NOTIFICATIONS, { fetchPolicy: "no-cache" });
  const [updateNotification, { data: updateNotificationData, loading: updateloading }] = useMutation(UPDATE_NOTIFICATIONS);

  useEffect(() => {
    getAdminNotifications();
  }, []);

  useEffect(() => {
    if (getAdminNotificationData) {
      setNotification(getAdminNotificationData.GetAdminNotificationSettings);
    }
  }, [getAdminNotificationData]);

  useEffect(() => {
    if (updateNotificationData) {
      refetch();
    }
  }, [updateNotificationData]);

  const handleChange = (event) => {
    const { name, checked } = event.target;

    setNotification((prevNotification) => ({
      ...prevNotification,
      notification_types: {
        ...prevNotification.notification_types,
        [name]: checked,
      },
    }));

    // Make API call to update the notification setting based on the changed switch
    updateNotification({ variables: { input: { [name]: checked } } });
  };

  return (
    <Grid container spacing={2}>
      {updateloading && <SuspenseLoader left={10} />}
      {/* First Column (4 columns) */}
      <Grid item xs={12} sm={4}>
        {/* Reminder notifications */}
        <Typography variant="h4" sx={{ pt: 1 }}>
          {notificationLoader ? (
            <Skeleton width={200} height={50} variant="text" /> // Show skeleton loader for title while loading
          ) : (
            "Reminder Notifications"
          )}
        </Typography>
        <Typography variant="body1" sx={{ pt: 1, pr: 2 }}>
          {notificationLoader ? (
            <Skeleton width={300} height={50} variant="text" /> // Show skeleton loader for description while loading
          ) : (
            "These are notifications for comments on your posts and replies to your comments"
          )}
        </Typography>
      </Grid>

      <Grid item xs={12} sm={8}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            {notificationLoader ? (
              <Skeleton width={50} height={50} /> // Show skeleton loader for switch while loading
            ) : (
              <FormControlLabel control={<IOSSwitch sx={{ m: 1 }} name="inApp" checked={notification?.notification_types?.inApp} onChange={handleChange} />} label="In-app" />
            )}
          </Grid>
          <Grid item xs={12} sm={12}>
            {notificationLoader ? (
              <Skeleton width={50} height={50} /> // Show skeleton loader for switch while loading
            ) : (
              <FormControlLabel control={<IOSSwitch sx={{ m: 1 }} name="email" checked={notification?.notification_types?.email} onChange={handleChange} />} label="Email" />
            )}
          </Grid>
        </Grid>
      </Grid>
      {/* Add more columns here if needed */}

      <Grid item xs={12} sm={8} my={3}>
        <Typography variant="h6">Note: Notifications will not be received if it is turned off.</Typography>
      </Grid>
    </Grid>
  );
};
export default Notifications;
