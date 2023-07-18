import { alpha, Badge, Box, CircularProgress, Divider, Grid, IconButton, Link, ListItem, Popover, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import NotificationsActiveTwoToneIcon from "@mui/icons-material/NotificationsActiveTwoTone";
import { styled } from "@mui/material/styles";

import { formatDistance, subDays } from "date-fns";
import { useLazyQuery, useMutation } from "@apollo/client";
import { MARK_ALL_READ, MARK_READ, SHOW_ADMIN_NOTIFICATIONS } from "../../../../../shared/graphQL/settings/queries";
import Dummy from "../../../../../assets/images/dummy.png";
import { useNavigate } from "react-router";
import { List } from "react-virtualized";
import { io } from "socket.io-client";

const NotificationsBadge = styled(Badge)(
  ({ theme }) => `
    
    .MuiBadge-badge {
        background-color: ${alpha(theme.palette.error.main, 0.1)};
        color: ${theme.palette.error.main};
        min-width: 16px; 
        height: 16px;
        padding: 0;

        &::after {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            box-shadow: 0 0 0 1px ${alpha(theme.palette.error.main, 0.3)};
            content: "";
        }
    }
`
);

function HeaderNotifications() {
  const ref = useRef<any>(null);
  const [isOpen, setOpen] = useState<boolean>(false);
  const [notificationData, setNotificationData] = useState([]);
  const [unReadCount, setUnReadCount] = useState<number>(0);
  const [markRead, { data: markReadData, loading: markReadLoader }] = useMutation(MARK_READ);
  const [markAllRead, { data: markAllReadData, loading: markAllReadLoader }] = useMutation(MARK_ALL_READ);
  const [showNotifications, { data: showNotificationData, loading: notificationLoader, refetch }] = useLazyQuery(SHOW_ADMIN_NOTIFICATIONS, { fetchPolicy: "no-cache" });
  const navigate = useNavigate();
  const [totalCount, setTotalCount] = useState<number>(0);
  const socket_url = process.env.WEBSOCKET_URL;
  const socket = io(socket_url);

  useEffect(() => {
    const id = localStorage.getItem("adminId");
    if (socket && id) {
      socket.on("connect", () => {
        socket.emit("userhandler", { userId: id, role: "admin" }, (response) => {
          console.log("userHandler", response);
        });
        socket.on("userConnected", (data) => {
          console.log("userConnected", data);
        });
        socket.on("receivedNotification", (data) => {
          console.log("receivedNotification", data);
          setUnReadCount((prevCount) => prevCount + 1);
        });
      });
    }
    socket.on("connect_error", (data) => {
      console.log("connect_error", data);
    });

    return () => {
      socket.disconnect();
      console.log("disconnected");
    };
  }, [socket]);

  useEffect(() => {
    showNotifications({ variables: { input1: { page: 1, limit: 200 }, input2: {} } });
  }, []);

  useEffect(() => {
    if (showNotificationData) {
      setNotificationData(showNotificationData.AdminInAppNotifications.notifications);

      setTotalCount(showNotificationData.AdminInAppNotifications.totalCount);
    }
  }, [showNotificationData]);

  useEffect(() => {
    if (markReadData) {
      refetch();
    }
  }, [markReadData]);

  useEffect(() => {
    if (markAllReadData) {
      refetch();
    }
  }, [markAllReadData]);

  const handleOpen = (): void => {
    setUnReadCount(0);
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleNotificationClick = (notification) => {
    if (notification) {
      markRead({ variables: { input: { id: notification._id } } });
      if (notification.notification_type === "post_created") {
        navigate("/posts");
        setOpen(false);
      }
    }
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  const rowRenderer = ({ index, style, key }) => {
    const notification = notificationData[index];
    if (!notification) {
      // Optionally render a placeholder or loading component here
      return null;
    }
    return (
      <ListItem
        key={key}
        style={style}
        sx={{
          p: 2,
          width: 700,
          display: { xs: "block", sm: "flex" },
          cursor: "pointer",
          "&:hover": {
            ...(notification.read === false && { background: "#E6F4FF" }),
          },
          ...(notification.read === false && { background: "#E6F4FF" }),
        }}
        onClick={() => handleNotificationClick(notification)}
      >
        <Grid container spacing={2}>
          <Grid item xs={6} md={1}>
            <Box sx={{ mr: 2 }}>{<img src={notification.image_url ? notification.image_url.url : Dummy} alt="image" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "50%" }} />}</Box>
          </Grid>
          <Grid item xs={6} md={9}>
            <Typography sx={{ fontWeight: "bold" }}>{notification.subject}</Typography>
            <Typography component="span" variant="body2" color="text.secondary">
              {notification.message}
            </Typography>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="caption" sx={{ textTransform: "none" }}>
              {formatDistance(subDays(new Date(notification.createdAt), 0), new Date(), {
                addSuffix: true,
              })}
            </Typography>
          </Grid>
        </Grid>
      </ListItem>
    );
  };

  return (
    <>
      <Tooltip arrow title="Notifications">
        <IconButton color="primary" ref={ref} onClick={handleOpen}>
          <NotificationsBadge
            badgeContent={unReadCount}
            max={10}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <NotificationsActiveTwoToneIcon />
          </NotificationsBadge>
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
        sx={{ top: 40, right: 5 }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ p: 2 }} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Notifications</Typography>
          <Typography variant="h5">
            <Link
              component="button"
              variant="inherit"
              color="primary"
              onClick={handleMarkAllRead}
              disabled={unReadCount === 0}
              sx={{
                opacity: unReadCount === 0 ? 0.5 : 1,
                cursor: unReadCount === 0 ? "unset" : "pointer",
              }}
            >
              Mark All Read
            </Link>
          </Typography>
        </Box>
        <Divider />
        <Box>
          {markAllReadLoader || markReadLoader ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 700, width: 700 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List width={700} height={700} overflow={"hidden"} rowCount={totalCount} rowHeight={100} rowRenderer={rowRenderer} />
          )}
        </Box>
      </Popover>
    </>
  );
}

export default HeaderNotifications;
