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
} from "@mui/material";
import { AuthContext } from "../../../contexts/AuthContext";
import * as yup from "yup";

export default function ProfileSection() {
  const { isAuthenticated } = useContext(AuthContext);
  const userId = localStorage.getItem("userId");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
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
      .post(`http://localhost:5024/api/user/changUserImage/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      })
      .then((response) => {
        setUserData((prevData) => ({
          ...prevData,
          image: response.data.user.image,
        }));
        setSelectedFile(null);
        // console.log(response.data.user.image);
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
      });
  }

  // Fetch user data from the API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5024/api/user/${userId}`,
          { withCredentials: true }
        );
        setUserData(response.data);
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && userId) {
      fetchUserData();
    }
  }, [userId, isAuthenticated]);

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
      .max(30, "First name should not exceed 30 characters")
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

      // You would implement the API call to update user data here
      // For now, just simulate a successful update
      setUserData({
        ...userData,
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
      firstName: userData.firstName,
      lastName: userData.lastName,
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

  if (!userData) {
    setLoading(false);
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h6">No user data found.</Typography>
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
        alt={`${userData.firstName} ${userData.lastName}`}
        src={
          userData.image ||
          `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=random&size=200`
        }
        onClick={handleImageClick}
      />

      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
        Click to change profile picture
      </Typography>

      <Typography variant="h5" gutterBottom>
        {userData.track} - Level {userData.level}
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          color: userData.status === "active" ? "success.main" : "error.main",
          fontWeight: "bold",
          mb: 4,
        }}
      >
        Status: {userData.status}
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
            value={userData.email}
            variant="outlined"
            disabled={true}
            InputProps={{
              readOnly: true,
            }}
          />
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
