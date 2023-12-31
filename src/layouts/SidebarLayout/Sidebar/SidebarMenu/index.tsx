import { useContext } from "react";

import { alpha, Box, List, styled, Button, ListItem } from "@mui/material";
import { NavLink as RouterLink, useLocation, useMatch } from "react-router-dom";
import { SidebarContext } from "../../../../shared/contexts/SidebarContext";

import DesignServicesTwoToneIcon from "@mui/icons-material/DesignServicesTwoTone";
import CheckBoxTwoToneIcon from "@mui/icons-material/CheckBoxTwoTone";
import SettingsIcon from "@mui/icons-material/Settings";
import PetsIcon from "@mui/icons-material/Pets";
import PersonIcon from "@mui/icons-material/Person";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import BarChartIcon from "@mui/icons-material/BarChart";
import CallToActionIcon from "@mui/icons-material/CallToAction";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

const MenuWrapper = styled(Box)(
  ({ theme }) => `
  .MuiList-root {
    padding: ${theme.spacing(1)};

    & > .MuiList-root {
      padding: 0 ${theme.spacing(0)} ${theme.spacing(1)};
    }
  }

    .MuiListSubheader-root {
      text-transform: uppercase;
      font-weight: bold;
      font-size: ${theme.typography.pxToRem(12)};
      color: ${theme.colors.alpha.trueWhite[50]};
      padding: ${theme.spacing(0, 2.5)};
      line-height: 1.4;
    }
`
);

const SubMenuWrapper = styled(Box)(
  ({ theme }) => `
    .MuiList-root {

      .MuiListItem-root {
        padding: 1px 0;

        .MuiBadge-root {
          position: absolute;
          right: ${theme.spacing(3.2)};

          .MuiBadge-standard {
            background: ${theme.colors.primary.main};
            font-size: ${theme.typography.pxToRem(10)};
            font-weight: bold;
            text-transform: uppercase;
            color: ${theme.palette.primary.contrastText};
          }
        }
    
        .MuiButton-root {
          display: flex;
          color: ${theme.colors.alpha.trueWhite[70]};
          background-color: transparent;
          width: 100%;
          justify-content: flex-start;
          padding: ${theme.spacing(1.2, 3)};

          .MuiButton-startIcon,
          .MuiButton-endIcon {
            transition: ${theme.transitions.create(["color"])};

            .MuiSvgIcon-root {
              font-size: inherit;
              transition: none;
            }
          }

          .MuiButton-startIcon {
            color: ${theme.colors.alpha.trueWhite[30]};
            font-size: ${theme.typography.pxToRem(20)};
            margin-right: ${theme.spacing(1)};
          }
          
          .MuiButton-endIcon {
            color: ${theme.colors.alpha.trueWhite[50]};
            margin-left: auto;
            opacity: .8;
            font-size: ${theme.typography.pxToRem(20)};
          }

          &.active,
          &:hover {
            background-color: ${theme.colors.primary.main};
            color: ${theme.colors.alpha.trueWhite[100]};

            .MuiButton-startIcon,
            .MuiButton-endIcon {
              color: ${theme.colors.alpha.trueWhite[100]};
            }
          }
        }

        &.Mui-children {
          flex-direction: column;

          .MuiBadge-root {
            position: absolute;
            right: ${theme.spacing(7)};
          }
        }

        .MuiCollapse-root {
          width: 100%;

          .MuiList-root {
            padding: ${theme.spacing(1, 0)};
          }

          .MuiListItem-root {
            padding: 1px 0;

            .MuiButton-root {
              padding: ${theme.spacing(0.8, 3)};

              .MuiBadge-root {
                right: ${theme.spacing(3.2)};
              }

              &:before {
                content: ' ';
                background: ${theme.colors.alpha.trueWhite[100]};
                opacity: 0;
                transition: ${theme.transitions.create(["transform", "opacity"])};
                width: 6px;
                height: 6px;
                transform: scale(0);
                transform-origin: center;
                border-radius: 20px;
                margin-right: ${theme.spacing(1.8)};
              }

              &.active,
              &:hover {

                &:before {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }
`
);

function SidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  let location = useLocation();

  return (
    <>
      <MenuWrapper>
        <List component="div">
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <Button disableRipple component={RouterLink} onClick={closeSidebar} to="/overview" startIcon={<BarChartIcon />}>
                  Dashboard
                </Button>
              </ListItem>
              <ListItem component="div">
                <Button disableRipple component={RouterLink} onClick={closeSidebar} to="/core-entity" startIcon={<DesignServicesTwoToneIcon />}>
                  Core Entity
                </Button>
              </ListItem>
              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/sponsors"
                  startIcon={<PeopleAltIcon />}
                  className={location.pathname.includes("sponsors") || location.pathname.includes("sponsordetails") ? "active" : ""}
                >
                  Sponsor
                </Button>
              </ListItem>

              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/handler"
                  startIcon={<PersonIcon />}
                  className={location.pathname.includes("handler") || location.pathname.includes("handlerdetails") ? "active" : ""}
                >
                  Handler
                </Button>
              </ListItem>
              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/dog"
                  startIcon={<PetsIcon />}
                  className={location.pathname.includes("dog") || location.pathname.includes("dogdetails") ? "active" : ""}
                >
                  Dog
                </Button>
              </ListItem>
              <ListItem component="div">
                <Button disableRipple component={RouterLink} onClick={closeSidebar} to="/posts" startIcon={<CallToActionIcon />}>
                  Posts
                </Button>
              </ListItem>
              <ListItem component="div">
                <Button disableRipple component={RouterLink} onClick={closeSidebar} to="/subscription" startIcon={<SubscriptionsIcon />}>
                  Subscription
                </Button>
              </ListItem>
              <ListItem component="div">
                <Button disableRipple component={RouterLink} onClick={closeSidebar} to="/settings" startIcon={<SettingsIcon />}>
                  Settings
                </Button>
              </ListItem>
            </List>
          </SubMenuWrapper>
        </List>
      </MenuWrapper>
    </>
  );
}

export default SidebarMenu;
