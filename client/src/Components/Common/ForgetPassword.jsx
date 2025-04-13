import React, { useState, useEffect } from "react";
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
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

// Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import KeyIcon from "@mui/icons-material/Key";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
});

function ForgetPassword() {
  const { role, token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [tokenValid, setTokenValid] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Verify token and role validity on component mount
  useEffect(() => {
    if (!token || !role) {
      setTokenValid(false);
      setStatus({
        type: "error",
        message:
          "Invalid or missing reset token or role. Please request a new password reset link.",
      });
    } else if (!["user", "instructor", "admin"].includes(role.toLowerCase())) {
      setTokenValid(false);
      setStatus({
        type: "error",
        message: "Invalid role specified in the reset link.",
      });
    } else {
      // verifyToken();
    }
  }, [token, role]);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: resetPassword,
  });

  async function resetPassword(values) {
    setIsSubmitting(true);
    setStatus(null);

    try {
      let resetEndpoint = "";

      // Select API endpoint based on role
      switch (role.toLowerCase()) {
        case "user":
          resetEndpoint = `http://localhost:5024/api/user/resetPassword/${token}`;
          break;
        case "instructor":
          resetEndpoint = `http://localhost:5024/api/instructor/resetPassword/${token}`;
          break;
        case "admin":
          resetEndpoint = `http://localhost:5024/api/admin/resetPassword/${token}`;
          break;
        default:
          throw new Error("Invalid role specified");
      }

      await axios.patch(resetEndpoint, {
        password: values.password,
      });

      setStatus({
        type: "success",
        message: `Your ${getRoleTitle().toLowerCase()} account password has been reset successfully!`,
      });

      // Clear form
      formik.resetForm();

      // Auto-redirect after success
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to reset your password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Get role-specific title
  const getRoleTitle = () => {
    switch (role?.toLowerCase()) {
      case "user":
        return "user";
      case "instructor":
        return "Instructor";
      case "admin":
        return "Administrator";
      default:
        return "Account";
    }
  };

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
              Reset Your {getRoleTitle()} Password
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
              Please create a new password for your{" "}
              {getRoleTitle().toLowerCase()} account
            </Typography>

            <Box
              component="img"
              src="/Forgot password-rafiki.svg"
              alt="Reset Password Illustration"
              sx={{
                width: "70%",
                maxWidth: "300px",
                mt: 2,
              }}
            />
          </Box>

          {/* Right Side - Password Reset Form */}
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
                Reset Your {getRoleTitle()} Password
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
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <KeyIcon color="primary" /> Create New Password
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: "Poppins-Regular, Helvetica",
                mb: 4,
                color: "text.secondary",
              }}
            >
              Your new password must be different from previously used passwords
            </Typography>

            {status && (
              <Alert
                severity={status.type}
                icon={
                  status.type === "success" ? (
                    <CheckCircleOutlineIcon />
                  ) : undefined
                }
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    alignItems: "center",
                  },
                }}
              >
                {status.message}
              </Alert>
            )}

            {tokenValid ? (
              <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      variant="outlined"
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.password &&
                        Boolean(formik.errors.password)
                      }
                      helperText={
                        formik.touched.password && formik.errors.password
                      }
                      disabled={isSubmitting || status?.type === "success"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon
                              color={
                                formik.touched.password &&
                                formik.errors.password
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

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      variant="outlined"
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.confirmPassword &&
                        Boolean(formik.errors.confirmPassword)
                      }
                      helperText={
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                      }
                      disabled={isSubmitting || status?.type === "success"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon
                              color={
                                formik.touched.confirmPassword &&
                                formik.errors.confirmPassword
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
                                showConfirmPassword
                                  ? "hide confirm password"
                                  : "show confirm password"
                              }
                              onClick={handleShowConfirmPassword}
                              edge="end"
                              size="large"
                            >
                              {showConfirmPassword ? (
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

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      type="submit"
                      fullWidth
                      disabled={isSubmitting || status?.type === "success"}
                      startIcon={!isSubmitting && <KeyIcon />}
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
                      ) : status?.type === "success" ? (
                        "Password Reset Successfully"
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", my: 4 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    borderRadius: "100px",
                    py: 1,
                    px: 3,
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            )}

            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {status?.type === "success" ? (
                  "You will be redirected to the login page shortly"
                ) : (
                  <>
                    Remember your password?{" "}
                    <Button
                      component={Link}
                      to="/login"
                      sx={{
                        color: "#46c98b",
                        fontFamily: "Poppins-Medium",
                        textTransform: "none",
                        transition: "color 0.2s",
                        "&:hover": {
                          backgroundColor: "transparent",
                          color: "#3ab77a",
                        },
                      }}
                    >
                      Back to Login
                    </Button>
                  </>
                )}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
}

export default ForgetPassword;
