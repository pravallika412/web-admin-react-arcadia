import * as yup from "yup";

export const DogValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .max(20, "Name cannot exceed 20 characters")
    .matches(/^(?!\s)[A-Za-z0-9\s]+$/, "Only alphanumeric characters are allowed"),
  service: yup.string().required("Service is required"),
  // photo_url: yup
  //   .mixed()
  //   .required("A file is required")
  //   .test("required", "You need to provide a file", (file) => {
  //     // return file && file.size <-- u can use this if you don't want to allow empty files to be uploaded;
  //     if (file) return true;
  //     return false;
  //   }),
  file: yup.mixed().required("A file is required"),
  gallery: yup.mixed().required("Gallery is required"),
  medals: yup.string().required("Medals field is required"),
  medical_report: yup.mixed().required("Medical Report is required"),
  profile_status: yup
    .string()
    .required("Profile Status is required")
    .max(20, "Profile Status cannot exceed 20 characters")
    .matches(/^(?!\s)[A-Za-z0-9\s]+$/, "Only alphanumeric characters are allowed"),
  breed_name: yup
    .string()
    .required("Breed Name is required")
    .max(20, "Breed Name cannot exceed 20 characters")
    .matches(/^(?!\s)[A-Za-z0-9\s]+$/, "Only alphanumeric characters are allowed"),
  dob: yup
    .date()
    .required("Date of Birth is required")
    .max(yup.ref("service_start"), "Date of Birth must be less than Service Start Date")
    .max(yup.ref("service_end"), "Date of Birth must be less than Service End Date")
    .max(yup.ref("adoption_date"), "Date of Birth must be less than Adoption Date"),
  service_start: yup
    .date()
    .required("Service Start Date is required")
    .min(yup.ref("dob"), "Service Start Date must be more than Date of Birth")
    .max(yup.ref("service_end"), "Service Start Date must be less than Service End Date")
    .max(yup.ref("adoption_date"), "Service Start Date must be less than Adoption Date"),
  service_end: yup
    .date()
    .required("Service End Date is required")
    .min(yup.ref("dob"), "Service End Date must be more than Date of Birth")
    .min(yup.ref("service_start"), "Service End Date must be more than Service Start Date")
    .max(yup.ref("adoption_date"), "Service End Date must be less than Adoption Date"),
  adoption_date: yup
    .date()
    .required("Adoption Date is required")
    .min(yup.ref("dob"), "Adoption Date must be more than Date of Birth")
    .min(yup.ref("service_start"), "Adoption Date must be more than Service Start Date")
    .min(yup.ref("service_end"), "Adoption Date must be more than Service End Date"),
  handlers_count: yup
    .number()
    .required("Handlers Count is required")
    .min(1, "Handlers Count must be greater than 0")
    .max(100, "Handlers Count must not exceed 100")
    .integer("Handlers Count must be an integer"),
});
