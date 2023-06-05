import { Grid, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import Label from "../../shared/components/Label";

const DetailComponent = ({ sponsorData }) => {
  const { sponsor, subscription_end_date, planDetails } = sponsorData;

  if (!sponsor) {
    return null; // or return a placeholder or error message
  }

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
        Details of {sponsor.name}
      </Typography>

      <Paper elevation={3} sx={{ padding: 1.5 }}>
        <Grid container spacing={2} gap={3}>
          <Grid item xs={2} display="flex" flexDirection="column">
            <Box flexGrow={1} display="flex" flexDirection="column" sx={{ pe: 2 }}>
              <Paper style={{ marginBottom: "16px", height: 164, width: 164 }}>
                {sponsor.profile_picture && <img src={sponsor.profile_picture} alt="Sponsor" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />}
              </Paper>
              <Typography variant="h6" style={{ fontSize: 16, fontWeight: 700, textAlign: "center" }}>
                {sponsor.name}
              </Typography>
              <Typography variant="body1" style={{ textAlign: "center" }}>
                {getStatusLabel(sponsor.status) || "N/A"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={9} sx={{ display: "flex", mt: 2 }}>
            <Grid container spacing={2} gap={5}>
              <Grid item xs={12} md={5}>
                <Box sx={{ display: "flex", my: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                    Email Address:
                  </Typography>
                  <Typography variant="body1">{sponsor.email || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", my: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                    Wallet Address:
                  </Typography>
                  <Typography variant="body1">{sponsor?.walletAddress ? sponsor?.walletAddress.slice(0, 3) + "*******" + sponsor.walletAddress.slice(-4) : ""}</Typography>
                </Box>
                <Box sx={{ display: "flex", my: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                    TVL:
                  </Typography>
                  <Typography variant="body1">{sponsor.tvl}</Typography>
                </Box>
              </Grid>
              <Box sx={{ width: "0.5px", backgroundColor: "rgba(204, 204, 204, 1)", my: 3, mx: 2 }} /> {/* Vertical line */}
              <Grid item xs={12} md={5}>
                <Box sx={{ display: "flex", my: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                    Created At:
                  </Typography>
                  <Typography variant="body1">{new Date(sponsor.createdAt).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: "flex", my: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                    Subscription Plan:
                  </Typography>
                  <Typography variant="body1">{planDetails.name}</Typography>
                </Box>
                <Box sx={{ display: "flex", my: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                    Plan Ends On:
                  </Typography>
                  <Typography variant="body1">{new Date(subscription_end_date * 1000).toLocaleString()}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DetailComponent;
