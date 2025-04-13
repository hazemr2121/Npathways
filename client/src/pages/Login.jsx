import React, { useState, useContext } from "react";
import {
  TextField,
  Button,
  Container,
  Grid,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  useMediaQuery,
  Divider,
  Link as MuiLink,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { motion } from "framer-motion";

// Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import LoginIcon from "@mui/icons-material/Login";
import axios from "axios";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address"
    ),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState(null);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [verify, setVerify] = useState(true);
  const navigate = useNavigate();
  const { login, isEnrolled, isLoading } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const initialValues = {
    email: "",
    password: "",
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  async function sendDataToAPI(values) {
    setIsSubmitting(true);
    setApiError(null);
    setVerify(false);

    try {
      const { error } = await login(values);
      if (error)
        setApiError(
          error || "Login failed. Please check your credentials and try again."
        );
    } catch (err) {
      console.error("Login error:", err);
      setApiError(err);
      if (err == "Verify your email first") {
        setVerify(true);
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: sendDataToAPI,
  });
  function forgetPassword() {
    if (!formik.values.email) {
      setForgotPasswordStatus({
        type: "error",
        message: "Please enter your email address first",
      });
      return;
    }

    setIsForgotPasswordLoading(true);
    setForgotPasswordStatus(null);

    axios
      .post("http://localhost:5024/api/user/forgetPassword", {
        email: formik.values.email,
      })
      .then((response) => {
        setForgotPasswordStatus({
          type: "success",
          message: "Password reset instructions sent to your email",
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        setForgotPasswordStatus({
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to send reset email. Please try again.",
        });
      })
      .finally(() => {
        setIsForgotPasswordLoading(false);
      });
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 4, md: 8 },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%" }}
      >
        <Paper
          elevation={6}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            maxWidth: { xs: "95%", sm: "600px", md: "1000px" },
            mx: "auto",
            bgcolor: "#ffffff",
          }}
        >
          {/* Left Side - Image/Branded Section (hidden on mobile) */}
          <Box
            sx={{
              flex: { xs: "0 0 100%", md: "0 0 45%" },
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              backgroundColor: "#0B162C",
              p: 6,
              color: "#fff",
            }}
          >
            <Box
              component="img"
              src="/pathways_chiropractic-removebg-preview.png"
              alt="Npathways Logo"
              sx={{
                width: "80px",
                height: "80px",
                mb: 3,
              }}
            />

            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontFamily: "Poppins-Bold, Helvetica",
                fontWeight: 700,
                mb: 2,
                textAlign: "center",
              }}
            >
              Welcome Back
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: "Poppins-Regular, Helvetica",
                mb: 4,
                opacity: 0.9,
                textAlign: "center",
              }}
            >
              Log in to access your learning journey and continue your progress
            </Typography>

            <Box
              component="img"
              src="/User_Profile-512.webp" // Replace with your illustration
              alt="Login Illustration"
              sx={{
                width: "70%",
                maxWidth: "300px",
                mt: 2,
              }}
            />
          </Box>

          {/* Right Side - Login Form */}
          <Box
            sx={{
              flex: { xs: "0 0 100%", md: "0 0 55%" },
              p: { xs: 3, sm: 4, md: 6 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Header for mobile */}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                alignItems: "center",
                mb: 4,
                flexDirection: "column",
              }}
            >
              <Box
                component="img"
                src="/pathways_chiropractic-removebg-preview.png"
                alt="Npathways Logo"
                sx={{
                  width: "60px",
                  height: "60px",
                  mb: 2,
                }}
              />
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontFamily: "Poppins-Bold, Helvetica",
                  fontWeight: 700,
                  mb: 1,
                  color: "#0B162C",
                }}
              >
                Welcome Back
              </Typography>
            </Box>

            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontFamily: "Poppins-SemiBold, Helvetica",
                fontWeight: 600,
                mb: 1,
                color: "#0B162C",
              }}
            >
              Sign In
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: "Poppins-Regular, Helvetica",
                mb: 4,
                color: "text.secondary",
              }}
            >
              Enter your credentials to continue
            </Typography>

            {apiError && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    alignItems: "center",
                  },
                }}
              >
                {apiError}
                {verify && <Button sx={{ ml: 4 }}>Resend Verify Email</Button>}
              </Alert>
            )}
            {/* {verify && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    alignItems: "center",
                  },
                }}
              >
                {apiError}
                <Button>Resend Verify Email</Button>
              </Alert>
            )} */}

            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon
                            color={
                              formik.touched.email && formik.errors.email
                                ? "error"
                                : "action"
                            }
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon
                            color={
                              formik.touched.password && formik.errors.password
                                ? "error"
                                : "action"
                            }
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showPassword ? "hide password" : "show password"
                            }
                            onClick={handleShowPassword}
                            edge="end"
                            size="large"
                          >
                            {showPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sx={{ textAlign: "right" }}>
                  <MuiLink
                    onClick={forgetPassword}
                    underline="hover"
                    sx={{
                      color: "primary.main",
                      fontFamily: "Poppins-Medium",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      transition: "color 0.2s",
                      "&:hover": {
                        color: "primary.dark",
                      },
                    }}
                  >
                    {isForgotPasswordLoading
                      ? "Sending..."
                      : "Forgot your password?"}
                  </MuiLink>
                </Grid>

                {forgotPasswordStatus && (
                  <Grid item xs={12}>
                    <Alert
                      severity={forgotPasswordStatus.type}
                      sx={{
                        borderRadius: 2,
                        "& .MuiAlert-icon": {
                          alignItems: "center",
                        },
                      }}
                    >
                      {forgotPasswordStatus.message}
                    </Alert>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    type="submit"
                    fullWidth
                    disabled={isSubmitting}
                    startIcon={!isSubmitting && <LoginIcon />}
                    sx={{
                      borderRadius: "100px",
                      py: 1.5,
                      backgroundColor: "#46c98b",
                      fontFamily: "Poppins-SemiBold, Helvetica",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "1rem",
                      boxShadow: "0 4px 10px rgba(70, 201, 139, 0.3)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#3ab77a",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 12px rgba(70, 201, 139, 0.4)",
                      },
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Divider>
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>
                </Grid>

                <Grid item xs={12} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Don&apos;t have an account?{" "}
                    <MuiLink
                      component={Link}
                      to="/register"
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
                      Create account
                    </MuiLink>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Login;
