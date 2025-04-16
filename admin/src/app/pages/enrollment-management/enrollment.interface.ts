export interface Enrollment {
  _id: string;
  userId: {
    _id: string;
    pathways: Array<{
      _id: string;
      name: string;
    }>;
  };
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  facultyName: string;
  GPA: number;
  motivationLetter: string;
  exam: Array<{
    question: string;
    answer: string;
  }>;
  createdAt: string;
  updatedAt: string;
  address: {
    country: string;
    city: string;
    street: string;
  };
  pathway: string;
}
