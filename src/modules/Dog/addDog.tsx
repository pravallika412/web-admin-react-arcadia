import React, { useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Box, Button, Grid, Paper, Step, StepButton, StepLabel, Stepper } from "@mui/material";
import { useForm, useFormContext } from "react-hook-form";
import { GET_COREENTITY } from "../../shared/graphQL/core-entity/queries";
import { CREATE_PRODUCT } from "../../shared/graphQL/dog/queries";
import DogBasicDetails from "./dogBasicDetails";
import DogOtherInfo from "./dogOtherInfo";

const steps = ["Basic Information", "Other Information"];

const AddDog = () => {
  const { handleSubmit } = useForm();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [coreEntityFieldsData, setCoreEntityFieldsData] = useState([]);
  const [dateFields, setDateFields] = useState({});
  const [otherInfo, setOtherInfo] = useState([]);
  const [getCoreEntity, { data: getCoreEntityData }] = useLazyQuery(GET_COREENTITY);
  const [createProduct, { data: createProductData }] = useMutation(CREATE_PRODUCT);

  useEffect(() => {
    getCoreEntity();
  }, []);

  useEffect(() => {
    if (getCoreEntityData && getCoreEntityData.RetrieveCoreEntity.product_schema) {
      const parsedData = JSON.parse(getCoreEntityData.RetrieveCoreEntity.product_schema);
      setCoreEntityFieldsData(parsedData.entity);
      setOtherInfo(parsedData);
    }
  }, [getCoreEntityData]);

  const handleDateFieldsChange = (updatedDateFields) => {
    setDateFields(updatedDateFields);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <DogBasicDetails fields={coreEntityFieldsData} onDateFieldsChange={handleDateFieldsChange} />;
      case 1:
        return <DogOtherInfo fields={otherInfo} onDateFieldsChange={handleDateFieldsChange} />;
      default:
        return <div>Not Found</div>;
    }
  };

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  const handleNext = (data) => {
    console.log(data);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = (data) => {
    console.log(data);
    let originalData = { ...data };

    // createProduct({
    //   variables: {
    //     input: formattedData1,
    //   },
    // });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stepper nonLinear activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label} completed={completed[index]}>
              <StepButton color="inherit" onClick={handleStep(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
        <Paper>
          <Grid container>{renderStepContent(activeStep)}</Grid>
          <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 2, m: 2 }}>
            <Button disabled={activeStep === 0} sx={{ mr: 1 }} color="inherit" onClick={handleBack}>
              Back
            </Button>
            <Button variant="contained" color="primary" onClick={activeStep === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}>
              {activeStep === steps.length - 1 ? "Submit" : "Next"}
            </Button>
          </Box>
        </Paper>
      </form>
    </Box>
  );
};

export default AddDog;
