import {
  Avatar,
  CircularProgress,
  Grid2,
  Typography,
  TextField,
  InputAdornment,
  Box,
  Pagination,
  Stack,
  Chip,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function MyStudentsInstructor() {
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 8; // Number of students per page

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5024/api/instructor/getUsersInCourse",
          {
            withCredentials: true,
          }
        );
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search term
  const filteredStudents = students.filter((student) =>
    `${student.firstName} ${student.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const displayedStudents = filteredStudents.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <>
      {/* Search Box */}
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search students by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid2
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ py: 2, px: 0 }}
      >
        <Grid2 item textAlign="center" size={2}>
          <Typography sx={{ color: "text.gray" }}>Picture</Typography>
        </Grid2>
        <Grid2 item textAlign="center" size={5}>
          <Typography sx={{ color: "text.gray" }}>Name</Typography>
        </Grid2>
        <Grid2 item textAlign="center" size={5}>
          <Typography sx={{ color: "text.gray" }}>Course Name</Typography>
        </Grid2>
        {/* <Grid2 item textAlign="center" size={3}>
          <Typography sx={{ color: "text.gray" }}>Passed Exams</Typography>
        </Grid2> */}
      </Grid2>

      {isLoading && (
        <Grid2
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ py: 1, px: 0 }}
        >
          <Grid2 item textAlign="center" size={12}>
            <CircularProgress />
          </Grid2>
        </Grid2>
      )}

      {!isLoading && filteredStudents.length === 0 && (
        <Grid2
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ py: 1, px: 0 }}
        >
          <Grid2 item textAlign="center" size={12}>
            <Typography>No students found</Typography>
          </Grid2>
        </Grid2>
      )}

      {!isLoading &&
        displayedStudents.length > 0 &&
        displayedStudents.map((student) => (
          <Grid2
            container
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 1, px: 0 }}
            key={student.id}
          >
            <Grid2 item textAlign="center" size={2}>
              <Avatar
                src={
                  student.image
                    ? student.image
                    : `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random&size=40`
                }
                alt={`${student.firstName} ${student.lastName}`}
                sx={{ width: 40, height: 40, margin: "0 auto" }}
              >
                {student.firstName[0] + student.lastName[0]}
              </Avatar>
            </Grid2>
            <Grid2 item textAlign="center" size={5}>
              <Typography>{`${student.firstName} ${student.lastName}`}</Typography>
            </Grid2>
            <Grid2 item textAlign="center" size={5}>
              <Typography>{student.courseNames}</Typography>
            </Grid2>
            {/* <Grid2 item textAlign="center" size={3}>
              <Chip
                label={`${student.passedExams || 0}/${student.totalExams || 0}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: "medium" }}
              />
            </Grid2> */}
          </Grid2>
        ))}

      {/* Pagination */}
      {!isLoading && filteredStudents.length > 0 && (
        <Stack spacing={2} alignItems="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Stack>
      )}
    </>
  );
}
