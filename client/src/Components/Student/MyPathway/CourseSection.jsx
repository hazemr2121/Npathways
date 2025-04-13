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

export default function CourseSection() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 6; // Number of courses per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5024/api/course/enrolledCourses",
          {
            withCredentials: true,
          }
        );
        setEnrolledCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    return enrolledCourses.filter((course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [enrolledCourses, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCourses, page]);

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

  if (enrolledCourses.length === 0) {
    return (
      <Typography align="center" my={2}>
        No standalone courses found
      </Typography>
    );
  }

  return (
    <>
      <Typography fontWeight={"bold"} my={2}>
        Stand Alone Courses
      </Typography>

      <TextField
        fullWidth
        margin="normal"
        placeholder="Search courses..."
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

      {filteredCourses.length === 0 ? (
        <Typography align="center" my={2}>
          No courses match your search
        </Typography>
      ) : (
        <>
          <Stack flexWrap="wrap" flexDirection={"row"} gap={2}>
            {paginatedCourses.map((course) => (
              <CourseCard
                key={course._id}
                title={course.name}
                image={course.image || bimManagerImage}
                time={course.time}
                onClick={() => navigate(`/courseContent/${course._id}`)}
              />
            ))}
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
