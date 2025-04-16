import React, { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import {
  Avatar,
  TextField,
  Button,
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  FormHelperText,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
} from "@mui/material";
import { AuthContext } from "../../../contexts/AuthContext";
import { useFormik } from "formik";
import * as yup from "yup";
import { Grid } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// Constants from PersonalDetailsForm
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

export default function ProfileSection() {
  const { isAuthenticated } = useContext(AuthContext);
  const userId = localStorage.getItem("userId");
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showEnrollmentFields, setShowEnrollmentFields] = useState(false);

  const validationSchema = yup.object({
    firstName: yup
      .string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .matches(/^[A-Za-z]+$/, "First name can only contain letters"),
    lastName: yup
      .string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .matches(/^[A-Za-z]+$/, "Last name can only contain letters"),
    gpa: yup
      .number()
      .min(0, "GPA must be between 0-4")
      .max(4, "GPA must be between 0-4")
      .test(
        "decimal-places",
        "GPA can have at most 2 decimal places",
        (value) =>
          value === undefined || /^\d+(\.\d{0,2})?$/.test(value.toString())
      ),
    country: yup.string().required("Country is required"),
    city: yup.string(),
    street: yup.string(),
    phoneCountry: yup.string().required("Phone country code is required"),
    phone: yup
      .string()
      .test("phone-validation", "Invalid phone number", function (value) {
        const { phoneCountry } = this.parent;

        if (!phoneCountry) {
          return this.createError({
            message: "Please select a country code first",
          });
        }

        if (!value) return true; // Make phone optional in profile

        if (!/^[+0-9\s\-()]+$/.test(value)) {
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

          const cleanedValue = value.replace(/[\s\-()]/g, "");
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
            message: `Unable to validate phone number. Error: ${error.message}`,
          });
        }
      }),
    nationality: yup.string(),
    dateOfBirth: yup
      .date()
      .min(new Date(1980, 0, 1), "Birth Of Data must be after 1980")
      .max(new Date(), "Birth of Data can't be in the future"),
    facultyName: yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      gpa: "",
      country: "",
      city: "",
      street: "",
      phone: "",
      phoneCountry: "",
      nationality: "",
      dateOfBirth: null,
      facultyName: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        // Update user data (first name, last name)
        await axios.patch(
          `http://localhost:5024/api/student`,
          {
            firstName: values.firstName,
            lastName: values.lastName,
          },
          { withCredentials: true }
        );

        // Only update enrollment data if it exists
        if (enrollmentData && enrollmentData._id) {
          await axios.put(
            `http://localhost:5024/api/enrollment/updateEnrollment/${enrollmentData._id}`,
            {
              GPA: values.gpa,
              address: {
                country: values.country,
                city: values.city,
                street: values.street,
              },
              phone: values.phone,
              nationality: values.nationality,
              dateOfBirth: values.dateOfBirth,
              facultyName: values.facultyName,
            },
            { withCredentials: true }
          );
        }

        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        console.error("Save failed:", err);
        setError("Failed to save changes");
      }
    },
  });

  const handleImageClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageForm = new FormData();
    imageForm.append("image", file);
    try {
      const res = await axios.post(
        `http://localhost:5024/api/user/changUserImage/`,
        imageForm,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      setUserData((prev) => ({ ...prev, image: res.data.user.image }));
      fileInputRef.current.value = "";
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  // Extract phone country code from phone number
  const extractPhoneCountryCode = (phone, country) => {
    if (!phone) return "";

    // Try to find the country code from phone
    for (const c of COUNTRIES) {
      if (phone.startsWith(c.phoneCode)) {
        return c.code;
      }
    }

    // If phone is an Egyptian number with leading 0
    if (phone.startsWith("01") && phone.length === 11) {
      return "EG";
    }

    // Default to user's country if available
    if (country) {
      const foundCountry = COUNTRIES.find(
        (c) => c.label.toLowerCase() === country.toLowerCase()
      );
      if (foundCountry) return foundCountry.code;
    }

    return "EG"; // Default to Egypt if nothing else matches
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(
          `http://localhost:5024/api/user/${userId}`,
          {
            withCredentials: true,
          }
        );
        setUserData(userRes.data);

        formik.setValues((prev) => ({
          ...prev,
          firstName: userRes.data.firstName || "",
          lastName: userRes.data.lastName || "",
        }));
      } catch (err) {
        console.error("User fetch error:", err);
        setError("Failed to fetch user data");
      }

      try {
        // Try to fetch enrollment data
        const enrollmentRes = await axios.get(
          `http://localhost:5024/api/enrollment/user/${userId}`,
          {
            withCredentials: true,
          }
        );

        // Check if enrollment data exists and has at least one item
        if (enrollmentRes.data && enrollmentRes.data.length > 0) {
          const enrollment = enrollmentRes.data[0];
          setEnrollmentData(enrollment);
          setShowEnrollmentFields(true);

          const phoneCountryCode = extractPhoneCountryCode(
            enrollment.phone,
            enrollment.address?.country
          );

          formik.setValues((prev) => ({
            ...prev,
            gpa: enrollment.GPA || "",
            country: enrollment.address?.country || "",
            city: enrollment.address?.city || "",
            street: enrollment.address?.street || "",
            phone: enrollment.phone || "",
            phoneCountry: phoneCountryCode,
            nationality: enrollment.nationality || "",
            dateOfBirth: enrollment.dateOfBirth
              ? new Date(enrollment.dateOfBirth)
              : null,
            facultyName: enrollment.facultyName || "",
          }));
        } else {
          setShowEnrollmentFields(false);
        }
      } catch (err) {
        console.warn("Enrollment fetch failed (but user loaded):", err);
        setShowEnrollmentFields(false);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && userId) fetchData();
  }, [userId, isAuthenticated]);

  const handleCancel = () => {
    if (userData && enrollmentData) {
      const phoneCountryCode = extractPhoneCountryCode(
        enrollmentData.phone,
        enrollmentData.address?.country
      );

      formik.setValues({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        gpa: enrollmentData.GPA || "",
        country: enrollmentData.address?.country || "",
        city: enrollmentData.address?.city || "",
        street: enrollmentData.address?.street || "",
        phone: enrollmentData.phone || "",
        phoneCountry: phoneCountryCode,
        nationality: enrollmentData.nationality || "",
        dateOfBirth: enrollmentData.dateOfBirth
          ? new Date(enrollmentData.dateOfBirth)
          : null,
        facultyName: enrollmentData.facultyName || "",
      });
    }
    setIsEditing(false);
  };

  if (!isAuthenticated) return <Typography>Please log in.</Typography>;
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const getCountryPhoneCode = (countryCode) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    return country ? country.phoneCode : "";
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Grid container justifyContent="center">
        <Grid item xs={12} md={6}>
          <Box sx={{ my: 4, textAlign: "center" }}>
            {saveSuccess && (
              <Alert severity="success">Changes saved successfully!</Alert>
            )}
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
            <Avatar
              src={userData?.image}
              onClick={handleImageClick}
              sx={{
                width: 120,
                height: 120,
                cursor: "pointer",
                mb: 2,
                mx: "auto",
              }}
            />
            {/* <Typography variant="h6" mb={2}>
              {userData.track} - Level {userData.level}
            </Typography> */}
            <Typography
              color={userData.status === "active" ? "green" : "red"}
              mb={2}
            >
              Status: {userData.status}
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={2} maxWidth={600} mx="auto">
                {/* Always show basic user fields */}
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Basic Information
                </Typography>

                <TextField
                  name="firstName"
                  label="First Name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  error={
                    formik.touched.firstName && Boolean(formik.errors.firstName)
                  }
                  helperText={
                    formik.touched.firstName && formik.errors.firstName
                  }
                  fullWidth
                />

                <TextField
                  name="lastName"
                  label="Last Name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  error={
                    formik.touched.lastName && Boolean(formik.errors.lastName)
                  }
                  helperText={formik.touched.lastName && formik.errors.lastName}
                  fullWidth
                />

                <TextField
                  label="Email"
                  value={userData.email}
                  disabled
                  fullWidth
                />

                {/* Only show enrollment-related fields if enrollment data exists */}
                {showEnrollmentFields && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6">Enrollment Information</Typography>

                    {/* Additional fields */}
                    {[
                      "nationality",
                      "country",
                      "city",
                      "street",
                      "facultyName",
                      "gpa",
                    ].map((field) => (
                      <TextField
                        key={field}
                        name={field}
                        label={
                          field.charAt(0).toUpperCase() +
                          field.slice(1).replace(/([A-Z])/g, " $1")
                        }
                        value={formik.values[field]}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={!isEditing}
                        error={
                          formik.touched[field] && Boolean(formik.errors[field])
                        }
                        helperText={
                          formik.touched[field] && formik.errors[field]
                        }
                        fullWidth
                      />
                    ))}

                    {/* Phone Country Selector */}
                    <FormControl
                      fullWidth
                      error={
                        formik.touched.phoneCountry &&
                        Boolean(formik.errors.phoneCountry)
                      }
                    >
                      <InputLabel id="phone-country-label">
                        Phone Country
                      </InputLabel>
                      <Select
                        labelId="phone-country-label"
                        id="phoneCountry"
                        name="phoneCountry"
                        value={formik.values.phoneCountry}
                        onChange={(e) => {
                          formik.setFieldValue("phoneCountry", e.target.value);
                          formik.setFieldValue("phone", ""); // Reset phone when country changes
                        }}
                        onBlur={formik.handleBlur}
                        disabled={!isEditing}
                        label="Phone Country"
                      >
                        {COUNTRIES.map((country) => (
                          <MenuItem key={country.code} value={country.code}>
                            {country.label} ({country.phoneCode})
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.phoneCountry &&
                        formik.errors.phoneCountry && (
                          <FormHelperText>
                            {formik.errors.phoneCountry}
                          </FormHelperText>
                        )}
                    </FormControl>

                    {/* Phone Input */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body1" sx={{ minWidth: "60px" }}>
                        {getCountryPhoneCode(formik.values.phoneCountry)}
                      </Typography>
                      <TextField
                        fullWidth
                        name="phone"
                        label="Phone Number"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={!isEditing}
                        error={
                          formik.touched.phone && Boolean(formik.errors.phone)
                        }
                        helperText={formik.touched.phone && formik.errors.phone}
                        placeholder={
                          formik.values.phoneCountry === "EG"
                            ? "01xxxxxxxxx"
                            : "Phone number"
                        }
                      />
                    </Box>

                    <DatePicker
                      selected={formik.values.dateOfBirth}
                      onChange={(date) =>
                        formik.setFieldValue("dateOfBirth", date)
                      }
                      onBlur={formik.handleBlur}
                      disabled={!isEditing}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select date of birth"
                      showYearDropdown
                      dropdownMode="select"
                      customInput={
                        <TextField
                          label="Date of Birth"
                          error={
                            formik.touched.dateOfBirth &&
                            Boolean(formik.errors.dateOfBirth)
                          }
                          helperText={
                            formik.touched.dateOfBirth &&
                            formik.errors.dateOfBirth
                          }
                          fullWidth
                        />
                      }
                    />
                  </>
                )}

                {isEditing ? (
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button type="submit" variant="contained">
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Stack>
            </form>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
