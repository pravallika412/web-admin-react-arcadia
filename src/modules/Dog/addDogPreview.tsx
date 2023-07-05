import React, { useState } from "react";
import { Button, TextField, FormControlLabel, Checkbox, Container, Paper } from "@mui/material";
import { useForm } from "react-hook-form";
import RenderField from "./RenderField";

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
      entity: formData.entity.map((field) => ({
        [field.fieldName]: field.data,
      })),
      basicInformation: formData.basicInformation.map((field) => ({
        [field.fieldName]: field.data,
      })),
      aboutMe: formData.aboutMe.map((field) => ({
        [field.fieldName]: field.data,
      })),
      // section: Object.keys(formData.section).reduce((acc, sectionKey) => {
      //   acc[sectionKey] = {
      //     section_name: formData.section[sectionKey].section_name,
      //     section_details: [
      //       formData.section[sectionKey].section_details.reduce((detailsAcc, field) => {
      //         detailsAcc.push({ [field.fieldName]: field.data });
      //         return detailsAcc;
      //       }, []),
      //     ],
      //   };
      //   return acc;
      // }, {}),
      // section: Object.keys(formData.section).reduce((acc, sectionKey) => {
      //   acc[sectionKey] = {
      //     section_name: formData.section[sectionKey].section_name,
      //     section_details: formData.section[sectionKey].section_details.map((fields) =>
      //       fields.reduce((detailsAcc, field) => {
      //         detailsAcc[field.fieldName] = field.data;
      //         return detailsAcc;
      //       }, {})
      //     ),
      //   };
      //   return acc;
      // }, {}),

      // section: Object.keys(formData.section).reduce((acc, sectionKey) => {
      //   acc[sectionKey] = {
      //     section_name: formData.section[sectionKey].section_name,
      //     section_details: formData.section[sectionKey].section_details.map((fields) => {
      //       const sectionDetailObj = {};
      //       fields.forEach((field) => {
      //         sectionDetailObj[field.fieldName] = field.data;
      //       });
      //       return sectionDetailObj;
      //     }),
      //   };
      //   return acc;
      // }, {}),
      // section: Object.keys(formData.section).reduce((acc, sectionKey) => {
      //   const sectionDetails = formData.section[sectionKey].section_details.map((fields) => {
      //     const sectionDetailObj = {};
      //     fields.forEach((field) => {
      //       sectionDetailObj[field.fieldName] = field.data;
      //     });
      //     return sectionDetailObj;
      //   });

      //   acc[sectionKey] = {
      //     section_name: formData.section[sectionKey].section_name,
      //     section_details: sectionDetails,
      //   };
      //   return acc;
      // }, {}),
      section: Object.keys(formData.section).reduce((acc, sectionKey) => {
        const sectionDetails = formData.section[sectionKey].section_details.map((fields) => {
          const sectionDetailObj = fields.map((field) => ({
            [field.fieldName]: field.data,
          }));
          return sectionDetailObj;
        });

        acc[sectionKey] = {
          section_name: formData.section[sectionKey].section_name,
          section_details: sectionDetails,
        };
        return acc;
      }, {}),
    };

    console.log(updatedFormData);
    onSave(updatedFormData);
  };

  return (
    <div>
      {/* {Object.entries(formData).map(([key, value]: any) => {
        if (key === "section") {
          return Object.entries(value).map(([sectionKey, sectionValue], sectionIndex) => {
            return renderSection(sectionValue, sectionIndex);
          });
        } else {
          return (
            <div key={key}>
              <h2>{key}</h2>
              {value.map((field, fieldIndex) => renderField(field, key, fieldIndex))}
            </div>
          );
        }
      })}

      <Button onClick={onBack}>Back</Button>
      <Button onClick={handleSave}>Save</Button>
      <Button onClick={onReset}>Reset</Button> */}
      <Container component="main">
        <Paper elevation={3} sx={{ p: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              {Object.keys(formData).map((key) => (
                <div key={key}>
                  <h2>{key}</h2>
                  {key === "section" ? (
                    <div>
                      {Object.keys(formData[key]).map((sectionKey) => (
                        <div key={sectionKey}>
                          <h3>{formData[key][sectionKey].section_name}</h3>
                          {formData[key][sectionKey].section_details.map(
                            (fields, index) =>
                              fields?.map((field, fieldIndex) => (
                                // console.log(field)
                                <div key={fieldIndex}>
                                  <RenderField field={field} register={register} errors={errors} setValue={setValue} />
                                </div>
                              ))
                            // <div key={index}>
                            //   <RenderField field={field} register={register} errors={errors} setValue={setValue} />
                            // </div>
                          )}
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
