import { Box, FormControl, Grid, MenuItem, Select, Skeleton, Typography, Tooltip as MUIToolTip } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { styled } from "@mui/material/styles";
import { GET_USER_COUNT, SPONSOR_STATS } from "../../shared/graphQL/common/queries";
import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_PLANS } from "../../shared/graphQL/subscription/queries";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import PetsOutlinedIcon from "../../assets/images/pets.svg";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { GET_POST_COUNT } from "../../shared/graphQL/post/queries";
import Info from "@mui/icons-material/Info";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const OverviewWrapper = styled(Box)(
  () => `
    overflow: auto;
    flex: 1;
    overflow-x: hidden;
    align-items: center;
    margin:1rem;
`
);

const StyledBox = styled(Box)(({ theme }) => ({
  background: "#FFFFFF",
  boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.18)",
  borderRadius: 12,
  display: "flex",
  flexDirection: "column",
  height: 125,
  justifyContent: "space-between",
  padding: 10,
}));

const PostStyledBox = styled(Box)(({ theme }) => ({
  border: "1px solid rgba(0, 0, 0, 0.15)",
  borderRadius: "6px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const PostCount = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "30px",
}));

const StatusGridItem = styled(Grid)(({ theme }) => ({
  height: "70px",
}));

const StatusTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "14px",
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const StyledIcon = styled("span")(({ theme, color }) => ({
  width: 40,
  height: 40,
  background: "#9BD6FF",
  borderRadius: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledTotalCount = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: 30,
  color: "#0360A1",
}));

const StyledGrid = styled(Grid)`
  background: #ffffff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  gap: 1rem;
  padding: 1rem;
`;

const StyledGridItem = styled(Grid)`
  background: rgba(250, 250, 250, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
`;

const StyledCount = styled(Typography)`
  background: #f6fffc;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0px 6px 6px 0px;
  height: 70px;
  width: 170px;
  text-align: center;
  align-items: center;
  font-weight: 500;
  font-size: 30px;
`;

