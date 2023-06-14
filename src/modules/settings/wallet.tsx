import React, { useEffect, useState } from "react";
import axios from "axios";
import { List, ListItem, ListItemText, ListItemAvatar, Avatar } from "@mui/material";
import Web3 from "web3";
const web3 = new Web3();

function TokenList({ address }) {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    // const fetchTokenData = async () => {
    //   const { data } = await axios.post("https://polygon-mumbai.g.alchemy.com/v2/7IRs_CKHx8BKNUUJmw3ZtAXdfQucCU7M", {
    //     jsonrpc: "2.0",
    //     method: "alchemy_getTokenBalances",
    //     params: [address], // for the second parameter, provide token address array, if you want to check specific tokens
    //     id: 1,
    //   });
    //   console.log(data);
    //   if (data.result && data.result.tokenBalances) {
    //     setTokens(data.result.tokenBalances.filter((token) => token.tokenBalance !== "0"));
    //   }
    // };

    // fetchTokenData();
    const data = JSON.stringify({
      jsonrpc: "2.0",
      method: "alchemy_getTokenBalances",
      headers: {
        "Content-Type": "application/json",
      },
      params: [`${address}`],
      id: 1,
    });

    // config object for making a request with axios
    const config = {
      method: "post",
      url: "https://polygon-mumbai.g.alchemy.com/v2/7IRs_CKHx8BKNUUJmw3ZtAXdfQucCU7M",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    // Make the request and print the formatted response:
    axios(config)
      .then((response) => {
        console.log(response["data"]["result"]);
        const options = {
          method: "POST",
          url: "https://polygon-mumbai.g.alchemy.com/v2/7IRs_CKHx8BKNUUJmw3ZtAXdfQucCU7M",
          headers: { accept: "application/json", "content-type": "application/json" },
          data: {
            id: 1,
            jsonrpc: "2.0",
            method: "alchemy_getTokenMetadata",
            params: ["0x85676d0bed4a54879f376d307243fe94134d163e"],
          },
        };

        axios
          .request(options)
          .then(function (response) {
            console.log(response.data);
          })
          .catch(function (error) {
            console.error(error);
          });
      })
      .catch((error) => console.log("error", error));
  }, [address]);
  return <h1>test</h1>;
  // return (
  //   <List>
  //     {tokens.map((token) => (
  //       <ListItem key={token.contractAddress}>
  //         <ListItemAvatar>{/* <Avatar alt={`Token ${token.token.symbol}`} src={token.token.logoURL} /> */}</ListItemAvatar>
  //         <ListItemText primary={token.token.name} secondary={`Balance: ${web3.utils.fromWei(token.tokenBalance, token.token.decimals)}`} />
  //       </ListItem>
  //     ))}
  //   </List>
  // );
}

export default TokenList;
