import { Grid, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import Label from "../../shared/components/Label";

const HandlerProfileComponent = ({ handlerData }) => {
  console.log(handlerData);

  if (!handlerData) {
    return null; // or return a placeholder or error message
  }

  const formatDate = (dateToFormat) => {
    const date = new Date(dateToFormat);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  type Color = "error" | "info" | "secondary";
  const getStatusLabel = (status: "active" | "inactive" | "suspended"): JSX.Element => {
    let color = "";
    let text = "";
    switch (status) {
      case "active":
        text = "Active";
        color = "success";
        break;
      case "inactive":
        text = "Inactive";
        color = "secondary";
        break;
      case "suspended":
        text = "Suspended";
        color = "error";
        break;
      default:
        color = "warning";
        text = "Inactive";
        break;
    }
    return <Label color={color as Color}>{text}</Label>;
  };

  return (
    <Box>
      <Typography variant="h6" style={{ fontSize: 30, fontWeight: 700 }}>
        Details of {handlerData.name}
      </Typography>

      <Paper elevation={3} sx={{ padding: 1.5 }}>
        <Grid container spacing={2} gap={3}>
          <Grid item xs={2} display="flex" flexDirection="column">
            <Box flexGrow={1} display="flex" flexDirection="column" sx={{ pe: 2 }}>
              <Paper style={{ marginBottom: "16px", height: 164, width: 164 }}>
                {handlerData.profile_picture && <img src={handlerData.profile_picture} alt="Sponsor" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />}
              </Paper>
              <Typography variant="h6" style={{ fontSize: 16, fontWeight: 700, textAlign: "center" }}>
                {handlerData.name}
              </Typography>
              <Typography variant="body1" style={{ textAlign: "center" }}>
                {getStatusLabel(handlerData.status) || "N/A"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={9} sx={{ display: "flex", mt: 2 }}>
            <Grid container spacing={2} gap={2}>
              <Grid item xs={12} md={5}>
                <Box sx={{ display: "flex", my: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                    Email Address:
                  </Typography>
                  <Typography variant="body1">{handlerData.email || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", my: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                    Handler ID:
                  </Typography>
                  <Typography variant="body1">{"WDF" + handlerData?.id}</Typography>
                </Box>
                <Box sx={{ display: "flex", my: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                    Created On:
                  </Typography>
                  <Typography variant="body1">{formatDate(handlerData.createdAt)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default HandlerProfileComponent;
