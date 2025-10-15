export interface Paper {
  uuid: string;
  title: string;
  abstractText: string;
  fileUrl: string;
  thumbnailUrl: string;
  authorUuid: string;
  categoryNames: string[];
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  isApproved: boolean;
  submittedAt: string; // ISO date string
  createdAt: string;   // ISO date string
  isPublished: boolean;
  publishedAt: string | null;
  downloads: number;
}


export interface Pageable {
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
}

//for user response
export interface PapersResponse {
  papers: {
    content: Paper[];
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
  };
  message: string;
}


export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  authorImage?: string;
  journal?: string;
  year?: string;
  citations?: string;
  abstract?: string;
  tags?: string[];
  isBookmarked?: boolean;
  image?: string;
  authorUuid?: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  fileUrl?: string;
}

interface Sort {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
}

// interface Pageable {
//   pageNumber: number;
//   pageSize: number;
//   sort: Sort;
//   offset: number;
//   unpaged: boolean;
//   paged: boolean;
// }

interface PapersData {
  content: Paper[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: Sort;
  first: boolean;
  empty: boolean;
}

export interface GetPapersResponse {
  message: string;
  papers: PapersData;
}


export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  authorImage?: string;
  journal?: string;
  year?: string;
  citations?: string;
  abstract?: string;
  tags?: string[];
  isBookmarked?: boolean;
  image?: string;
  authorUuid?: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  fileUrl?: string;
}

interface Sort {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
}

// interface Pageable {
//   pageNumber: number;
//   pageSize: number;
//   sort: Sort;
//   offset: number;
//   unpaged: boolean;
//   paged: boolean;
// }

interface PapersData {
  content: Paper[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: Sort;
  first: boolean;
  empty: boolean;
}

export interface GetPapersResponse {
  message: string;
  papers: PapersData;
}