import React, { useState } from "react";
import {
  Grid,
  TextField,
  Typography,
  Box,
  IconButton,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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

export default function MotivationLetterSection({
  formData,
  errors,
  handleChange,
  handleBlur,
}) {
  const [expandedSections, setExpandedSections] = useState({
    motivationLetter: true,
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
        title="Motivation Letter"
        name="motivationLetter"
        expanded={expandedSections.motivationLetter}
        handleToggleSection={handleToggleSection}
        required
      >
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Why do you want to join this program?"
              name="motivationLetter"
              value={formData.motivationLetter}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(errors.motivationLetter)}
              helperText={errors.motivationLetter || "Minimum 50 characters"}
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
