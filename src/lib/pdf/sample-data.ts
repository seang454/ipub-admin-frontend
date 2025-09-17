export interface SampleFile {
  id: string
  name: string
  type: string
  size: string
  pages: number
  thumbnail: string
  lastModified: string
  tags: string[]
}

export const sampleFiles: SampleFile[] = [
  {
    id: "1",
    name: "C++ Programming Tutorial.pdf",
    type: "application/pdf",
    size: "2.4 MB",
    pages: 39,
    thumbnail: "/sample-files/programming-tutorial.jpg",
    lastModified: "2024-01-15",
    tags: ["Programming", "Tutorial", "C++"],
  },
  {
    id: "2",
    name: "Q4 Business Report.pdf",
    type: "application/pdf",
    size: "1.8 MB",
    pages: 24,
    thumbnail: "/sample-files/business-report.jpg",
    lastModified: "2024-01-12",
    tags: ["Business", "Report", "Finance"],
  },
  {
    id: "3",
    name: "Machine Learning Research.pdf",
    type: "application/pdf",
    size: "3.2 MB",
    pages: 67,
    thumbnail: "/sample-files/research-paper.jpg",
    lastModified: "2024-01-10",
    tags: ["Research", "AI", "Academic"],
  },
  {
    id: "4",
    name: "Software User Manual.pdf",
    type: "application/pdf",
    size: "1.5 MB",
    pages: 45,
    thumbnail: "/sample-files/user-manual.jpg",
    lastModified: "2024-01-08",
    tags: ["Manual", "Documentation", "Software"],
  },
  {
    id: "5",
    name: "Project Presentation.pdf",
    type: "application/pdf",
    size: "4.1 MB",
    pages: 18,
    thumbnail: "/sample-files/presentation-slide.jpg",
    lastModified: "2024-01-05",
    tags: ["Presentation", "Project", "Slides"],
  },
]

export const getSampleFile = (id: string): SampleFile | undefined => {
  return sampleFiles.find((file) => file.id === id)
}

export const getSampleFilesByTag = (tag: string): SampleFile[] => {
  return sampleFiles.filter((file) => file.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase())))
}
