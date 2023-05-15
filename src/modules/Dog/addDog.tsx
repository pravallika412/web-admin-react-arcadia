import { Box, Button, Grid, Paper, Step, StepButton, StepLabel, Stepper } from "@mui/material";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DogBasicDetails from "./dogBasicDetails";
import DogOtherDetails from "./dogOtherDetails";
import PreviewDetails from "./preview";

const fields = [
  { fieldName: "name", dataType: 1, data: "" },
  { fieldName: "image", dataType: 7, data: "" },
  { fieldName: "status", dataType: 5, data: ["active", "inactive"] },
  { fieldName: "dob", dataType: 3, data: "" },
  { fieldName: "age", dataType: 2, data: "" },
  { fieldName: "gender", dataType: 5, data: ["Male", "Female"] },
  { fieldName: "adoption_date", dataType: 3, data: "" },
  { fieldName: "rest_date", dataType: 3, data: "" },
  { fieldName: "gallery", dataType: 8, data: "" },
  { fieldName: "breed", dataType: 1, data: "" },
  { fieldName: "height", dataType: 1, data: "" },
  { fieldName: "weight", dataType: 1, data: "" },
  { fieldName: "color", dataType: 1, data: "" },
];

const _renderStepContent = (step, register, control) => {
  switch (step) {
    case 0:
      return <DogBasicDetails fields={fields} />;
    case 1:
      return <DogOtherDetails />;
    case 2:
      return <PreviewDetails />;
    default:
      return <div>Not Found</div>;
  }
};

const steps = ["Basic Information", "Other Information", "Preview"];

const AddDog = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{
    [k: number]: boolean;
  }>({});

  const methods = useForm({
    defaultValues: {
      services: [
        {
          serviceName: "",
          joinedOn: "",
          retiredOn: "",
          description: "",
        },
      ],
      awards: [
        {
          awardName: "",
          awardDate: "",
          uploadMedia: "",
        },
      ],
      medicals: [
        {
          title: "",
          shortDescription: "",
          uploadMedia: "",
        },
      ],
      others: [
        {
          title: "",
          shortDescription: "",
          uploadMedia: "",
        },
      ],
      description: "",
    },
  });
  const { handleSubmit, register, control } = useForm();

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
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
            <Grid container>{_renderStepContent(activeStep, register, control)}</Grid>
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 2, m: 2 }}>
              <Button disabled={activeStep === 0} sx={{ mr: 1 }} color="inherit" onClick={handleBack}>
                Back
              </Button>
              <Button variant="contained" color="primary" onClick={activeStep === steps.length - 1 ? methods.handleSubmit(onSubmit) : handleNext}>
                {activeStep === steps.length - 1 ? "Submit" : "Next"}
              </Button>
            </Box>
          </Paper>
        </form>
      </FormProvider>
    </Box>
  );
};
export default AddDog;
