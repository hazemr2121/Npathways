import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Typography,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";

const styles = {
  input: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#181B21" },
      "&:hover fieldset": { borderColor: "#181B21" },
      "&.Mui-focused fieldset": { borderColor: "#181B21" },
    },
  },
  sectionHeader: {
    backgroundColor: "#181B21",
    padding: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
  },
  sectionTitle: {
    color: "#46C98B",
    fontWeight: "bold",
  },
  iconButton: (expanded) => ({
    color: "#46C98B",
    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.3s ease",
  }),
  formSection: {
    border: "1px solid #181B21",
    borderRadius: "4px",
    marginTop: "16px",
    overflow: "hidden",
  },
};

const FormSection = ({
  title,
  name,
  expanded,
  handleToggleSection,
  children,
  required = false,
}) => (
  <Box sx={styles.formSection}>
    <Box sx={styles.sectionHeader} onClick={() => handleToggleSection(name)}>
      <Typography variant="h6" sx={styles.sectionTitle}>
        {title}
        {required && " *"}
      </Typography>
      <IconButton>
        <ExpandMoreIcon sx={styles.iconButton(expanded)} />
      </IconButton>
    </Box>
    {expanded && <Box sx={{ padding: 2 }}>{children}</Box>}
  </Box>
);

export default function PathwaySection({
  formData,
  errors,
  handleChange,
  handleBlur,
}) {
  const [expandedSections, setExpandedSections] = useState({
    pathway: true,
  });
  const [pathways, setPathways] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPathways = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5024/api/pathway/student",
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data && Array.isArray(response.data.data)) {
          const formattedPathways = response.data.data.map((pathway) => ({
            id: pathway._id,
            name: pathway.name,
          }));
          setPathways(formattedPathways);
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load pathways");
      }
    };

    fetchPathways();
  }, []);

  const handleToggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Custom handler for pathway selection that sets both ID and name
  const handlePathwayChange = (event) => {
    const selectedId = event.target.value;
    const selectedPathway = pathways.find((p) => p.id === selectedId);

    // Create a custom event with both id and name
    const customEvent = {
      target: {
        name: "pathway",
        value: {
          id: selectedId,
          name: selectedPathway ? selectedPathway.name : "Unknown pathway",
        },
      },
    };

    handleChange(customEvent);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <FormSection
        title="Pathway Section"
        name="pathway"
        expanded={expandedSections.pathway}
        handleToggleSection={handleToggleSection}
        required
      >
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <FormControl
              fullWidth
              error={Boolean(errors.pathway)}
              sx={styles.input}
            >
              <InputLabel id="pathway-select-label">Select Pathway</InputLabel>
              <Select
                labelId="pathway-select-label"
                name="pathway"
                value={formData.pathway?.id || formData.pathway || ""}
                onChange={handlePathwayChange}
                onBlur={handleBlur}
                label="Select Pathway"
              >
                <MenuItem value="" disabled>
                  Select a pathway
                </MenuItem>
                {error ? (
                  <MenuItem value="" disabled>
                    {error}
                  </MenuItem>
                ) : pathways.length === 0 ? (
                  <MenuItem value="" disabled>
                    No pathways available
                  </MenuItem>
                ) : (
                  pathways.map((pathway) => (
                    <MenuItem key={pathway.id} value={pathway.id}>
                      {pathway.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.pathway && (
                <Typography color="error" variant="caption">
                  {errors.pathway}
                </Typography>
              )}
            </FormControl>
          </Grid>
        </Grid>
      </FormSection>
    </Box>
  );
}
