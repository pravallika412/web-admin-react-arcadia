import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Checkbox, Container, FormControlLabel, Paper, TextField } from "@mui/material";
import RenderField from "./RenderField";

const Step1 = ({ onNext, dogData, fields }) => {
  console.log(fields, "dogData");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // useEffect(() => {
  //   if (dogData) {
  //     Object.keys(dogData).forEach((fieldName) => {
  //       setValue(fieldName, dogData[fieldName]);
  //     });
  //   }
  // }, [dogData, setValue]);

  const onSubmit = (formData) => {
    console.log(formData);
    if (Object.keys(errors).length > 0) {
      console.log("errors");
      return; // Do not proceed if there are validation errors
    }

    const updatedFormData = {
      entity: fields.map((field) => ({
        fieldName: field.fieldName,
        dataType: field.dataType,
        data: formData[field.fieldName],
      })),
    };

    console.log(updatedFormData);
    onNext(updatedFormData);
  };

  return (
    <Container component="main">
      <Paper elevation={3} sx={{ p: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {fields.map((field) => (
            <div key={field.fieldName}>
              <RenderField field={field} register={register} errors={errors} setValue={setValue} />
            </div>
          ))}
          <Button type="submit" disabled={Object.keys(errors).length > 0}>
            Next
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Step1;
