import React, { useContext, useState, useEffect, useCallback } from "react";
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
import { AuthContext } from "../../contexts/AuthContext";
import PersonalInfoSection from "./sectionsPersonal/PersonalInfoSection";
import AddressAndContactSection from "./sectionsPersonal/ContactInfoSection";
import FacultySection from "./sectionsPersonal/FacultySection";
import MotivationLetterSection from "./sectionsPersonal/MotivationLetterSection";

const COUNTRIES = [
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

const PHONE_LENGTH_REQUIREMENTS = {
  EG: { min: 11, max: 11 },
  SA: { min: 9, max: 9 },
  AE: { min: 9, max: 9 },
  DZ: { min: 9, max: 10 },
  IQ: { min: 10, max: 10 },
  MA: { min: 9, max: 9 },
  SD: { min: 9, max: 9 },
  SY: { min: 9, max: 9 },
  TN: { min: 8, max: 8 },
  JO: { min: 9, max: 9 },
  LB: { min: 8, max: 8 },
  LY: { min: 9, max: 9 },
  PS: { min: 9, max: 9 },
  OM: { min: 8, max: 8 },
  KW: { min: 8, max: 8 },
  QA: { min: 8, max: 8 },
  BH: { min: 8, max: 8 },
  YE: { min: 9, max: 9 },
  MR: { min: 8, max: 8 },
  SO: { min: 8, max: 9 },
  DJ: { min: 8, max: 8 },
  KM: { min: 7, max: 7 },
  TD: { min: 8, max: 8 },
  ER: { min: 7, max: 7 },
};

const PHONE_PREFIX_PATTERNS = {
  EG: /^(0?(10|11|12|15))\d{8}$/,
  SA: /^(050|053|055|057|059|9200)\d{6}$/,
  AE: /^(050|052|055|057|058|059|077|079)\d{6}$/,
  DZ: /^(05|06|07)\d{7}$/,
  IQ: /^(077|078|079)\d{7}$/,
  MA: /^(06|07)\d{7}$/,
  SD: /^(09|01|012)\d{7}$/,
  SY: /^(09|094|095|096|097|098|099)\d{6}$/,
  TN: /^(2|3|4|5|7|9)\d{6}$/,
  JO: /^(07)\d{7}$/,
  LB: /^(03|70|71|76|78|79|81)\d{5}$/,
  LY: /^(091|092|094|095|097)\d{6}$/,
  PS: /^(059|057)\d{6}$/,
  OM: /^(91|92|93|94|95|96|97|98|99)\d{5}$/,
  KW: /^(5|6|9)\d{6}$/,
  QA: /^(3|5|6|7)\d{6}$/,
  BH: /^(3)\d{7}$/,
  YE: /^(07|73|77|78)\d{6}$/,
  MR: /^(2|3|4)\d{6}$/,
  SO: /^(6|7|9)\d{6,7}$/,
  DJ: /^(77|78)\d{6}$/,
  KM: /^(76|77|78|79)\d{4}$/,
  TD: /^(6|7|9)\d{6}$/,
  ER: /^(1|7|8)\d{5}$/,
};

const INITIAL_FORM_DATA = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  nationality: "",
  email: "",
  phone: "",
  phoneCountry: "",
  address: { country: "", city: "", street: "" },
  faculty: "",
  facultyName: "",
  GPA: "",
  motivationLetter: "",
  exam: [],
};

const STEPS = ["User Info", "Exam", "Result"];

