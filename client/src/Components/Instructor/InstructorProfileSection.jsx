import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  FormHelperText,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import * as yup from "yup";

export default function InstructorProfileSection() {
  const { isAuthenticated } = useContext(AuthContext);
  const instructorID = localStorage.getItem("instructorID");
  const [instructorData, setInstructorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      await uploadProfilePicture(file);
      // Reset the file input element after upload completes
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  async function uploadProfilePicture(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);
    await axios
      .post(
        `http://localhost:5024/api/instructor/changeInstructorImage/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      )
      .then((response) => {
        setInstructorData((prevData) => ({
          ...prevData,
          image: response.data.instructor.image,
        }));
        setSelectedFile(null);
        // console.log(response.data.instructor.image);
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
      });
  }

  // Fetch instructor data from the API
  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5024/api/instructor/`,
          { withCredentials: true }
        );
        setInstructorData(response.data);
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          image: response.data.image,
        });
      } catch (error) {
        console.error("Error fetching instructor data:", error);
        setError("Failed to fetch instructor data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && instructorID) {
      fetchInstructorData();
    }
  }, [instructorID, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validationSchema = yup.object({
    firstName: yup
      .string()
      .trim()
      .required("First name is required")
      .min(3, "First name must be at least 3 characters")
      .max(30, "First name should not exceed 30 characters")
      .matches(/^[a-zA-Z\s]+$/, "First name should contain only letters"),
    lastName: yup
      .string()
      .trim()
      .required("Last name is required")
      .min(3, "Last name must be at least 3 characters")
      .max(30, "Last name should not exceed 30 characters")
      .matches(/^[a-zA-Z\s]+$/, "Last name should contain only letters"),
  });

  const validateField = (name, value) => {
    try {
      // Validate just the field with the provided name and value
      validationSchema.validateSyncAt(name, { [name]: value });
      return "";
    } catch (error) {
      return error.message;
    }
  };

  const handleBlur = (e) => {
    if (!isEditing) return;

    const { name, value } = e.target;
    const errorMessage = validateField(name, value);

    setFormErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  };

  const validateForm = () => {
    const errors = {
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
    };

    setFormErrors(errors);

    return !Object.values(errors).some((error) => error);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Validate all fields before saving
      if (!validateForm()) {
        return;
      }

      // You would implement the API call to update instructor data here
      // For now, just simulate a successful update
      setInstructorData({
        ...instructorData,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      setIsEditing(false);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: instructorData.firstName,
      lastName: instructorData.lastName,
      email: instructorData.email,
    });
    setFormErrors({
      firstName: "",
      lastName: "",
    });
    setIsEditing(false);
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h6">Please login to view this page</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="200px">
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!instructorData) {
    setLoading(false);
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h6">No instructor data found.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        my: 4,
      }}
    >
      {saveSuccess && (
        <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
          Profile updated successfully!
        </Alert>
      )}
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <Avatar
        sx={{
          width: 200,
          height: 200,
          mb: 4,
          bgcolor: "primary.light",
          fontSize: "4rem",
          cursor: "pointer",
        }}
        alt={`${instructorData.firstName} ${instructorData.lastName}`}
        src={
          instructorData.image ||
          `https://ui-avatars.com/api/?name=${instructorData.firstName}+${instructorData.lastName}&background=random&size=200`
        }
        onClick={handleImageClick}
      />

      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
        Click to change profile picture
      </Typography>

      {/* Profile Form Fields */}
      <Stack spacing={2} sx={{ width: "100%", maxWidth: 500 }}>
        <Box>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            variant="outlined"
            disabled={!isEditing}
            error={!!formErrors.firstName}
          />
          {formErrors.firstName && (
            <FormHelperText error>{formErrors.firstName}</FormHelperText>
          )}
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            variant="outlined"
            disabled={!isEditing}
            error={!!formErrors.lastName}
          />
          {formErrors.lastName && (
            <FormHelperText error>{formErrors.lastName}</FormHelperText>
          )}
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Email"
            value={instructorData.email}
            variant="outlined"
            disabled={true}
            InputProps={{
              readOnly: true,
            }}
          />
          <FormHelperText>Email cannot be changed</FormHelperText>
        </Box>

        {isEditing ? (
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSave}
              sx={{ borderRadius: "30px", minWidth: 120 }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="large"
              onClick={handleCancel}
              sx={{ borderRadius: "30px", minWidth: 120 }}
            >
              Cancel
            </Button>
          </Stack>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleEdit}
            sx={{ borderRadius: "30px", alignSelf: "center", minWidth: 120 }}
          >
            Edit Profile
          </Button>
        )}
      </Stack>
    </Box>
  );
}
