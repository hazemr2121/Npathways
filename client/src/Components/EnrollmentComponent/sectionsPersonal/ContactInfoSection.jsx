import React, { useState } from 'react';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

 const countries = [
  { code: 'EG', label: 'Egypt', phoneCode: '+20' },
  { code: 'SA', label: 'Saudi Arabia', phoneCode: '+966' },
  { code: 'AE', label: 'United Arab Emirates', phoneCode: '+971' },
  { code: 'DZ', label: 'Algeria', phoneCode: '+213' },
  { code: 'IQ', label: 'Iraq', phoneCode: '+964' },
  { code: 'MA', label: 'Morocco', phoneCode: '+212' },
  { code: 'SD', label: 'Sudan', phoneCode: '+249' },
  { code: 'SY', label: 'Syria', phoneCode: '+963' },
  { code: 'TN', label: 'Tunisia', phoneCode: '+216' },
  { code: 'JO', label: 'Jordan', phoneCode: '+962' },
  { code: 'LB', label: 'Lebanon', phoneCode: '+961' },
  { code: 'LY', label: 'Libya', phoneCode: '+218' },
  { code: 'PS', label: 'Palestine', phoneCode: '+970' },
  { code: 'OM', label: 'Oman', phoneCode: '+968' },
  { code: 'KW', label: 'Kuwait', phoneCode: '+965' },
  { code: 'QA', label: 'Qatar', phoneCode: '+974' },
  { code: 'BH', label: 'Bahrain', phoneCode: '+973' },
  { code: 'YE', label: 'Yemen', phoneCode: '+967' },
  { code: 'MR', label: 'Mauritania', phoneCode: '+222' },
  { code: 'SO', label: 'Somalia', phoneCode: '+252' },
  { code: 'DJ', label: 'Djibouti', phoneCode: '+253' },
  { code: 'KM', label: 'Comoros', phoneCode: '+269' },
  { code: 'TD', label: 'Chad', phoneCode: '+235' },
  { code: 'ER', label: 'Eritrea', phoneCode: '+291' },
];

const styles = {
  input: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#181B21' },
      '&:hover fieldset': { borderColor: '#181B21' },
      '&.Mui-focused fieldset': { borderColor: '#181B21' },
    },
  },
  sectionHeader: {
    backgroundColor: '#181B21',
    padding: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  sectionTitle: {
    color: '#46C98B',
    fontWeight: 'bold',
  },
  iconButton: (expanded) => ({
    color: '#46C98B',
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.3s ease',
  }),
  formSection: {
    border: '1px solid #181B21',
    borderRadius: '4px',
    marginTop: '16px',
    overflow: 'hidden',
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
        {required && ' *'}
      </Typography>
      <IconButton>
        <ExpandMoreIcon sx={styles.iconButton(expanded)} />
      </IconButton>
    </Box>
    {expanded && <Box sx={{ padding: 2 }}>{children}</Box>}
  </Box>
);

export default function AddressAndContactSection({
  formData,
  errors,
  handleChange,
  handleBlur,
}) {
  const [expandedSections, setExpandedSections] = useState({
    addressAndContact: true,
  });

  const handleToggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const selectedCountry = countries.find((c) => c.code === formData.address?.country);
  const phoneCode = selectedCountry ? selectedCountry.phoneCode : '';

  return (
    <Box sx={{ mt: 4 }}>
      <FormSection
        title="Address and Contact Information"
        name="addressAndContact"
        expanded={expandedSections.addressAndContact}
        handleToggleSection={handleToggleSection}
        required
      >
        <Grid container spacing={2} mt={1}>
        <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email *"
              name="email"
              value={formData.email || ''}
              disabled
              sx={styles.input}
            />
          </Grid>
          {/* Address Fields */}
          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              error={Boolean(errors.address?.country)}
              sx={styles.input}
            >
              <InputLabel>Country *</InputLabel>
              <Select
                label="Country *"
                name="address.country"
                value={formData.address?.country || ''}
                onChange={(e) => {
                  handleChange(e);
                  handleChange({
                    target: {
                      name: 'phoneCountry',
                      value: e.target.value,
                    },
                  });
                }}
                onBlur={handleBlur}
              >
                <MenuItem value="">
                  <em>Select a country</em>
                </MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.address?.country && (
                <Typography variant="caption" color="error">
                  {errors.address.country}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number *"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              sx={styles.input}
              InputProps={{
                startAdornment: phoneCode ? (
                  <Typography sx={{ mr: 1 }}>{phoneCode}</Typography>
                ) : null,
              }}
              disabled={!formData.address?.country}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              name="address.city"
              value={formData.address?.city || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(errors.address?.city)}
              helperText={errors.address?.city}
              sx={styles.input}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Street"
              name="address.street"
              value={formData.address?.street || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(errors.address?.street)}
              helperText={errors.address?.street}
              sx={styles.input}
            />
          </Grid>
          
        
        </Grid>
      </FormSection>
    </Box>
  );
}