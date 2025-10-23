export type StudentUpdateType = {
    studentCardUrl: string;
    university: string;
    major: string;
    yearsOfStudy: string;
  };
  

  // Define the structure for each student record
export interface Student {
    uuid: string;
    studentCardUrl: string;
    university: string;
    major: string;
    yearsOfStudy: number;
    isStudent: boolean;
    userUuid: string;
}

// Define the structure for pagination metadata
interface Pageable {
    pageNumber: number;
    pageSize: number;
    sort: {
        unsorted: boolean;
        sorted: boolean;
        empty: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
    totalElements: number;
    totalPages: number;
    last: boolean;
    numberOfElements: number;
    first: boolean;
    size: number;
    number: number;
    empty: boolean;
}

// Define the complete structure for the paginated response
export interface PaginatedStudentsResponse {
    content: Student[];
    pageable: Pageable;
    totalElements: number;
    totalPages: number;
    last: boolean;
    numberOfElements: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
        unsorted: boolean;
        sorted: boolean;
        empty: boolean;
    };
    empty: boolean;
}
