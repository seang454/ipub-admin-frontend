export interface User {
  slug: string;
  uuid: string;
  userName: string;
  gender: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  status: string;
  createDate: string;
  updateDate: string;
  bio: string | null;
  address: string | null;
  contactNumber: string | null;
  telegramId: string | null;
  isUser: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isAdvisor: boolean;
  isActive: boolean;

  // derived property
  role: "Student" | "Admin" | "Advisor" | "User";
}

export type UsersResponse = {
  number: number; // current page
  totalPages: number; // total pages
  totalElements: number; // total elements
  content: User[]; // array of users for the current page
};

export type RegisterRequest = {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  confirmedPassword: string;
};

export type UpdateUserType = {
  userName: string;
  gender: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  status: string;
  bio: string;
  address: string;
  contactNumber: string;
  telegramId: string;
};

//advisor type
export interface PaginationResponse<T> {
  content: T[]; // Array of data (e.g., list of advisers, products, etc.)
  number: number; // Current page number (0-indexed)
  totalElements: number; // Total number of elements across all pages
  totalPages: number; // Total number of pages
}
