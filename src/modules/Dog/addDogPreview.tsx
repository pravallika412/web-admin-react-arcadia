import React, { useState } from "react";
import { Button, TextField, FormControlLabel, Checkbox, Container, Paper } from "@mui/material";
import { useForm } from "react-hook-form";
import RenderField from "./RenderField";
import moment from "moment";

const Preview = ({ data, onBack, onReset, onSave }) => {
  console.log(data);
  const [formData, setFormData] = useState(data);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = () => {
    console.log("final", formData);
    const updatedFormData = {
      entity: formData.entity.reduce((acc, field) => {
        if (field.data !== null && field.data !== "") {
          acc.push({ [field.fieldName]: field.dataType === 2 ? parseInt(field.data) : field.dataType === 3 ? moment(field.data, "YYYY-MM-DD").utc().format() : field.data });
        }
        return acc;
      }, []),
      basicInformation: formData.basicInformation.reduce((acc, field) => {
        if (field.data !== null && field.data !== "") {
          acc.push({ [field.fieldName]: field.dataType === 2 ? parseInt(field.data) : field.dataType === 3 ? moment(field.data, "YYYY-MM-DD").utc().format() : field.data });
        }
        return acc;
      }, []),
      aboutMe: formData.aboutMe.reduce((acc, field) => {
        if (field.data !== null && field.data !== "") {
          acc.push({ [field.fieldName]: field.dataType === 2 ? parseInt(field.data) : field.dataType === 3 ? moment(field.data, "YYYY-MM-DD").utc().format() : field.data });
        }
        return acc;
      }, []),
      section: Object.keys(formData.section).reduce((acc, sectionKey) => {
        acc[sectionKey] = {
          section_name: formData.section[sectionKey].section_name,
          section_details: [
            formData.section[sectionKey].section_details.reduce((detailsAcc, field) => {
              if (field.data !== null && field.data != "") {
                if (field.dataType === 3) {
                  console.log([field.fieldName]);
                  const date = field.data ? moment(field.data, "YYYY-MM-DD").utc().format() : "";
                  detailsAcc.push({ [field.fieldName]: date });
                } else {
                  detailsAcc.push({ [field.fieldName]: field.dataType === 2 ? parseInt(field.data) : field.data });
                }
              }
              return detailsAcc;
            }, []),
          ],
        };
        return acc;
      }, {}),
    };

    console.log(updatedFormData);
    onSave(updatedFormData);
  };

  return (
    <div>
      <Container component="main">
        <Paper elevation={3} sx={{ p: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              {Object.keys(formData).map((key) => (
                <div key={key}>
                  <h2>{key}</h2>
                  {key === "section" ? (
                    <div>
                      {Object.keys(formData.section).map((sectionKey) => (
                        <div key={sectionKey}>
                          <h3>{formData.section[sectionKey].section_name}</h3>
                          {formData.section[sectionKey].section_details.map((field, fieldIndex) => (
                            <div key={fieldIndex}>
                              <RenderField field={field} register={register} errors={errors} setValue={setValue} />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      {formData[key].map((field, index) => (
                        <div key={index}>
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
              Create
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default Preview;
