// import React, { useState, useContext, useEffect, useRef } from "react";
// import axios from "axios";
// import {
//   Avatar,
//   TextField,
//   Button,
//   Box,
//   Stack,
//   Typography,
//   CircularProgress,
//   Alert,
//   FormHelperText,
// } from "@mui/material";
// import { AuthContext } from "../../../contexts/AuthContext";
// import * as yup from "yup";

// export default function ProfileSection() {
//   const { isAuthenticated } = useContext(AuthContext);
//   const userId = localStorage.getItem("userId");
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//   });
//   const [formErrors, setFormErrors] = useState({
//     firstName: "",
//     lastName: "",
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [saveSuccess, setSaveSuccess] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const fileInputRef = useRef(null);

//   const handleImageClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileChange = async (event) => {
//     if (event.target.files && event.target.files[0]) {
//       const file = event.target.files[0];
//       setSelectedFile(file);
//       await uploadProfilePicture(file);
//       // Reset the file input element after upload completes
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     }
//   };

//   async function uploadProfilePicture(imageFile) {
//     const formData = new FormData();
//     formData.append("image", imageFile);
//     await axios
//       .post(`http://localhost:5024/api/user/changUserImage/`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//         withCredentials: true,
//       })
//       .then((response) => {
//         setUserData((prevData) => ({
//           ...prevData,
//           image: response.data.user.image,
//         }));
//         setSelectedFile(null);
//         // console.log(response.data.user.image);
//       })
//       .catch((error) => {
//         console.error("Error uploading image:", error);
//       });
//   }

