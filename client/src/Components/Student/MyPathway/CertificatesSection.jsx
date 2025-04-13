import {
  Stack,
  Typography,
  CircularProgress,
  TextField,
  Box,
  Pagination,
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import React, { useState, useEffect, useMemo } from "react";
import CourseCard from "./CourseCard";
import certificateImage from "/Certification.jpg";
import axios from "axios";

export default function CertificatesSection() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 6; // Number of certificates per page

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5024/api/certificate/userCertificates",
          {
            withCredentials: true,
          }
        );
        setCertificates(response.data);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  // Filter certificates based on search query
  const filteredCertificates = useMemo(() => {
    return certificates.filter((certificate) =>
      certificate.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [certificates, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const paginatedCertificates = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredCertificates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCertificates, page]);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="200px">
        <CircularProgress />
      </Stack>
    );
  }

  if (certificates.length === 0) {
    return (
      <Typography align="center" my={2}>
        No certificates found
      </Typography>
    );
  }

  return (
    <>
      <Typography fontWeight={"bold"} my={2}>
        Certificates
      </Typography>

      <TextField
        fullWidth
        margin="normal"
        placeholder="Search certificates..."
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {filteredCertificates.length === 0 ? (
        <Typography align="center" my={2}>
          No certificates match your search
        </Typography>
      ) : (
        <>
          <Stack flexWrap="wrap" flexDirection={"row"} gap={2}>
            {paginatedCertificates.map((certificate) => {
              // Format the date to a more readable format
              const formattedDate = new Date(
                certificate.acquiredAt
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <CourseCard
                  key={certificate._id}
                  title={certificate.name}
                  image={certificateImage}
                  time={formattedDate}
                />
              );
            })}
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}
    </>
  );
}
