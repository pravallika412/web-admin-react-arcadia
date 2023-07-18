import { useEffect, useRef, useState } from "react";

import { NavLink, useNavigate } from "react-router-dom";

import { Avatar, Box, Button, Divider, Hidden, lighten, List, ListItem, ListItemText, Popover, Typography } from "@mui/material";

import { styled } from "@mui/material/styles";
import ExpandMoreTwoToneIcon from "@mui/icons-material/ExpandMoreTwoTone";
import AccountBoxTwoToneIcon from "@mui/icons-material/AccountBoxTwoTone";
import LockOpenTwoToneIcon from "@mui/icons-material/LockOpenTwoTone";
import AccountTreeTwoToneIcon from "@mui/icons-material/AccountTreeTwoTone";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_ADMIN } from "../../../../shared/graphQL/settings/queries";
import { LOGOUT } from "../../../../shared/graphQL/common/queries";

const UserBoxButton = styled(Button)(
  ({ theme }) => `
        padding-left: ${theme.spacing(1)};
        padding-right: ${theme.spacing(1)};
`
);

const MenuUserBox = styled(Box)(
  ({ theme }) => `
        background: ${theme.colors.alpha.black[5]};
        padding: ${theme.spacing(2)};
`
);

const UserBoxText = styled(Box)(
  ({ theme }) => `
        text-align: left;
        padding-left: ${theme.spacing(1)};
`
);

const UserBoxLabel = styled(Typography)(
  ({ theme }) => `
        font-weight: ${theme.typography.fontWeightBold};
        color: ${theme.palette.primary.main};
        display: block;
`
);

const UserBoxDescription = styled(Typography)(
  ({ theme }) => `
        color: ${lighten(theme.palette.primary.main, 0.5)}
`
);

function HeaderUserbox() {
  const [userData, setUserData] = useState({ first_name: "", profile_image: "" });
  const [getAdmin, { data: getAdminData, refetch }] = useLazyQuery(GET_ADMIN);
  const [adminLogout] = useMutation(LOGOUT, {
    onCompleted: (data) => {
      window.localStorage.clear();
      navigate("/");
    },
    onError: (error) => {
      console.log(error);
    },
  });
  useEffect(() => {
    getAdmin();
  }, []);

  useEffect(() => {
    if (getAdminData) {
      setUserData(getAdminData.getAdmin);
      localStorage.setItem("adminId", getAdminData.getAdmin._id);
      localStorage.setItem("membership_address", getAdminData.getAdmin.brandDetails.membership_contract_address);
    }
  }, [getAdminData]);

  const user = {
    name: userData.first_name,
    avatar: userData.profile_image,
    jobtitle: "Admin",
  };
  const navigate = useNavigate();
  const ref = useRef<any>(null);
  const [isOpen, setOpen] = useState<boolean>(false);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };
  const logout = () => {
    adminLogout();
    // client.resetStore()
  };

  return (
    <>
      <UserBoxButton color="primary" ref={ref} onClick={handleOpen}>
        <Avatar variant="rounded" alt={user.name} src={user.avatar} />
        <Hidden mdDown>
          <UserBoxText>
            <UserBoxLabel variant="body1" color="primary">
              {user.name}
            </UserBoxLabel>
            <UserBoxDescription variant="body2" color="primary">
              {user.jobtitle}
            </UserBoxDescription>
          </UserBoxText>
        </Hidden>
        <Hidden smDown>
          <ExpandMoreTwoToneIcon sx={{ ml: 1 }} />
        </Hidden>
      </UserBoxButton>
      <Popover
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{ top: 60 }}
      >
        <Box sx={{ m: 1 }}>
          <Button color="primary" onClick={logout} fullWidth>
            <LockOpenTwoToneIcon sx={{ mr: 1 }} />
            Sign out
          </Button>
        </Box>
      </Popover>
    </>
  );
}

export default HeaderUserbox;
