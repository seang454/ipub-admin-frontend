export type UserType = {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    image: string;
    age: number;
    gender?: string;
    birthDate?: string;
}

export type CreateUserDto = {
  name: string;
  email: string;
  password: string;
  avatar: string;
};

export type Login={
  email: string;
  password: string;
}
export type UserLoginResponse = {
  access_token:string
  refresh_token:string
}
export type UserTypeRegister = {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'admin' | 'seller'; // Extend roles as needed
  avatar: string;
  creationAt: string; // ISO date string
  updatedAt: string;  // ISO date string
};


export type UserDetailType = {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    image: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    phoneNumber: string;
    website: string;
};

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
export interface UsersResponse {
  number: number;            // current page
  totalPages: number;        // total pages
  totalElements: number;     // total elements
  content: User[];           // array of users
}


