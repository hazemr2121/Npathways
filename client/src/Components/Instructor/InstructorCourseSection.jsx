import {
  CircularProgress,
  Stack,
  Typography,
  TextField,
  Pagination,
  Box,
} from "@mui/material";
import axios from "axios";
import React from "react";
import CourseCard from "../Student/MyPathway/CourseCard";
import bimManagerImage from "../../assets/bim-manager.jpeg";

export default function InstructorCourseSection() {
  const [enrolledCourses, setEnrolledCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 6;

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5024/api/instructor/courses",
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
  const filteredCourses = React.useMemo(() => {
    return enrolledCourses.filter((course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [enrolledCourses, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = React.useMemo(() => {
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

  return (
    <>
      <Typography fontWeight={"bold"} my={2}>
        My Courses
      </Typography>

      <TextField
        fullWidth
        margin="normal"
        label="Search courses"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
      />

      {filteredCourses.length === 0 ? (
        <Typography align="center" my={2}>
          No courses found
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
                status="Not Started"
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
