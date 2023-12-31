import { useEffect, useState } from "react";
import { Stepper, Step, StepLabel, Button, DialogContentText, Typography } from "@mui/material";
import Step1 from "./addDogStep1";
import Step2 from "./addDogStep2";
import Preview from "./addDogPreview";
import { GET_COREENTITY } from "../../shared/graphQL/core-entity/queries";
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
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState({});
  const [dogData, setDogData] = useState(row);
  const [coreEntityFieldsData, setCoreEntityFieldsData] = useState([]);
  const [otherInfo, setOtherInfo] = useState([]);
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

  const processDataRecursive = (data) => {
    if (Array.isArray(data)) {
      return data.map((field) => processDataRecursive(field));
    } else if (typeof data === "object") {
      if (Array.isArray(data.data)) {
        return {
          ...data,
          options: data.data,
          data: "",
        };
      } else {
        return {
          ...data,
          section_details: processDataRecursive(data.section_details),
        };
      }
    } else {
      return data;
    }
  };

  useEffect(() => {
    if (getCoreEntityData && getCoreEntityData.RetrieveCoreEntity.product_schema) {
      const parsedData = JSON.parse(getCoreEntityData.RetrieveCoreEntity.product_schema);
      const { entity, ...newData } = JSON.parse(getCoreEntityData.RetrieveCoreEntity.product_schema);
      const updatedData: any = {
        basicInformation: processDataRecursive(newData.basicInformation),
        aboutMe: processDataRecursive(newData.aboutMe),
        section: Object.keys(newData.section).reduce((acc, key) => {
          acc[key] = processDataRecursive(newData.section[key]);
          return acc;
        }, {}),
      };
      setCoreEntityFieldsData(parsedData.entity);
      setOtherInfo(updatedData);
    }
  }, [getCoreEntityData]);

  const handleNext = (formData) => {
    setData((prevData) => ({ ...prevData, ...formData }));
    setActiveStep((prevStep) => prevStep + 1);
    // Scroll to the top of the page
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    // Scroll to the top of the page
    window.scrollTo(0, 0);
  };

  const handleReset = () => {
    setActiveStep(0);
    setData({});
  };

  const handleSubmit = (data) => {
    for (const key in data) {
      if (typeof data[key] === "object" && data[key] !== null) {
        data[key] = JSON.stringify(data[key]);
      }
    }
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
    switch (step) {
      case 0:
        return <Step1 onNext={handleNext} dogData={dogData} fields={coreEntityFieldsData} />;
      case 1:
        return <Step2 onBack={handleBack} onNext={handleNext} dogData={dogData} fields={otherInfo} />;
      case 2:
        return <Preview data={data} onBack={handleBack} onReset={handleReset} onSave={handleSubmit} dogData={dogData} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Box sx={{ m: 3 }}>
        <Typography variant="h3" sx={{ color: "var(--primary-700, #00385F);" }}>
          {dogData ? "Edit" : "Add"} New Dog
        </Typography>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

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
