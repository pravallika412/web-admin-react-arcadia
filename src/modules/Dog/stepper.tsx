import React, { useEffect, useState } from "react";
import { Stepper, Step, StepLabel, Button } from "@mui/material";
import Step1 from "./addDogStep1";
import Step2 from "./addDogStep2";
import Preview from "./addDogPreview";
import { CREATE_ENTITY, GET_COREENTITY } from "../../shared/graphQL/core-entity/queries";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CREATE_PRODUCT } from "../../shared/graphQL/dog/queries";

const steps = ["Step 1", "Step 2", "Preview"];

const dogData1 = {
  firstName: "editfn",
  lastName: "editln",
  address: "editadd",
  zipCode: "editzip",
  mobile: "editmobile",
};

const StepperForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState({});
  const [dogData, setDogData] = useState(null);
  const [coreEntityFieldsData, setCoreEntityFieldsData] = useState([]);
  const [otherInfo, setOtherInfo] = useState([]);
  const [isSaveClicked, setIsSaveClicked] = useState(false);

  const [getCoreEntity, { data: getCoreEntityData }] = useLazyQuery(GET_COREENTITY);
  const [createProduct, { data: createProductData }] = useMutation(CREATE_PRODUCT);

  useEffect(() => {
    getCoreEntity();
  }, []);

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
    setIsSaveClicked(true);
    createProduct({ variables: { input: data } });
  };

  const renderStepContent = (step) => {
    console.log(step);
    switch (step) {
      case 0:
        return <Step1 onNext={handleNext} dogData={dogData} fields={coreEntityFieldsData} />;
      case 1:
        return <Step2 onBack={handleBack} onNext={handleNext} dogData={dogData} fields={otherInfo} />;
      case 2:
        if (isSaveClicked) {
          return <h1>test</h1>;
        }
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
      <Button onClick={handleAddDog}>Add Dog</Button>
      {dogData && <Button onClick={() => handleEditDog(dogData)}>Edit</Button>}

      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}
    </div>
  );
};

export default StepperForm;
