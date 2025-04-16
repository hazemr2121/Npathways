import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ProfileSection from "../../Components/Student/MyPathway/ProfileSection";
import MyStudentsInstructor from "../../Components/Instructor/MyStudentsInstructor";
import InstructorCourseSection from "../../Components/Instructor/InstructorCourseSection";
import InstructorProfileSection from "../../Components/Instructor/InstructorProfileSection";

export default function InstructorDashboard() {
  const [tap, setTap] = useState("myStudents");

  return (
    <>
      <Container sx={{ my: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={4}
        >
          <Typography variant="h4" fontWeight={"bold"}>
            My Dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.open("http://localhost:4200", "_blank")}
          >
            Instructor editing page
          </Button>
        </Box>

        <Stack
          flexDirection={"row"}
          px={4}
          mt={2}
          justifyContent={"space-between"}
        >
          <Typography
            color={tap === "myStudents" ? "text.primary" : "text.gray"}
            onClick={() => setTap("myStudents")}
            sx={{ cursor: "pointer" }}
          >
            My Students
          </Typography>

          <Typography
            color={tap === "courses" ? "text.primary" : "text.gray"}
            onClick={() => setTap("courses")}
            sx={{ cursor: "pointer" }}
          >
            Courses
          </Typography>

          <Typography
            color={tap === "profile" ? "text.primary" : "text.gray"}
            onClick={() => setTap("profile")}
            sx={{ cursor: "pointer" }}
          >
            Profile
          </Typography>
        </Stack>
        <Divider
          orientation="horizontal"
          flexItem
          sx={{ border: 1, mx: 4, my: 1, borderColor: "text.primary" }}
        ></Divider>
        <Box pl={4} pr={4} mt={2}>
          {tap === "myStudents" && <MyStudentsInstructor />}
          {tap === "courses" && <InstructorCourseSection />}
          {tap === "profile" && <InstructorProfileSection />}
        </Box>
      </Container>
    </>
  );
}
