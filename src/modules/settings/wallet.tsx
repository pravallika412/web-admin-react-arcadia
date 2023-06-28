import React, { useEffect, useState } from "react";
import axios from "axios";
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Grid, Paper, Box, Typography, Skeleton, TextField, Button, DialogContentText, CircularProgress } from "@mui/material";
import Web3 from "web3";
import { makeStyles } from "@mui/styles";
import bitcoin from "../../assets/images/bitcoin.png";
import BigNumber from "bignumber.js";
import { useForm } from "react-hook-form";
import { GET_ADMIN, UPDATE_PROFILE } from "../../shared/graphQL/settings/queries";
import { useLazyQuery, useMutation } from "@apollo/client";
import DialogComponent from "../../shared/components/Dialog";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
const web3 = new Web3();

const useStyles = makeStyles({
  root: {
    background: "#F2FAFF !important",
    border: "1px solid #CDEAFF",
    boxShadow: "0px 9px 16px rgba(159, 162, 191, 0.18), 0px 2px 2px rgba(159, 162, 191, 0.32)",
    borderRadius: "6px",
    padding: "10px",
    marginBottom: "10px",
  },
  leftContent: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    marginRight: "10px",
  },
});

function TokenList({ address }) {
  const classes = useStyles();
  const [tokens, setTokens] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [maticPrice, setMaticPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const alchemy_api_key = process.env.ALCHEMY_API_KEY;
  const alchemyUrl = `https://polygon-mumbai.g.alchemy.com/v2/${alchemy_api_key}`;
  const [getAdmin, { data: getAdminData, refetch }] = useLazyQuery(GET_ADMIN);
  const [updateProfile, { data: updateProfileData }] = useMutation(UPDATE_PROFILE);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  useEffect(() => {
    getAdmin();
  }, []);

  useEffect(() => {
    if (getAdminData) {
      let data = getAdminData.getAdmin;
      let initial_values = {
        walletAddress: data.matic_wallet.wallet_address,
        merchantAddress: data.merchant_address,
      };
      reset(initial_values);
      setLoading(false);
    }
  }, [getAdminData, reset]);

  useEffect(() => {
    if (updateProfileData) {
      setDialog(true);
      refetch();
    }
  }, [updateProfileData]);

  useEffect(() => {
    const fetchMaticPrice = async () => {
      try {
        const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd"); // Replace "YOUR_API_ENDPOINT" with the actual API endpoint that provides the USD value of Matic
        const usdValue = response.data["matic-network"].usd; // Assuming the API response contains the USD value of Matic in the "price" field
        setMaticPrice(usdValue);
      } catch (error) {
        console.log("Error fetching Matic price", error);
      }
    };

    fetchMaticPrice();
  }, []);

  const makeAlchemyRequest = (method, params) => {
    return axios({
      method: "post",
      url: alchemyUrl,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      },
    });
  };

  useEffect(() => {
    makeAlchemyRequest("alchemy_getTokenBalances", [address])
      .then((response) => {
        const tokenBalances = response.data.result.tokenBalances;

        const metadataPromises = tokenBalances.map((token, index) => {
          const contractAddress = token.contractAddress;
          const tokenBalanceHex = token.tokenBalance;

          return makeAlchemyRequest("alchemy_getTokenMetadata", [contractAddress]).then((response) => {
            const decimals = response.data.result.decimals;
            const symbol = response.data.result.symbol;
            const logo = response.data.result.logo;

            // Convert the hexadecimal balance to a decimal
            const tokenBalance = Web3.utils.toBN(tokenBalanceHex).toString();

            // Convert to BigNumber and adjust according to the decimals
            const adjustedTokenBalance = new BigNumber(tokenBalance).dividedBy(new BigNumber(10).pow(decimals));

            const tokenObj = {
              id: index,
              symbol,
              logo,
              balance: adjustedTokenBalance.toFixed(4),
            };

            return tokenObj;
          });
        });

        const maticBalancePromise = makeAlchemyRequest("eth_getBalance", [address, "latest"]).then((maticResponse) => {
          const maticDecimals = 18;

          // Convert the hexadecimal balance to a decimal
          const maticBalance = Web3.utils.toBN(maticResponse.data.result).toString();

          // Convert to BigNumber and adjust according to the decimals
          const adjustedMaticBalance = new BigNumber(maticBalance).dividedBy(new BigNumber(10).pow(maticDecimals));

          // Create a token object for MATIC
          const maticObj = {
            id: tokenBalances.length, // set id to the length of tokenBalances to avoid duplicate ids
            symbol: "MATIC",
            logo: null, // MATIC logo URL, or null if none
            balance: adjustedMaticBalance.toFixed(4),
          };

          return maticObj;
        });

        // Push the maticBalancePromise into the metadataPromises array
        metadataPromises.push(maticBalancePromise);

        Promise.all(metadataPromises).then((tokenObjs) => {
          setTokens(tokenObjs);
        });
      })
      .catch((error) => console.log("error", error));
  }, [address]);

  const onSubmit = (data) => {
    if (!web3.utils.isAddress(data.merchantAddress) && data.merchantAddress) {
      setError("merchantAddress", {
        type: "manual",
        message: "Invalid Ethereum address",
      });
    }
    const payload = {
      merchantAddress: data.merchantAddress ? web3.utils.toChecksumAddress(data.merchantAddress) : null,
    };
    updateProfile({ variables: { input: payload } });
  };

  const handleAddressChange = (event) => {
    const address = event.target.value;
    if (!web3.utils.isAddress(address) && address) {
      setError("merchantAddress", {
        type: "manual",
        message: "Invalid Ethereum address",
      });
    } else {
      clearErrors("merchantAddress");
    }
  };

  const handleClose = () => {
    setDialog(false);
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h4">Wallet Address</Typography>

        <Grid container spacing={2}>
          <Grid item xs={6} md={8}>
            <Grid item xs={12} md={12}>
              {loading ? (
                <Skeleton variant="text" width="100%" height={70} />
              ) : (
                <TextField
                  label="Merchant Address"
                  {...register("merchantAddress", { onChange: (e) => handleAddressChange(e) })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  error={!!errors.merchantAddress}
                  helperText={errors?.merchantAddress?.message}
                />
              )}
            </Grid>
            <Grid item xs={12} md={12}>
              {loading ? (
                <Skeleton variant="text" width="100%" height={70} />
              ) : (
                <TextField label="Wallet Address" {...register("walletAddress")} disabled margin="normal" InputLabelProps={{ shrink: true }} fullWidth />
              )}
            </Grid>
            <Grid sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}>
              <Button variant="contained" type="submit">
                Save
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={6} md={4}>
            <Box
              style={{
                borderRadius: "15px",
                border: "1px solid var(--success-500, #35B385)",
                background: "var(--success-025, #F6FFFC)",
                boxShadow: "0px 1px 12px 0px #B1DEFE",
                width: "308px",
                height: "240px",
                flexDirection: "column",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tokens.length > 0 && tokens[tokens.length - 1].balance ? (
                <>
                  <Typography
                    variant="h3"
                    style={{
                      color: "var(--success-600, #2D9972)",
                    }}
                  >
                    {tokens.length > 0 && tokens[tokens.length - 1].balance} MATIC
                  </Typography>

                  <Typography
                    variant="h4"
                    style={{
                      color: "var(--success-600, #2D9972)",
                    }}
                  >
                    $
                    {!!tokens.length &&
                      // Calculate the dollar value
                      (tokens[tokens.length - 1].balance * maticPrice).toFixed(4)}
                  </Typography>
                </>
              ) : (
                <CircularProgress />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h4">Token Details</Typography>
      <Grid container spacing={2} mt={1}>
        {tokens.length > 0 ? (
          tokens.map((token, index) => (
            <Grid item xs={6} key={token.id}>
              <Paper className={classes.root}>
                <Box display="flex" justifyContent="space-between" sx={{ py: 1, px: 2 }}>
                  <div className={classes.leftContent}>
                    <Avatar alt={`Token ${token.symbol}`} src={token.logo ? token.logo : bitcoin} className={classes.avatar} />
                    <Typography variant="h5">{token.symbol}</Typography>
                  </div>
                  <Typography sx={{ color: "#0481D9", fontSize: 28, fontWeight: 700 }}>{token.balance}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Skeleton variant="text" height={50} />
            <Skeleton variant="text" height={50} />
          </Grid>
        )}
      </Grid>
      <DialogComponent
        open={dialog}
        width={324}
        height={240}
        handleClose={handleClose}
        content={
          <Box display="flex" flexDirection="column" alignItems="center">
            <CheckCircleIcon color="success" sx={{ fontSize: 60, m: 2 }} />
            <DialogContentText id="alert-dialog-description" sx={{ color: "black" }}>
              <strong> Merchant Address Updated Successfully</strong>
            </DialogContentText>
          </Box>
        }
        actions={undefined}
      />
    </>
  );
}

export default TokenList;
