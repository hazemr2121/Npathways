import SearchIcon from "@mui/icons-material/Search";
import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

let navigationItems = [
  { label: "Home", path: "/" },
  { label: "Enrollment", path: "/enrollment/Welcome" },
];

const NavBarNew = () => {
  const {
    isAuthenticated,
    logout,
    isEnrolled,
    isStudent,
    isInstructor,
    isLoading,
  } = useContext(AuthContext);

  if (isStudent) {
    navigationItems = [
      { label: "My Pathway", path: "/student/mypathway" },
      { label: "Courses", path: "/courses" },
      // { label: "Chat", path: "/chat" },
    ];
  }
  if (isInstructor) {
    navigationItems = [
      { label: "Instructor Dashboard", path: "/instructor/dashboard" },
      // { label: "Courses", path: "/courses" },
      // { label: "Chat", path: "/chat" },
    ];
  }

  return (
    <AppBar position="static" sx={{ bgcolor: "#0B162C", height: 100 }}>
      <Toolbar sx={{ height: 80, mt: "5px" }}>
        {/* Logo and Brand Name */}
        <Box display="flex" alignItems="center">
          <Box
            component="img"
            src="/pathways_chiropractic-removebg-preview.png"
            alt="Npathways Logo"
            sx={{ width: 60, height: 60 }}
          />
          <Typography
            variant="h5"
            sx={{
              ml: 2,
              fontFamily: "Poppins-Bold, Helvetica",
              fontWeight: 700,
              color: "white",
              fontSize: "1.5rem",
              letterSpacing: "-0.40px",
              lineHeight: "36px",
            }}
          >
            Npathways
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ ml: 6 }}>
          {navigationItems.map((item) => (
            <Typography
              key={item.label}
              component={Link}
              to={item.path}
              sx={{
                fontFamily: "Poppins-Medium, Helvetica",
                fontWeight: 500,
                color: "white",
                fontSize: "0.875rem",
                letterSpacing: "-0.18px",
                lineHeight: "20px",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              {item.label}
            </Typography>
          ))}
        </Stack>
        {/* Search Box */}
        <Box
          sx={{
            ml: "auto",
            mr: 2,
            width: 200,
            height: 50,
            position: "relative",
            backgroundColor: "#181B21",
            display: "flex",
            alignItems: "center",
            px: 2,
            borderRadius: "30px",
          }}
        >
          <SearchIcon sx={{ color: "white", mr: 1 }} />
          <Autocomplete
            freeSolo
            options={[]}
            sx={{ width: "100%" }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search Course"
                variant="standard"
                InputProps={{
                  ...params.InputProps,
                  disableUnderline: true,
                  style: {
                    fontFamily: "Poppins-Medium, Helvetica",
                    fontWeight: 500,
                    color: "white",
                    fontSize: "0.875rem",
                  },
                }}
              />
            )}
          />
        </Box>
        {/* Auth Related Buttons with Loading State */}
        {isLoading ? (
          <Box sx={{ display: "flex", width: 140, justifyContent: "center" }}>
            <CircularProgress size={30} sx={{ color: "#46c98b" }} />
          </Box>
        ) : (
          <>
            {!isEnrolled && isAuthenticated && !isInstructor && (
              <Button
                sx={{
                  color: "white",
                  backgroundColor: "#46c98b",
                  textTransform: "none",
                  borderRadius: "100px",
                  width: 140,
                  height: 50,
                  fontFamily: "Poppins-Medium, Helvetica",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  letterSpacing: "-0.18px",
                  lineHeight: "20px",
                  "&:hover": {
                    bgcolor: "#3ab77a",
                  },
                }}
                variant="contained"
                component={Link}
                to="/enrollment/welcome"
              >
                Enroll
              </Button>
            )}
            {isInstructor || isStudent ? (
              <Button
                sx={{
                  color: "white",
                  backgroundColor: "#46c98b",
                  textTransform: "none",
                  borderRadius: "100px",
                  width: 140,
                  height: 50,
                  fontFamily: "Poppins-Medium, Helvetica",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  letterSpacing: "-0.18px",
                  lineHeight: "20px",
                  "&:hover": {
                    bgcolor: "#3ab77a",
                  },
                }}
                variant="contained"
                onClick={logout}
              >
                Logout
              </Button>
            ) : (
              <>
                <Typography
                  component={Link}
                  to="/login"
                  sx={{
                    fontFamily: "Poppins-Medium, Helvetica",
                    fontWeight: 500,
                    color: "white",
                    fontSize: "0.875rem",
                    letterSpacing: "-0.18px",
                    lineHeight: "20px",
                    cursor: "pointer",
                    mr: 2,
                    textDecoration: "none",
                  }}
                >
                  Log in
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/register"
                  sx={{
                    bgcolor: "#46c98b",
                    borderRadius: "100px",
                    width: 140,
                    height: 50,
                    fontFamily: "Poppins-Medium, Helvetica",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    letterSpacing: "-0.18px",
                    lineHeight: "20px",
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#3ab77a",
                    },
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </>
        )}
      </Toolbar>
      <Divider sx={{ bgcolor: "white", opacity: 0.2 }} />
    </AppBar>
  );
};

export default NavBarNew;
