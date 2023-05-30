import { Paper, Typography } from "@mui/material";

const DetailComponent = ({ sponsorData }) => {
  console.log(sponsorData);
  const { sponsor, subscription_start_date, subscription_end_date, planDetails } = sponsorData;

  if (!sponsor) {
    return null; // or return a placeholder or error message
  }

  return (
    <Paper elevation={3} sx={{ padding: "16px" }}>
      <div style={{ display: "flex", marginBottom: "16px" }}>
        {sponsor.profile_picture && (
          <div style={{ marginRight: "16px" }}>
            <img src={sponsor.profile_picture} alt="Sponsor" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
          </div>
        )}
        <div>
          <Typography variant="h6" gutterBottom>
            {sponsor.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Email: {sponsor.email || "N/A"}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Wallet Address: {sponsor.walletAddress}
          </Typography>
          <Typography variant="body1" gutterBottom>
            TVL: {sponsor.tvl}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Created At: {new Date(sponsor.createdAt).toLocaleString()}
          </Typography>
        </div>
      </div>
      <Typography variant="body1" gutterBottom>
        Subscription Plan: {planDetails.name}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Plan Ends On: {new Date(subscription_end_date * 1000).toLocaleString()}
      </Typography>
    </Paper>
  );
};

export default DetailComponent;