//   // Fetch user data from the API
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const response = await axios.get(
//           `http://localhost:5024/api/user/${userId}`,
//           { withCredentials: true }
//         );
//         setUserData(response.data);
//         setFormData({
//           firstName: response.data.firstName,
//           lastName: response.data.lastName,
//         });
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//         setError("Failed to fetch user data. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isAuthenticated && userId) {
//       fetchUserData();
//     }
//   }, [userId, isAuthenticated]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const validationSchema = yup.object({
//     firstName: yup
//       .string()
//       .trim()
//       .required("First name is required")
//       .min(3, "First name must be at least 3 characters")
//       .max(30, "First name should not exceed 30 characters")
//       .matches(/^[a-zA-Z\s]+$/, "First name should contain only letters"),
//     lastName: yup
//       .string()
//       .trim()
//       .required("Last name is required")
//       .min(3, "Last name must be at least 3 characters")
//       .max(30, "First name should not exceed 30 characters")
//       .matches(/^[a-zA-Z\s]+$/, "Last name should contain only letters"),
//   });

//   const validateField = (name, value) => {
//     try {
//       // Validate just the field with the provided name and value
//       validationSchema.validateSyncAt(name, { [name]: value });
//       return "";
//     } catch (error) {
//       return error.message;
//     }
//   };

//   const handleBlur = (e) => {
//     if (!isEditing) return;

//     const { name, value } = e.target;
//     const errorMessage = validateField(name, value);

//     setFormErrors((prev) => ({
//       ...prev,
//       [name]: errorMessage,
//     }));
//   };

//   const validateForm = () => {
//     const errors = {
//       firstName: validateField("firstName", formData.firstName),
//       lastName: validateField("lastName", formData.lastName),
//     };

//     setFormErrors(errors);

//     return !Object.values(errors).some((error) => error);
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//     axios.patch(
//       `http://localhost:5024/api/student`,
//       {
//         withCredentials: true,
//       },
//       {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//       }
//     );
//   };

//   const handleSave = async () => {
//     try {
//       // Validate all fields before saving
//       if (!validateForm()) {
//         return;
//       }

//       // Make API call to update user data
//       const response = await axios.patch(
//         `http://localhost:5024/api/student`,
//         {
//           firstName: formData.firstName,
//           lastName: formData.lastName,
//         },
//         {
//           withCredentials: true,
//         }
//       );

//       // Update local state with the response data
//       setUserData({
//         ...userData,
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//       });
//       setIsEditing(false);
//       setSaveSuccess(true);

//       // Hide success message after 3 seconds
//       setTimeout(() => {
//         setSaveSuccess(false);
//       }, 3000);
//     } catch (err) {
//       console.error("Error updating profile:", err);
//       setError("Failed to update profile. Please try again.");
//     }
//   };

//   const handleCancel = () => {
//     setFormData({
//       firstName: userData.firstName,
//       lastName: userData.lastName,
//     });
//     setFormErrors({
//       firstName: "",
//       lastName: "",
//     });
//     setIsEditing(false);
//   };

//   if (!isAuthenticated) {
//     return (
//       <Box sx={{ textAlign: "center", mt: 5 }}>
//         <Typography variant="h6">Please login to view this page</Typography>
//       </Box>
//     );
//   }

//   if (loading) {
//     return (
//       <Stack alignItems="center" justifyContent="center" minHeight="200px">
//         <CircularProgress />
//       </Stack>
//     );
//   }

//   if (error) {
//     return (
//       <Box sx={{ textAlign: "center", mt: 5 }}>
//         <Alert severity="error">{error}</Alert>
//       </Box>
//     );
//   }

//   if (!userData) {
//     setLoading(false);
//     return (
//       <Box sx={{ textAlign: "center", mt: 5 }}>
//         <Typography variant="h6">No user data found.</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         my: 4,
//       }}
//     >
//       {saveSuccess && (
//         <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
//           Profile updated successfully!
//         </Alert>
//       )}

//       <input
//         type="file"
//         accept="image/*"
//         style={{ display: "none" }}
//         ref={fileInputRef}
//         onChange={handleFileChange}
//       />

//       <Avatar
//         sx={{
//           width: 200,
//           height: 200,
//           mb: 4,
//           bgcolor: "primary.light",
//           fontSize: "4rem",
//           cursor: "pointer",
//         }}
//         alt={`${userData.firstName} ${userData.lastName}`}
//         src={
//           userData.image ||
//           `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=random&size=200`
//         }
//         onClick={handleImageClick}
//       />

//       <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
//         Click to change profile picture
//       </Typography>

//       <Typography variant="h5" gutterBottom>
//         {userData.track} - Level {userData.level}
//       </Typography>
//       <Typography
//         variant="subtitle1"
//         sx={{
//           color: userData.status === "active" ? "success.main" : "error.main",
//           fontWeight: "bold",
//           mb: 4,
//         }}
//       >
//         Status: {userData.status}
//       </Typography>

//       {/* Profile Form Fields */}
//       <Stack spacing={2} sx={{ width: "100%", maxWidth: 500 }}>
//         <Box>
//           <TextField
//             fullWidth
//             label="First Name"
//             name="firstName"
//             value={formData.firstName}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             variant="outlined"
//             disabled={!isEditing}
//             error={!!formErrors.firstName}
//           />
//           {formErrors.firstName && (
//             <FormHelperText error>{formErrors.firstName}</FormHelperText>
//           )}
//         </Box>

//         <Box>
//           <TextField
//             fullWidth
//             label="Last Name"
//             name="lastName"
//             value={formData.lastName}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             variant="outlined"
//             disabled={!isEditing}
//             error={!!formErrors.lastName}
//           />
//           {formErrors.lastName && (
//             <FormHelperText error>{formErrors.lastName}</FormHelperText>
//           )}
//         </Box>

//         <Box>
//           <TextField
//             fullWidth
//             label="Email"
//             value={userData.email}
//             variant="outlined"
//             disabled={true}
//             InputProps={{
//               readOnly: true,
//             }}
//           />
//         </Box>

//         {isEditing ? (
//           <Stack direction="row" spacing={2} justifyContent="center">
//             <Button
//               variant="contained"
//               color="primary"
//               size="large"
//               onClick={handleSave}
//               sx={{ borderRadius: "30px", minWidth: 120 }}
//             >
//               Save
//             </Button>
//             <Button
//               variant="outlined"
//               color="error"
//               size="large"
//               onClick={handleCancel}
//               sx={{ borderRadius: "30px", minWidth: 120 }}
//             >
//               Cancel
//             </Button>
//           </Stack>
//         ) : (
//           <Button
//             variant="contained"
//             color="primary"
//             size="large"
//             onClick={handleEdit}
//             sx={{ borderRadius: "30px", alignSelf: "center", minWidth: 120 }}
//           >
//             Edit Profile
//           </Button>
//         )}
//       </Stack>
//     </Box>
//   );
// }


// /////////////////////////////////////////////



import React, { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import {
  Avatar, TextField, Button, Box, Stack, Typography,
  CircularProgress, Alert, FormHelperText
} from "@mui/material";
import { AuthContext } from "../../../contexts/AuthContext";
import { useFormik } from "formik";
import * as yup from "yup";
import { Grid } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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

  const validationSchema = yup.object({
    firstName: yup.string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .matches(/^[A-Za-z]+$/, "First name can only contain letters"),
    lastName: yup.string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .matches(/^[A-Za-z]+$/, "Last name can only contain letters"),
    gpa: yup.number()
      .required("GPA is required")
      .min(0, "GPA must be between 0-4")
      .max(4, "GPA must be between 0-4")
      .test("decimal-places", "GPA can have at most 2 decimal places", value =>
        value === undefined || /^\d+(\.\d{0,2})?$/.test(value.toString())),
    country: yup.string().required("Country is required"),
    city: yup.string(),
    street: yup.string(),
    phone: yup.string().test('phone', 'Phone number is not valid', value => {
      if (!value) return true;
      return value.length >= 8; 
    }),
    nationality: yup.string(),
    dateOfBirth: yup.date()
      .required("Date of birth is required")
      .min(new Date(1980, 0, 1), "DOB must be after 1980")
      .max(new Date(), "DOB can't be in the future"),
    facultyName: yup.string()
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
      nationality: "",
      dateOfBirth: null,
      facultyName: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.patch(`http://localhost:5024/api/student`, {
          firstName: values.firstName,
          lastName: values.lastName
        }, { withCredentials: true });

        await axios.put(
          `http://localhost:5024/api/enrollment/updateEnrollment/${enrollmentData._id}`,
          {
            GPA: values.gpa,
            address: {
              country: values.country,
              city: values.city,
              street: values.street
            },
            phone: values.phone,
            nationality: values.nationality,
            dateOfBirth: values.dateOfBirth,
            facultyName: values.facultyName,
          },
          { withCredentials: true }
        );

        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        console.error("Save failed:", err);
        setError("Failed to save changes");
      }
    }
  });

  const handleImageClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageForm = new FormData();
    imageForm.append("image", file);
    try {
      const res = await axios.post(`http://localhost:5024/api/user/changUserImage/`, imageForm, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      setUserData(prev => ({ ...prev, image: res.data.user.image }));
      fileInputRef.current.value = "";
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, enrollmentRes] = await Promise.all([
          axios.get(`http://localhost:5024/api/user/${userId}`, { withCredentials: true }),
          axios.get(`http://localhost:5024/api/enrollment/user/${userId}`, { withCredentials: true })
        ]);
        const enrollment = enrollmentRes.data[0];
        setUserData(userRes.data);
        setEnrollmentData(enrollment);
        
        formik.setValues({
          firstName: userRes.data.firstName,
          lastName: userRes.data.lastName,
          gpa: enrollment.GPA,
          country: enrollment.address?.country || "",
          city: enrollment.address?.city || "",
          street: enrollment.address?.street || "",
          phone: enrollment.phone || "",
          nationality: enrollment.nationality || "",
          dateOfBirth: enrollment.dateOfBirth ? new Date(enrollment.dateOfBirth) : null,
          facultyName: enrollment.facultyName || "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && userId) fetchData();
  }, [userId, isAuthenticated]);

  const handleCancel = () => {
    if (userData && enrollmentData) {
      formik.setValues({
        firstName: userData.firstName,
        lastName: userData.lastName,
        gpa: enrollmentData.GPA,
        country: enrollmentData.address?.country || "",
        city: enrollmentData.address?.city || "",
        street: enrollmentData.address?.street || "",
        phone: enrollmentData.phone || "",
        nationality: enrollmentData.nationality || "",
        dateOfBirth: enrollmentData.dateOfBirth ? new Date(enrollmentData.dateOfBirth) : null,
        facultyName: enrollmentData.facultyName || "",
      });
    }
    setIsEditing(false);
  };

  if (!isAuthenticated) return <Typography>Please log in.</Typography>;
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={6}>
          <Box sx={{ my: 4, textAlign: "center" }}>
            {saveSuccess && <Alert severity="success">Changes saved successfully!</Alert>}
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
            <Avatar
              src={userData?.image}
              onClick={handleImageClick}
              sx={{ width: 120, height: 120, cursor: "pointer", mb: 2, mx: "auto" }}
            />
            <Typography variant="h6" mb={2}>
              {userData.track} - Level {userData.level}
            </Typography>
            <Typography color={userData.status === "active" ? "green" : "red"} mb={2}>
              Status: {userData.status}
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={2} maxWidth={600} mx="auto">
                {["firstName", "lastName", "nationality", "country", "city", "street", "facultyName", "gpa"].map(field => (
                  <TextField
                    key={field}
                    name={field}
                    label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                    value={formik.values[field]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    error={formik.touched[field] && Boolean(formik.errors[field])}
                    helperText={formik.touched[field] && formik.errors[field]}
                    fullWidth
                  />
                ))}

                <PhoneInput
                  country={'us'}
                  value={formik.values.phone}
                  onChange={(value) => formik.setFieldValue('phone', value)}
                  disabled={!isEditing}
                  inputStyle={{ width: '100%' }}
                  containerStyle={{ width: '100%' }}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <FormHelperText error>{formik.errors.phone}</FormHelperText>
                )}

                <TextField 
                  label="Email" 
                  value={userData.email} 
                  disabled 
                  fullWidth 
                />

                <DatePicker
                  selected={formik.values.dateOfBirth}
                  onChange={(date) => formik.setFieldValue('dateOfBirth', date)}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select date of birth"
                  showYearDropdown
                  dropdownMode="select"
                  customInput={
                    <TextField
                      label="Date of Birth"
                      error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                      helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                      fullWidth
                    />
                  }
                />

                {isEditing ? (
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button type="submit" variant="contained">Save</Button>
                    <Button variant="outlined" color="error" onClick={handleCancel}>Cancel</Button>
                  </Stack>
                ) : (
                  <Button variant="contained" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </Stack>
            </form>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
 