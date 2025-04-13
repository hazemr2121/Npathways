import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Grid,
  Typography,
  Box,
  Checkbox,
  Link as MuiLink,
  FormHelperText,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .matches(/^[A-Za-z]+$/, "First name should contain only letters")
    .min(3, "First name should be at least 3 characters")
    .max(30, "First name should not exceed 30 characters")
    .required("Please enter your first name"),
  lastName: Yup.string()
    .trim()
    .matches(/^[A-Za-z]+$/, "Last name should contain only letters")
    .min(3, "Last name should be at least 3 characters")
    .max(30, "Last name should not exceed 30 characters")
    .required("Please enter your last name"),
  email: Yup.string()
    .email("Please enter a valid email format")
    .required("Email address is required")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email format is invalid (e.g., example@domain.com)"
    ),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long")
    .matches(/[0-9]/, "Password must include at least one number")
    .matches(/[a-z]/, "Password must include at least one lowercase letter")
    .matches(/[A-Z]/, "Password must include at least one uppercase letter")
    .matches(/[^\w]/, "Password must include at least one special character")
    .required("Please create a password"),
  agreeToTerms: Yup.boolean()
    .oneOf([true], "Please accept the terms and conditions to continue")
    .required("Please accept the terms and conditions to continue"),
});

const Register = () => {
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreeToTerms: false,
  };

  async function sendDataToAPI(values) {
    try {
      setApiError(null);
      // Remove agreeToTerms from data sent to API
      const { agreeToTerms, ...dataToSend } = values;

      let { data } = await axios.post(
        `http://localhost:5024/api/user/signup`,
        dataToSend
      );
      console.log(data);
      if (data.message === "Account Created Successfully") {
        console.log("Account Created Successfully");
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      setApiError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: sendDataToAPI,
  });

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          bgcolor: "#f5f5f5",
          borderRadius: 2,
          p: 4,
          boxShadow: "10px 10px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{
            mb: 4,
            fontWeight: 500,
          }}
        >
          Create an account
        </Typography>
        <Typography
          variant="subtitle2"
          align="center"
          sx={{ mb: 4, color: "seagreen" }}
        >
          Start your pathway journey with us
        </Typography>

        {apiError && (
          <Box sx={{ mb: 2 }}>
            <Typography color="error">{apiError}</Typography>
          </Box>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="First name"
                variant="outlined"
                id="firstName"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Last name"
                variant="outlined"
                id="lastName"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={handleShowPassword}
                      sx={{
                        minWidth: "auto",
                        textTransform: "none",
                        fontSize: "0.75rem",
                        color: "text.secondary",
                      }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <Checkbox
                  size="small"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formik.values.agreeToTerms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  sx={{
                    mr: 1,
                    mt: 0,
                    color: "text.secondary",
                    "&.Mui-checked": {
                      color: "primary.main",
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    "& a": {
                      color: "inherit",
                      textDecoration: "underline",
                      "&:hover": {
                        color: "primary.main",
                      },
                    },
                  }}
                >
                  By creating an account, I agree to our{" "}
                  <a
                    target="_blank"
                    href="http://localhost:5173/terms-and-conditions"
                  >
                    Terms of use
                  </a>
                </Typography>
              </Box>
              {formik.touched.agreeToTerms &&
                Boolean(formik.errors.agreeToTerms) && (
                  <FormHelperText error>
                    {formik.errors.agreeToTerms}
                  </FormHelperText>
                )}
            </Grid>

            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{
                  borderRadius: "20px",
                  padding: "12px",
                  backgroundColor: "MuiButton-light",
                  textTransform: "none",
                  fontSize: "16px",
                  width: "50%",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                Create an account
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2.5,
                }}
              >
                <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
                <Typography
                  variant="body2"
                  sx={{
                    px: 2,
                    color: "text.secondary",
                  }}
                >
                  OR
                </Typography>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Have an account?{" "}
                <MuiLink
                  component={Link}
                  to="/login"
                  underline="hover"
                  sx={{
                    color: "#46c98b",
                    fontFamily: "Poppins-Medium",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "#3ab77a",
                    },
                  }}
                >
                  Log in
                </MuiLink>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default Register;
