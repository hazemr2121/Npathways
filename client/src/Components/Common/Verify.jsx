import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Button,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

// Icons
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LoginIcon from "@mui/icons-material/Login";

function Verify() {
  const { token } = useParams();

  const [verificationStatus, setVerificationStatus] = useState("loading"); // "loading", "success", "error"
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerificationStatus("error");
        setErrorMessage("Verification token is missing.");
        return;
      }

      try {
        // Make API call to verify the token
        const response = await axios.get(
          `http://localhost:5024/api/user/VerifyEmail/${token}`
        );

        setVerificationStatus("success");

        // Start countdown for auto-redirect
        const timer = setInterval(() => {
          setCountdown((prevCount) => {
            if (prevCount <= 1) {
              clearInterval(timer);
              navigate("/login");
              return 0;
            }
            return prevCount - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus("error");
        setErrorMessage(
          error.response?.data?.message ||
            "We couldn't verify your email. The verification link may have expired or is invalid."
        );
      }
    };

    verifyToken();
  }, [token, navigate]);

  const handleRedirect = () => {
    navigate("/login");
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
            maxWidth: { xs: "95%", sm: "600px" },
            mx: "auto",
            bgcolor: "#ffffff",
            p: { xs: 3, sm: 5 },
            textAlign: "center",
          }}
        >
          {verificationStatus === "loading" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 6,
              }}
            >
              <CircularProgress size={60} sx={{ mb: 3, color: "#46c98b" }} />
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontFamily: "Poppins-SemiBold, Helvetica",
                  fontWeight: 600,
                  color: "#0B162C",
                }}
              >
                Verifying Your Email
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Poppins-Regular, Helvetica",
                  mt: 2,
                  color: "text.secondary",
                }}
              >
                Please wait while we confirm your email address...
              </Typography>
            </Box>
          )}

          {verificationStatus === "success" && (
            <Box sx={{ py: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                <CheckCircleOutlineIcon
                  sx={{
                    fontSize: 80,
                    color: "#46c98b",
                    mb: 2,
                  }}
                />
              </motion.div>

              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontFamily: "Poppins-Bold, Helvetica",
                  fontWeight: 700,
                  mb: 2,
                  color: "#0B162C",
                }}
              >
                Email Verified!
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Poppins-Regular, Helvetica",
                  mb: 4,
                  fontSize: "1.1rem",
                  color: "text.secondary",
                }}
              >
                Your email has been successfully verified. You can now log in to
                your account.
              </Typography>

              <Alert
                severity="success"
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  "& .MuiAlert-message": { fontFamily: "Poppins-Regular" },
                }}
              >
                You will be redirected to the login page in {countdown} seconds.
              </Alert>

              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={handleRedirect}
                sx={{
                  borderRadius: "100px",
                  py: 1.5,
                  px: 4,
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
                Go to Login
              </Button>
            </Box>
          )}

          {verificationStatus === "error" && (
            <Box sx={{ py: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                <ErrorOutlineIcon
                  sx={{
                    fontSize: 80,
                    color: theme.palette.error.main,
                    mb: 2,
                  }}
                />
              </motion.div>

              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontFamily: "Poppins-Bold, Helvetica",
                  fontWeight: 700,
                  mb: 2,
                  color: "#0B162C",
                }}
              >
                Verification Failed
              </Typography>

              <Alert
                severity="error"
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  "& .MuiAlert-message": { fontFamily: "Poppins-Regular" },
                }}
              >
                {errorMessage}
              </Alert>

              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Poppins-Regular, Helvetica",
                  mb: 4,
                  fontSize: "1.1rem",
                  color: "text.secondary",
                }}
              >
                You can try logging in or request a new verification email.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<LoginIcon />}
                  component={Link}
                  to="/login"
                  sx={{
                    borderRadius: "100px",
                    py: 1.5,
                    px: 3,
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
                  Go to Login
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  component={Link}
                  to="/login"
                  sx={{
                    borderRadius: "100px",
                    py: 1.5,
                    px: 3,
                    borderColor: "#46c98b",
                    color: "#46c98b",
                    fontFamily: "Poppins-SemiBold, Helvetica",
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "1rem",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#3ab77a",
                      backgroundColor: "rgba(70, 201, 139, 0.04)",
                    },
                  }}
                >
                  Request New Link
                </Button>
              </Box>
            </Box>
          )}

          {/* Bottom Logo */}
          <Box
            component="img"
            src="/pathways_chiropractic-removebg-preview.png"
            alt="Npathways Logo"
            sx={{
              width: "60px",
              height: "60px",
              mt: 4,
              opacity: 0.8,
            }}
          />
        </Paper>
      </motion.div>
    </Container>
  );
}

export default Verify;
