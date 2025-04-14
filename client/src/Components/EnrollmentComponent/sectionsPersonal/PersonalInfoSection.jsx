import React, { useState } from "react";
import {
  Grid,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const NATIONALITIES = [
  "Egyptian",
  "Saudi",
  "Emirati",
  "Algerian",
  "Iraqi",
  "Moroccan",
  "Sudanese",
  "Syrian",
  "Tunisian",
  "Jordanian",
  "Lebanese",
  "Libyan",
  "Palestinian",
  "Omani",
  "Kuwaiti",
  "Qatari",
  "Bahraini",
  "Yemeni",
  "Mauritanian",
  "Somalian",
  "Djiboutian",
  "Comorian",
  "Chadian",
  "Eritrean",
];

const FormSection = ({
  title,
  name,
  expanded,
  handleToggleSection,
  children,
  required = false,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.background.dark}`,
        borderRadius: "4px",
        marginTop: "16px",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          backgroundColor: "background.dark",
          padding: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => handleToggleSection(name)}
      >
        <Typography
          variant="h6"
          sx={{ color: "primary.main", fontWeight: "bold" }}
        >
          {title}
          {required && " *"}
        </Typography>
        <IconButton>
          <ExpandMoreIcon
            sx={{
              color: "primary.main",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </IconButton>
      </Box>
      {expanded && <Box sx={{ padding: 2 }}>{children}</Box>}
    </Box>
  );
};

export default function PersonalInfoSection({
  formData,
  errors,
  handleChange,
  handleBlur,
}) {
  const [expandedSections, setExpandedSections] = useState({
    personalDetails: true,
  });
  const currentDate = new Date();
  const maxDate = currentDate.toISOString().split("T")[0];

  const handleToggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <Box>
      <FormSection
        title="Personal Details"
        name="personalDetails"
        expanded={expandedSections.personalDetails}
        handleToggleSection={handleToggleSection}
        required
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="First Name *"
              name="firstName"
              value={formData.firstName}
              disabled
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "background.dark" },
                  "&:hover fieldset": { borderColor: "background.dark" },
                  "&.Mui-focused fieldset": { borderColor: "background.dark" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Name *"
              name="lastName"
              value={formData.lastName}
              disabled
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "background.dark" },
                  "&:hover fieldset": { borderColor: "background.dark" },
                  "&.Mui-focused fieldset": { borderColor: "background.dark" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Date of Birth *"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              onBlur={handleBlur}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: "1980-01-01",
                max: maxDate,
              }}
              error={Boolean(errors.dateOfBirth)}
              helperText={errors.dateOfBirth}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "background.dark" },
                  "&:hover fieldset": { borderColor: "background.dark" },
                  "&.Mui-focused fieldset": { borderColor: "background.dark" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl
              fullWidth
              error={Boolean(errors.nationality)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "background.dark" },
                  "&:hover fieldset": { borderColor: "background.dark" },
                  "&.Mui-focused fieldset": { borderColor: "background.dark" },
                },
              }}
            >
              <InputLabel>Nationality *</InputLabel>
              <Select
                label="Nationality *"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                {NATIONALITIES.map((nat) => (
                  <MenuItem key={nat} value={nat}>
                    {nat}
                  </MenuItem>
                ))}
              </Select>
              {errors.nationality && (
                <Typography variant="caption" color="error">
                  {errors.nationality}
                </Typography>
              )}
            </FormControl>
          </Grid>
        </Grid>
      </FormSection>
    </Box>
  );
}