export default function PersonalDetailsForm() {
  const { setPersonalDetails } = useContext(EnrollmentContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [errors, setErrors] = useState({});
  const [snackbarQueue, setSnackbarQueue] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);

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
          address: { ...prev.address, ...(parsedData.address || {}) },
          exam: parsedData.exam || [],
          facultyName: parsedData.facultyName || parsedData.faculty || "",
          phoneCountry:
            parsedData.phoneCountry || parsedData.address?.country || "",
        }));
      } catch (error) {
        console.error("Error parsing saved data:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);
  const validationSchema = Yup.object({
    dateOfBirth: Yup.date()
      .required("Date of birth is required")
      .min(new Date(1980, 0, 1), "Date of birth must be 1980 or later")
      .max(new Date(), "Date of birth cannot be in the future")
      .typeError("Please enter a valid date of birth"),
    nationality: Yup.string().required("Nationality is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .test("phone-validation", "Invalid phone number", function (value) {
        const { phoneCountry } = this.parent;

        if (!phoneCountry) {
          return this.createError({
            message: "Please select a country code first",
          });
        }

        if (!value) {
          return this.createError({ message: "Phone number is required" });
        }

        if (!/^[\+0-9\s\-\(\)]+$/.test(value)) {
          return this.createError({
            message:
              "Phone number must contain only digits, spaces, dashes, parentheses, or a plus sign",
          });
        }

        try {
          const country = COUNTRIES.find((c) => c.code === phoneCountry);
          if (!country) {
            return this.createError({ message: "Invalid country selected" });
          }

          const cleanedValue = value.replace(/[\s\-\(\)]/g, "");
          let normalizedValue;
          let saveValue = cleanedValue;
          const requirements = PHONE_LENGTH_REQUIREMENTS[phoneCountry] || {
            min: 8,
            max: 15,
          };

          if (phoneCountry === "EG") {
            if (cleanedValue.startsWith(country.phoneCode)) {
              normalizedValue = cleanedValue.replace(country.phoneCode, "");
              saveValue = `0${normalizedValue}`;

              if (!/^(10|11|12|15)\d{8}$/.test(normalizedValue)) {
                return this.createError({
                  message:
                    "Egyptian phone numbers must start with 010, 011, 012, or 015 after country code",
                });
              }
            } else if (cleanedValue.startsWith("0")) {
              normalizedValue = cleanedValue;
              saveValue = normalizedValue;
            } else if (/^(10|11|12|15)\d{8}$/.test(cleanedValue)) {
              normalizedValue = `0${cleanedValue}`;
              saveValue = normalizedValue;
            } else {
              normalizedValue = cleanedValue;
              saveValue = normalizedValue;
            }

            if (!/^0(10|11|12|15)\d{8}$/.test(saveValue)) {
              return this.createError({
                message:
                  "Egyptian phone numbers must be 11 digits starting with 010, 011, 012, or 015 (can omit leading 0)",
              });
            }

            if (
              saveValue.length < requirements.min ||
              saveValue.length > requirements.max
            ) {
              return this.createError({
                message: `Egyptian phone numbers must be between ${requirements.min} and ${requirements.max} digits`,
              });
            }
          } else {
            if (
              cleanedValue.startsWith(country.phoneCode) ||
              cleanedValue.startsWith(`+${country.phoneCode.slice(1)}`)
            ) {
              normalizedValue = cleanedValue
                .replace(country.phoneCode, "")
                .replace(/^\++/, "");
              saveValue = `${country.phoneCode}${normalizedValue}`;
            } else {
              normalizedValue = cleanedValue.replace(/^\+/, "");
              saveValue = `${country.phoneCode}${normalizedValue}`;
            }

            const phoneNumber = parsePhoneNumberFromString(
              saveValue,
              phoneCountry
            );
            if (!phoneNumber || !phoneNumber.isValid()) {
              return this.createError({
                message: `Invalid phone number format for ${country.label}`,
              });
            }

            if (
              normalizedValue.length < requirements.min ||
              normalizedValue.length > requirements.max
            ) {
              return this.createError({
                message: `Phone number must be between ${requirements.min} and ${requirements.max} digits for ${country.label}`,
              });
            }
          }

          const prefixPattern = PHONE_PREFIX_PATTERNS[phoneCountry];
          if (
            prefixPattern &&
            !prefixPattern.test(
              phoneCountry === "EG"
                ? saveValue.replace(/^0/, "")
                : normalizedValue
            )
          ) {
            return this.createError({
              message: `Invalid phone number prefix for ${country.label}. Please use a valid mobile prefix.`,
            });
          }

          this.parent.phone = saveValue;

          return true;
        } catch (error) {
          return this.createError({
            message: `Unable to validate phone number for ${
              COUNTRIES.find((c) => c.code === phoneCountry)?.label ||
              "selected country"
            }. Error: ${error.message}`,
          });
        }
      }),
    address: Yup.object({
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

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    if (["firstName", "lastName", "email"].includes(name)) {
      return;
    }

    setFormData((prev) => {
      let newData = { ...prev };
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        newData = {
          ...newData,
          [parent]: { ...newData[parent], [child]: value },
        };
      } else if (name === "faculty") {
        newData = { ...newData, faculty: value, facultyName: value };
      } else {
        newData = { ...newData, [name]: value };
      }

      if (name === "phoneCountry") {
        newData.address.country = value;
        newData.phone = "";
      }

      return newData;
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        if (newErrors[parent]?.[child]) {
          newErrors[parent] = { ...newErrors[parent], [child]: undefined };
          if (!Object.keys(newErrors[parent]).length) delete newErrors[parent];
        }
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  }, []);

  const handleBlur = useCallback(
    async (e) => {
      const { name } = e.target;
      if (["firstName", "lastName", "email"].includes(name)) {
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
              if (!Object.keys(newErrors[parent]).length)
                delete newErrors[parent];
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
            newErrors[parent] = {
              ...newErrors[parent],
              [child]: error.message,
            };
          } else {
            newErrors[name] = error.message;
          }
          return newErrors;
        });
      }
    },
    [formData]
  );

  const handleNext = useCallback(async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });

      const getCountryName = (code) => {
        const country = COUNTRIES.find((c) => c.code === code);
        return country ? country.label : code;
      };

      const payload = {
        ...formData,
        facultyName: formData.faculty || formData.facultyName,
        GPA: formData.GPA ? parseFloat(formData.GPA) : undefined,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        address: {
          country: getCountryName(formData.address.country) || "",
          city: formData.address.city || "",
          street: formData.address.street || "",
        },
        phoneCountry: getCountryName(formData.phoneCountry) || "",
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
  }, [formData, setPersonalDetails, navigate]);
  const handleSnackbarClose = useCallback(() => {
    setSnackbarQueue((prev) => prev.slice(1));
    setOpenSnackbar(false);
    if (snackbarQueue.length > 1) {
      setTimeout(() => setOpenSnackbar(true), 300);
    }
  }, [snackbarQueue]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom color="#46C98B">
        Personal Details and Motivation
      </Typography>

      <CustomStepper activeStep={0} steps={STEPS} />

      <PersonalInfoSection
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        handleBlur={handleBlur}
      />
      <AddressAndContactSection
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