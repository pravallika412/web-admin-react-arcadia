import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Checkbox, Container, FormControlLabel, Paper, TextField } from "@mui/material";
import RenderField from "./RenderField";

const Step1 = ({ onNext, dogData, fields }) => {
  console.log(fields, "fields");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [entity, setEntity] = useState(fields);
  useEffect(() => {
    if (dogData) {
      const updatedFields = fields.map((field) => {
        const { fieldName } = field;
        let fieldValue = null;

        if (fieldName === "name" || fieldName === "image" || fieldName === "status") {
          fieldValue = dogData[fieldName];
        }

        return {
          ...field,
          data: fieldValue,
        };
      });

      console.log(updatedFields);
      setEntity(updatedFields);
    }
  }, [dogData, fields]);

  const onSubmit = (formData) => {
    console.log(formData);
    if (Object.keys(errors).length > 0) {
      console.log("errors");
      return; // Do not proceed if there are validation errors
    }
    const updatedFormData = {
      entity: fields.map((field) => {
        let data = formData[field.fieldName];
        // let option;
        if (field.dataType === 2) {
          // Convert data to number if dataType is 2
          data = parseFloat(data);
        }
        // if (field.dataType === 5) {
        //   // Add the "option" key-value pair for enum fields
        //   option = data;
        //   data = field.data ? field.data : undefined;
        // }
        return {
          fieldName: field.fieldName,
          dataType: field.dataType,
          data: data,
          // option: option,
        };
      }),
    };

    console.log(updatedFormData);
    onNext(updatedFormData);
  };

  return (
    <Container component="main">
      <Paper elevation={3} sx={{ p: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {dogData
            ? entity.map((field) => (
                <div key={field.fieldName}>
                  <RenderField field={field} register={register} errors={errors} setValue={setValue} />
                </div>
              ))
            : fields.map((field) => (
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
