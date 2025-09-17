export interface Paper {
  uuid: string;
  title: string;
  abstractText: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  authorUuid: string;
  categoryNames: string[];
  status: string;
  isApproved: boolean;
  submittedAt: string; // Could be Date if you parse it
  createdAt: string;
  isPublished: boolean;
  publishedAt: string | null;
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
export interface Paper {
  uuid: string;
  title: string;
  abstractText: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  authorUuid: string;
  categoryNames: string[];
  status: string;
  isApproved: boolean;
  submittedAt: string;
  createdAt: string;
  isPublished: boolean;
  publishedAt: string | null;
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

export interface Paper {
  uuid: string;
  title: string;
  abstractText: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  authorUuid: string;
  categoryNames: string[];
  status: string;
  isApproved: boolean;
  submittedAt: string;
  createdAt: string;
  isPublished: boolean;
  publishedAt: string | null;
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