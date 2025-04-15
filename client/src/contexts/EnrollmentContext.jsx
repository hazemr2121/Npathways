import React, { createContext, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const EnrollmentContext = createContext();

export const EnrollmentProvider = ({ children }) => {
  const [personalDetails, setPersonalDetails] = useState({});
  const [examAnswers, setExamAnswers] = useState([]);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const enrollmentData = {
    ...personalDetails,
    exam: examAnswers,
  };

  return (
    <EnrollmentContext.Provider
      value={{
        personalDetails,
        setPersonalDetails,
        examAnswers,
        setExamAnswers,
        enrollmentData,
        step,
        setStep,
        error,
        setError,
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
};
