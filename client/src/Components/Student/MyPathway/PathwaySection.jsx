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
import bimManagerImage from "../../../assets/bim-manager.jpeg";
import axios from "axios";
import { useNavigate } from "react-router";
import { AuthContext } from "../../../contexts/AuthContext";

export default function PathwaySection() {
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 6; // Number of pathways per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPathways = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5024/api/pathway/student/userPathway`,
          { withCredentials: true }
        );
        if (response.data.message === "User is not enrolled in any pathways") {
          setPathways([]);
        } else {
          setPathways(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching pathways:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPathways();
  }, []);

  // Filter pathways based on search query
  const filteredPathways = useMemo(() => {
    return pathways.filter((pathway) =>
      pathway.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pathways, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPathways.length / itemsPerPage);
  const paginatedPathways = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredPathways.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPathways, page]);

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

  if (!pathways || pathways.length === 0) {
    return (
      <Typography align="center" my={2}>
        No pathways found, stay tuned for updates!
      </Typography>
    );
  }

  return (
    <>
      <Typography fontWeight={"bold"} my={2}>
        My Pathways
      </Typography>

      <TextField
        fullWidth
        margin="normal"
        placeholder="Search pathways..."
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

      {filteredPathways.length === 0 ? (
        <Typography align="center" my={2}>
          No pathways match your search
        </Typography>
      ) : (
        <>
          <Stack flexWrap="wrap" flexDirection={"row"} gap={2}>
            {paginatedPathways.map((pathway) => (
              <CourseCard
                key={pathway._id}
                title={pathway.name}
                image={bimManagerImage}
                status={pathway.status || "In Progress"}
                onClick={() => {
                  navigate(`/pathway/${pathway._id}`);
                }}
              />
            ))}
          </Stack>

          {totalPages > 1 && (
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
          )}
        </>
      )}
    </>
  );
}
