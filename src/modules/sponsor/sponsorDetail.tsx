import { useLazyQuery } from "@apollo/client";
import { Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GET_SPONSORS_DETAILS } from "../../shared/graphQL/sponsor";
import DetailComponent from "./detail";

const SponsorDetailComponent = () => {
  const { id } = useParams();
  const [sponsorData, setSponsorData] = useState([]);
  const [getSponsorsDetails, { data: getSponsorDetailsData, loading: sponsorDetailsLoading, refetch }] = useLazyQuery(GET_SPONSORS_DETAILS);

  useEffect(() => {
    getSponsorsDetails({ variables: { input: { sponsorId: id } } });
  }, []);

  useEffect(() => {
    if (getSponsorDetailsData) {
      console.log(getSponsorDetailsData);
      setSponsorData(getSponsorDetailsData.GetSponsorSubscriptionDetails);
    }
  }, [getSponsorDetailsData]);

  return (
    <div>
      <DetailComponent sponsorData={sponsorData} />
    </div>
  );
};

export default SponsorDetailComponent;
