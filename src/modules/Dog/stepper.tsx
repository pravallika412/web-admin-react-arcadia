import React, { useEffect, useState } from "react";
import { Stepper, Step, StepLabel, Button, DialogContentText } from "@mui/material";
import Step1 from "./addDogStep1";
import Step2 from "./addDogStep2";
import Preview from "./addDogPreview";
import { CREATE_ENTITY, GET_COREENTITY } from "../../shared/graphQL/core-entity/queries";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CREATE_PRODUCT, UPDATE_PRODUCT } from "../../shared/graphQL/dog/queries";
import { useLocation, useNavigate } from "react-router";
import DialogComponent from "../../shared/components/Dialog";
import { Box } from "@mui/system";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const steps = ["Step 1", "Step 2", "Preview"];

interface LocationState {
  row: any;
}

const dogData1 = {
  firstName: "editfn",
  lastName: "editln",
  address: "editadd",
  zipCode: "editzip",
  mobile: "editmobile",
};

const StepperForm = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const row = state?.row;
  console.log(row);
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState({});
  const [dogData, setDogData] = useState(row);
  const [coreEntityFieldsData, setCoreEntityFieldsData] = useState([]);
  const [otherInfo, setOtherInfo] = useState([]);
  const [isSaveClicked, setIsSaveClicked] = useState(false);
  const [dialog, setDialog] = useState(false);
  const navigate = useNavigate();
  const [getCoreEntity, { data: getCoreEntityData }] = useLazyQuery(GET_COREENTITY);
  const [createProduct, { data: createProductData }] = useMutation(CREATE_PRODUCT);
  const [updateProduct, { data: updateProductData }] = useMutation(UPDATE_PRODUCT);

  useEffect(() => {
    getCoreEntity();
  }, []);

  useEffect(() => {
    if (createProductData) {
      setDialog(true);
    }
  }, [createProductData]);

  useEffect(() => {
    if (updateProductData) {
      setDialog(true);
    }
  }, [updateProductData]);

  useEffect(() => {
    if (getCoreEntityData && getCoreEntityData.RetrieveCoreEntity.product_schema) {
      const parsedData = JSON.parse(getCoreEntityData.RetrieveCoreEntity.product_schema);
      const { entity, ...newData } = JSON.parse(getCoreEntityData.RetrieveCoreEntity.product_schema);
      setCoreEntityFieldsData(parsedData.entity);
      setOtherInfo(newData);
    }
  }, [getCoreEntityData]);

  const handleNext = (formData) => {
    setData((prevData) => ({ ...prevData, ...formData }));
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setData({});
  };

  const handleSubmit = (data) => {
    console.log("stepper", data);
    for (const key in data) {
      if (typeof data[key] === "object" && data[key] !== null) {
        data[key] = JSON.stringify(data[key]);
      }
    }
    console.log("finalstring", data);
    if (dogData) {
      updateProduct({ variables: { id: { id: dogData._id }, input: data } });
    } else {
      createProduct({ variables: { input: data } });
    }
  };

  const handleClose = () => {
    setDialog(false);
    navigate("/dog");
  };

  const renderStepContent = (step) => {
    console.log(step);
    switch (step) {
      case 0:
        return <Step1 onNext={handleNext} dogData={dogData} fields={coreEntityFieldsData} />;
      case 1:
        return <Step2 onBack={handleBack} onNext={handleNext} dogData={dogData} fields={otherInfo} />;
      case 2:
        return <Preview data={data} onBack={handleBack} onReset={handleReset} onSave={handleSubmit} />;
      default:
        return null;
    }
  };

  const handleEditDog = (dog) => {
    setDogData(dog);
    setActiveStep(0);
  };

  const handleAddDog = () => {
    setDogData(null);
    setActiveStep(0);
  };

  return (
    <div>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}
      <DialogComponent
        open={dialog}
        width={324}
        height={240}
        handleClose={handleClose}
        content={
          <Box display="flex" flexDirection="column" alignItems="center">
            <CheckCircleIcon color="success" sx={{ fontSize: 60, m: 2 }} />
            <DialogContentText id="alert-dialog-description" sx={{ color: "black" }}>
              <strong> Dog {dogData ? "Updated" : "Created"} Successfully</strong>
            </DialogContentText>
          </Box>
        }
        actions={undefined}
      />
    </div>
  );
};

export default StepperForm;
