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

const FACULTIES = [
  "Engineering",
  "Computer Science",
  "Business",
  "Medicine",
  "Law",
  "Information Technology",
  "Pharmacy",
  "Dentistry",
  "Nursing",
  "Architecture",
  "Arts",
  "Education",
  "Economics",
  "Agriculture",
  "Veterinary Medicine",
  "Environmental Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Statistics",
  "Other",
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

export default function FacultySection({
  formData,
  errors,
  handleChange,
  handleBlur,
}) {
  const [expandedSections, setExpandedSections] = useState({
    facultyAndGPA: true,
  });

  const handleToggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <FormSection
        title="Faculty Info"
        name="facultyAndGPA"
        expanded={expandedSections.facultyAndGPA}
        handleToggleSection={handleToggleSection}
        required
      >
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              error={Boolean(errors.faculty)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "background.dark" },
                  "&:hover fieldset": { borderColor: "background.dark" },
                  "&.Mui-focused fieldset": { borderColor: "background.dark" },
                },
              }}
            >
              <InputLabel>Faculty *</InputLabel>
              <Select
                label="Faculty *"
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <MenuItem value="">
                  <em>Select a faculty</em>
                </MenuItem>
                {FACULTIES.map((faculty) => (
                  <MenuItem key={faculty} value={faculty}>
                    {faculty}
                  </MenuItem>
                ))}
              </Select>
              {errors.faculty && (
                <Typography variant="caption" color="error">
                  {errors.faculty}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="GPA (0.00 - 4.00)"
              placeholder="GPA"
              name="GPA"
              value={formData.GPA || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(errors.GPA)}
              helperText={errors.GPA}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "background.dark" },
                  "&:hover fieldset": { borderColor: "background.dark" },
                  "&.Mui-focused fieldset": { borderColor: "background.dark" },
                },
              }}
            />
          </Grid>
        </Grid>
      </FormSection>
    </Box>
  );
}
