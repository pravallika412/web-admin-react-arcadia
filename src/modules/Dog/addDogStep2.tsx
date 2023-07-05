import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Container, Paper } from "@mui/material";
import RenderField from "./RenderField";

const Step2 = ({ onBack, onNext, dogData, fields }) => {
  console.log(fields);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (dogData) {
      setValue("address", dogData.address);
      setValue("zipCode", dogData.zipCode);
      setValue("mobile", dogData.mobile);
    }
  }, [dogData, setValue]);

  const onSubmit = (formData) => {
    console.log(fields);
    const updatedFormData = {
      basicInformation: fields.basicInformation.map((field) => ({
        fieldName: field.fieldName,
        dataType: field.dataType,
        data: formData[field.fieldName],
      })),
      aboutMe: fields.aboutMe.map((field) => ({
        fieldName: field.fieldName,
        dataType: field.dataType,
        data: formData[field.fieldName],
      })),
      section: Object.keys(fields.section).reduce((acc, sectionKey) => {
        acc[sectionKey] = {
          section_name: fields.section[sectionKey].section_name,
          section_details: [
            fields.section[sectionKey].section_details.reduce((detailsAcc, field) => {
              detailsAcc.push({ fieldName: field.fieldName, dataType: field.dataType, data: formData[field.fieldName] });
              return detailsAcc;
            }, []),
          ],
        };
        return acc;
      }, {}),
    };

    console.log(updatedFormData);
    onNext(updatedFormData);
  };

  return (
    <Container component="main">
      <Paper elevation={3} sx={{ p: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            {Object.keys(fields).map((key) => (
              <div key={key}>
                <h2>{key}</h2>
                {key === "section" ? (
                  <div>
                    {Object.keys(fields[key]).map((sectionKey) => (
                      <div key={sectionKey}>
                        <h3>{fields[key][sectionKey].section_name}</h3>
                        {fields[key][sectionKey].section_details.map((field, index) => (
                          <div key={index}>
                            {" "}
                            <RenderField field={field} register={register} errors={errors} setValue={setValue} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {fields[key].map((field, index) => (
                      <div key={index}>
                        {" "}
                        <RenderField field={field} register={register} errors={errors} setValue={setValue} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button onClick={onBack}>Back</Button>
          <Button type="submit" disabled={Object.keys(errors).length > 0}>
            Next
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Step2;