function Overview() {
  const [chartData, setChartData] = useState(null);
  const [planList, setPlanList] = useState([]);
  const [startYear, setStartYear] = useState<string | number>(2023);
  const [month, setMonth] = useState<number | string>("");
  const [plan, setPlan] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [postStatuses, setPostStatuses] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [getPlans, { data: getAllPlans, loading: planLoader, refetch }] = useLazyQuery(GET_PLANS, { fetchPolicy: "no-cache" });
  const [getUsers, { data: getUserCount, loading: userLoader }] = useLazyQuery(GET_USER_COUNT, { fetchPolicy: "no-cache" });
  const [sponsorStats, { data: sponsorStatsData, loading: statsLoader }] = useLazyQuery(SPONSOR_STATS, { fetchPolicy: "no-cache" });
  const [getPostCount, { data: getPostCountData, loading: countLoading, refetch: refetchPostCount }] = useLazyQuery(GET_POST_COUNT, { fetchPolicy: "no-cache" });

  const yearOptions = [
    { label: 2023, value: 2023 },
    { label: 2024, value: 2024 },
  ]; // Options for year dropdown
  const monthOptions = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  useEffect(() => {
    const payload = {
      startYear: startYear,
      planId: plan === "" ? null : plan,
      month: month === "" ? null : month,
    };
    sponsorStats({ variables: { input: payload } });
  }, [startYear, month, plan]);

  useEffect(() => {
    getPlans({ variables: { input: { pageDto: { page: 1, limit: 50 } } } });
    getPostCount();
    getUsers();
  }, []);

  useEffect(() => {
    if (getUserCount) {
      setUserStats(getUserCount.GetUsersCount);
    }
  }, [getUserCount]);

  useEffect(() => {
    if (getPostCountData) {
      const { totalPosts, approvedPosts, pendingPosts, rejectedPosts } = getPostCountData.GetPostCounts;
      setTotalCount(totalPosts);
      const postStatuses = [
        { status: "Approved Posts", count: approvedPosts, bgcolor: "rgba(250, 250, 250, 0.5)", color: "#2D9972", borderColor: "1px solid rgba(0, 0, 0, 0.15)", bgCountcolor: "#F6FFFC" },
        { status: "Pending Posts", count: pendingPosts, bgcolor: "rgba(250, 250, 250, 0.5)", color: "#EE8212", borderColor: "1px solid rgba(0, 0, 0, 0.15)", bgCountcolor: "#FFF9EE" },
        { status: "Rejected Posts", count: rejectedPosts, bgcolor: "rgba(250, 250, 250, 0.5)", color: "#E6313C", borderColor: "1px solid rgba(0, 0, 0, 0.15)", bgCountcolor: "#FFF5F5" },
      ];
      setPostStatuses(postStatuses);
    }
  }, [getPostCountData]);

  useEffect(() => {
    if (getAllPlans) {
      setPlanList(getAllPlans.GetPlans.plans);
    }
  }, [getAllPlans]);

  useEffect(() => {
    if (sponsorStatsData) {
      const data = {
        labels: [],
        datasets: [
          {
            label: "Sponsor Count",
            data: [],
            fill: false,
            borderColor: "rgb(75, 192, 192)",
          },
        ],
      };

      if (month == "") {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        // If month is not selected, set labels from the month field in _id and sponsorCount as data
        sponsorStatsData.GetSponsorSubscriptionStats.sponsorSubscriptionStats.forEach((stat) => {
          const monthIndex = stat._id.month - 1;
          data.labels.push(monthNames[monthIndex]);
          data.datasets[0].data.push(stat.sponsorCount);
        });
      } else {
        sponsorStatsData.GetSponsorSubscriptionStats.sponsorSubscriptionStats.forEach((stat) => {
          const { timestamp, sponsorCount } = stat;
          const date = new Date(timestamp);
          const monthValue = date.getMonth() + 1;

          if (monthValue === month) {
            const day = date.getDate();
            data.labels.push(day);
            data.datasets[0].data.push(sponsorCount);
          }
        });
      }

      setChartData(data);
    }
  }, [sponsorStatsData]);

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: month ? "Days in a Month" : "Month",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Sponsors",
        },
        ticks: {
          callback: function (value) {
            if (Number.isInteger(value) && value >= 0) {
              return value;
            }
            return null;
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
  };

  const renderSkeleton = () => {
    return (
      <>
        <Skeleton variant="text" height={50} />
        <Skeleton variant="text" width={150} />
      </>
    );
  };
  const getSelectedPlanName = (planId: string) => {
    const selectedPlan = planList.find((plan) => plan._id === planId);
    return selectedPlan ? selectedPlan.name : "All Plans";
  };

  return (
    <OverviewWrapper>
      <Grid container spacing={2}>
        <Grid item xs={8} sm={8}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <StyledBox>
                {userStats ? (
                  <>
                    <StyledHeader>
                      <Typography variant="h4">Total Sponsors</Typography>
                      <StyledIcon>
                        <PeopleOutlineIcon />
                      </StyledIcon>
                    </StyledHeader>
                    <StyledTotalCount align="left">{userStats.sponsorCount}</StyledTotalCount>{" "}
                  </>
                ) : (
                  renderSkeleton()
                )}
              </StyledBox>
            </Grid>
            <Grid item xs={6} sm={4}>
              <StyledBox>
                {userStats ? (
                  <>
                    <StyledHeader>
                      <Typography variant="h4">Total Handlers</Typography>
                      <StyledIcon>
                        <PersonOutlineIcon />
                      </StyledIcon>
                    </StyledHeader>
                    <StyledTotalCount align="left">{userStats.handlerCount}</StyledTotalCount>{" "}
                  </>
                ) : (
                  renderSkeleton()
                )}
              </StyledBox>
            </Grid>
            <Grid item xs={6} sm={4}>
              <StyledBox>
                {userStats ? (
                  <>
                    <StyledHeader>
                      <Typography variant="h4">Total Dogs</Typography>
                      <StyledIcon>
                        <img src={PetsOutlinedIcon} alt="pet" />
                      </StyledIcon>
                    </StyledHeader>
                    <StyledTotalCount align="left">{userStats.productCount}</StyledTotalCount>{" "}
                  </>
                ) : (
                  renderSkeleton()
                )}
              </StyledBox>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Box style={{ padding: "1rem", border: "1px solid #E6F4FF", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", borderRadius: 12, background: "#FFFFFF" }}>
                <Grid item xs={12}>
                  {chartData ? <h2>Subscription Plan - {getSelectedPlanName(plan)}</h2> : <Skeleton variant="text" width={100} />}
                </Grid>
                {chartData ? (
                  <Grid item xs={12} container justifyContent="flex-end">
                    {/* Select Dropdowns */}

                    <FormControl sx={{ m: 1, width: 100, mt: 3 }} size="small">
                      <Select value={startYear} onChange={(event) => setStartYear(event.target.value)}>
                        <MenuItem disabled value="">
                          <span>Select</span>
                        </MenuItem>
                        {yearOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl sx={{ m: 1, width: 130, mt: 3 }} size="small">
                      <Select value={month} onChange={(event) => setMonth(event.target.value)} displayEmpty>
                        <MenuItem value="">
                          <span>Select</span>
                        </MenuItem>
                        {monthOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl sx={{ m: 1, minWidth: 130, mt: 3 }} size="small">
                      <Select value={plan} onChange={(event) => setPlan(event.target.value)} displayEmpty>
                        <MenuItem value="">
                          <span>Select</span>
                        </MenuItem>
                        {planList.map((plan) => (
                          <MenuItem key={plan._id} value={plan._id}>
                            {plan.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ) : (
                  <Grid item xs={12} container justifyContent="flex-end">
                    <Skeleton variant="text" width={300} height={50} />
                  </Grid>
                )}
                <Grid item xs={12}>
                  {chartData ? <Line data={chartData} options={options} /> : <Skeleton variant="rectangular" height={300} />}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4} sm={4}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <Box style={{ padding: "1rem", border: "1px solid #E6F4FF", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", borderRadius: 12, background: "#FFFFFF" }}>
                {!userStats ? (
                  <Box sx={{ p: 1 }}>
                    <Skeleton variant="rectangular" height={40} />
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", justifyContent: "space-between", p: 0.5, alignItems: "center" }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center" }}>
                      Total TVL
                      <MUIToolTip title="Doller amount from stripe and crypto">
                        <Info style={{ marginLeft: "4px", verticalAlign: "middle" }} />
                      </MUIToolTip>
                    </Typography>
                    <Typography sx={{ fontSize: 36, fontWeight: 700 }} color="primary">
                      {userStats.totalAmount ? "$" + Number(userStats.totalAmount).toFixed(2) : ""}
                    </Typography>
                  </Box>
                )}

                <Grid container spacing={2}>
                  {!userStats ? (
                    // Show skeletons while loading
                    <>
                      <Grid item xs={12} sm={12}>
                        <Skeleton variant="rectangular" height={70} />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <Skeleton variant="rectangular" height={70} />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12} sm={12}>
                        <PostStyledBox style={{ background: "rgba(250, 250, 250, 0.5)" }}>
                          <Grid container alignItems="center">
                            <Grid item xs={7}>
                              <StatusTypography variant="h6" align="center">
                                Fiat
                                <MUIToolTip title="TVL of stripe transactions">
                                  <Info style={{ marginLeft: "4px", verticalAlign: "middle" }} />
                                </MUIToolTip>
                              </StatusTypography>
                            </Grid>
                            <Grid
                              item
                              xs={5}
                              style={{
                                padding: "1rem",
                                borderLeft: "1px solid rgba(0, 0, 0, 0.15)",
                                borderRadius: " 0px 6px 6px 0px",
                                background: "#E6F4FF",
                                height: "70px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <PostCount style={{ color: "#00385F" }} align="right">
                                {userStats.fiatTvl[0] && userStats.fiatTvl[0].totalPrice ? "$" + Number(userStats.fiatTvl[0].totalPrice).toFixed(2) : ""}
                              </PostCount>
                            </Grid>
                          </Grid>
                        </PostStyledBox>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <PostStyledBox style={{ background: "rgba(250, 250, 250, 0.5)" }}>
                          <Grid container alignItems="center">
                            <Grid item xs={7}>
                              <StatusTypography variant="h6" align="center">
                                Number of Crypto Tokens
                                <MUIToolTip
                                  title={
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                      {userStats.cryptoTvl && userStats.cryptoTvl.length > 0 ? (
                                        userStats.cryptoTvl.map((item) => (
                                          <Typography key={item.currency}>
                                            {item.currency} - {item.totalPrice.toFixed(2)}
                                          </Typography>
                                        ))
                                      ) : (
                                        <Typography>No tokens available</Typography>
                                      )}
                                    </Box>
                                  }
                                >
                                  <Info style={{ marginLeft: "4px", verticalAlign: "middle" }} />
                                </MUIToolTip>
                              </StatusTypography>
                            </Grid>
                            <Grid
                              item
                              xs={5}
                              style={{
                                padding: "1rem",
                                borderLeft: "1px solid rgba(0, 0, 0, 0.15)",
                                borderRadius: " 0px 6px 6px 0px",
                                background: "#E6F4FF",
                                height: "70px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <PostCount style={{ color: "#00385F" }} align="right">
                                {userStats.cryptoTvl ? (userStats.cryptoTvl.length > 0 ? userStats.cryptoTvl.length : 0) : 0}
                              </PostCount>
                            </Grid>
                          </Grid>
                        </PostStyledBox>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12} sm={12}>
              <Box style={{ padding: "1rem", border: "1px solid #E6F4FF", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", borderRadius: 12, background: "#FFFFFF" }}>
                {countLoading ? (
                  <Box sx={{ p: 1 }}>
                    <Skeleton variant="rectangular" height={40} />
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", justifyContent: "space-between", p: 0.5, alignItems: "center" }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Total Posts</Typography>
                    <Typography sx={{ fontSize: 36, fontWeight: 700 }} color="primary">
                      {totalCount}
                    </Typography>
                  </Box>
                )}

                <Grid container spacing={2}>
                  {countLoading ? (
                    // Show skeletons while loading
                    <>
                      <Grid item xs={12} sm={12}>
                        <Skeleton variant="rectangular" height={70} />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <Skeleton variant="rectangular" height={70} />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <Skeleton variant="rectangular" height={70} />
                      </Grid>
                    </>
                  ) : (
                    postStatuses.map((status, index) => (
                      <Grid item xs={12} sm={12} key={index}>
                        <PostStyledBox style={{ background: status.borderColor }}>
                          <Grid container alignItems="center">
                            <Grid item xs={7}>
                              <StatusTypography variant="h6" align="center">
                                {status.status}
                              </StatusTypography>
                            </Grid>
                            <Grid
                              item
                              xs={5}
                              style={{
                                padding: "1rem",
                                borderLeft: "1px solid rgba(0, 0, 0, 0.15)",
                                borderRadius: " 0px 6px 6px 0px",
                                background: status.bgCountcolor,
                                height: "70px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <PostCount style={{ color: status.color }} align="right">
                                {status.count}
                              </PostCount>
                            </Grid>
                          </Grid>
                        </PostStyledBox>
                      </Grid>
                    ))
                  )}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </OverviewWrapper>
  );
}

export default Overview;
