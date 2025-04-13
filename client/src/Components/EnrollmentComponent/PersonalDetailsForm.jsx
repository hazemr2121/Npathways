import React, { useContext, useState, useEffect } from "react";
import * as Yup from "yup";
import {
  Container,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { parsePhoneNumberFromString } from "libphonenumber-js"; 
import CustomStepper from "./CustomStepper";
import { EnrollmentContext } from "../../contexts/EnrollmentContext";
import PersonalInfoSection from "./sectionsPersonal/PersonalInfoSection";
import ContactInfoSection from "./sectionsPersonal/ContactInfoSection";
import AddressSection from "./sectionsPersonal/AddressSection";
import FacultySection from "./sectionsPersonal/FacultySection";
import MotivationLetterSection from "./sectionsPersonal/MotivationLetterSection";
import { AuthContext } from "../../contexts/AuthContext";

export default function PersonalDetailsForm() {
  const { setPersonalDetails, setStep } = useContext(EnrollmentContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeStep] = useState(0);
  const steps = ["User Info", "Exam", "Result"];

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    dateOfBirth: "",
    nationality: "",
    email: user?.email || "",
    phone: "",
    phoneCountry: "", 
    address: {
      country: "",
      city: "",
      street: "",
    },
    faculty: "",
    facultyName: "",
    GPA: "",
    motivationLetter: "",
    exam: [],
  });

  const [errors, setErrors] = useState({});
  const [snackbarQueue, setSnackbarQueue] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const validationSchema = Yup.object({
    dateOfBirth: Yup.date()
      .required("Date of birth is required")
      .min(new Date(1980, 0, 1), "Date of birth must be 1980 or later")
      .max(new Date(), "Date of birth cannot be in the future")
      .typeError("Please enter a valid date of birth"),
    nationality: Yup.string().required("Nationality is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .min(8,"  The phone number provided is too short. ")
      .test("phone-validation", "Invalid phone number for selected country", function (value) {
        const { address } = this.parent;
        const phoneCountry = address?.country || "";
        if (!phoneCountry) {
          return this.createError({ message: "Please select a country first" });
        }
        if (!value) {
          return this.createError({ message: "Phone number is required" });
        }
        try {
          const country = countries.find((c) => c.code === phoneCountry);
          let normalizedValue = value;
          if (country && value.startsWith(country.phoneCode)) {
            normalizedValue = value.replace(country.phoneCode, "").trim();
          }
          const phoneNumber = parsePhoneNumberFromString(normalizedValue, phoneCountry);
          if (!phoneNumber) {
            return this.createError({ message: "Invalid phone number format" });
          }
          if (!phoneNumber.isValid()) {
            return this.createError({
              message: `Phone number is not valid for ${country?.label || "selected country"}`,
            });
          }
          return true;
        } catch (error) {
          return this.createError({ message: "Error validating phone number" });
        }
      }),
    address: Yup.object().shape({
      country: Yup.string().required("Country is required"),
      city: Yup.string(),
      street: Yup.string(),
    }),
    faculty: Yup.string().required("Faculty is required"),
    facultyName: Yup.string().required("Faculty is required"),
    GPA: Yup.number()
      .required("GPA is required")
      .min(0, "GPA must be between 0-4")
      .max(4, "GPA must be between 0-4")
      .typeError("Enter a valid GPA"),
    motivationLetter: Yup.string()
      .required("Motivation letter is required")
      .min(50, "Motivation letter must be at least 50 characters"),
  });

  // Shared countries array (for reference in validation)
  const countries = [
    { code: "EG", label: "Egypt", phoneCode: "+20" },
    { code: "SA", label: "Saudi Arabia", phoneCode: "+966" },
    { code: "AE", label: "United Arab Emirates", phoneCode: "+971" },
    { code: "DZ", label: "Algeria", phoneCode: "+213" },
    { code: "IQ", label: "Iraq", phoneCode: "+964" },
    { code: "MA", label: "Morocco", phoneCode: "+212" },
    { code: "SD", label: "Sudan", phoneCode: "+249" },
    { code: "SY", label: "Syria", phoneCode: "+963" },
    { code: "TN", label: "Tunisia", phoneCode: "+216" },
    { code: "JO", label: "Jordan", phoneCode: "+962" },
    { code: "LB", label: "Lebanon", phoneCode: "+961" },
    { code: "LY", label: "Libya", phoneCode: "+218" },
    { code: "PS", label: "Palestine", phoneCode: "+970" },
    { code: "OM", label: "Oman", phoneCode: "+968" },
    { code: "KW", label: "Kuwait", phoneCode: "+965" },
    { code: "QA", label: "Qatar", phoneCode: "+974" },
    { code: "BH", label: "Bahrain", phoneCode: "+973" },
    { code: "YE", label: "Yemen", phoneCode: "+967" },
    { code: "MR", label: "Mauritania", phoneCode: "+222" },
    { code: "SO", label: "Somalia", phoneCode: "+252" },
    { code: "DJ", label: "Djibouti", phoneCode: "+253" },
    { code: "KM", label: "Comoros", phoneCode: "+269" },
    { code: "TD", label: "Chad", phoneCode: "+235" },
    { code: "ER", label: "Eritrea", phoneCode: "+291" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "firstName" || name === "lastName" || name === "email") {
      return;
    }

    setFormData((prev) => {
      let newData = { ...prev };
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        newData = {
          ...newData,
          [parent]: {
            ...newData[parent],
            [child]: value,
          },
        };
      } else if (name === "faculty") {
        newData = {
          ...newData,
          faculty: value,
          facultyName: value,
        };
      } else {
        newData = { ...newData, [name]: value };
      }

       if (name === "address.country") {
        newData.phoneCountry = value;
      }

      return newData;
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        if (newErrors[parent]?.[child]) {
          newErrors[parent] = { ...newErrors[parent], [child]: undefined };
          if (Object.keys(newErrors[parent]).length === 0) delete newErrors[parent];
        }
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    if (name === "firstName" || name === "lastName" || name === "email") {
      return;
    }
    try {
       await validationSchema.validateAt(name, formData);
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (name.includes(".")) {
          const [parent, child] = name.split(".");
          if (newErrors[parent]) {
            newErrors[parent] = { ...newErrors[parent], [child]: undefined };
            if (Object.keys(newErrors[parent]).length === 0) delete newErrors[parent];
          }
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
    } catch (error) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (name.includes(".")) {
          const [parent, child] = name.split(".");
          newErrors[parent] = { ...newErrors[parent], [child]: error.message };
        } else {
          newErrors[name] = error.message;
        }
        return newErrors;
      });
    }
  };

  const handleNext = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });

      const payload = {
        ...formData,
        facultyName: formData.faculty || formData.facultyName,
        GPA: formData.GPA ? parseFloat(formData.GPA) : undefined,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        address: {
          country: formData.address.country || "",
          city: formData.address.city || "",
          street: formData.address.street || "",
        },
      };

      setErrors({});
      setPersonalDetails(payload);
      navigate("/enrollment/entryExam");
    } catch (error) {
      const validationErrors = {};
      const errorMessages = [];

      error.inner.forEach((err) => {
        validationErrors[err.path] = err.message;
        errorMessages.push(err.message);
      });

      setErrors(validationErrors);
      setSnackbarQueue(errorMessages);
      setOpenSnackbar(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarQueue((prev) => prev.slice(1));
    setOpenSnackbar(false);
    if (snackbarQueue.length > 1) {
      setTimeout(() => setOpenSnackbar(true), 300);
    }
  };

  useEffect(() => {
    const savedData = localStorage.getItem("formData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData((prev) => ({
          ...prev,
          ...parsedData,
          firstName: user?.firstName || prev.firstName,
          lastName: user?.lastName || prev.lastName,
          email: user?.email || prev.email,
          address: {
            ...prev.address,
            ...(parsedData.address || {}),
          },
          exam: parsedData.exam || [],
          facultyName: parsedData.facultyName || parsedData.faculty || "",
          phoneCountry: parsedData.address?.country || "",
        }));
      } catch (error) {
        console.error("Error parsing saved data", error);
      }
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom color="#46C98B">
        Personal Details and Motivation
      </Typography>

      <CustomStepper activeStep={activeStep} steps={steps} />

      <PersonalInfoSection
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        handleBlur={handleBlur}
      />

      <ContactInfoSection
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        handleBlur={handleBlur}
      />

      <AddressSection
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        handleBlur={handleBlur}
      />

      <FacultySection
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        handleBlur={handleBlur}
      />

      <MotivationLetterSection
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        handleBlur={handleBlur}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          variant="contained"
          color="error"
          onClick={() => navigate("/enrollment/Welcome")}
          startIcon={<ArrowBackIcon />}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleNext}
          endIcon={<ArrowForwardIcon />}
        >
          Next Step
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="error"
          onClose={handleSnackbarClose}
          sx={{ width: "100%" }}
        >
          {snackbarQueue[0] || ""}
        </Alert>
      </Snackbar>
    </Container>
  );
}