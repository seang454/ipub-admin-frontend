export interface User {
  slug: string;
  uuid: string;
  userName: string;
  gender: string | null;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  status: string | null;
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
}

export type UsersResponse = {
  number: number;          // current page
  totalPages: number;      // total pages
  totalElements: number;   // total elements
  content: User[];         // array of users for the current page
};
