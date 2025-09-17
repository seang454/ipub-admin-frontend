export interface Student {
  id: string
  name: string
  email: string
  course: string
  status: "Active" | "Inactive"
  role: "Student" | "User" | "Adviser"
  lastActive: string
  avatar?: string
}

export function generateFakeAdvisor(count: number): Student[] {
  const names = [
    "Alice Johnson",
    "Bob Smith",
    "Carol Davis",
    "David Wilson",
    "Eva Brown",
    "Frank Miller",
    "Grace Lee",
    "Henry Taylor",
    "Ivy Chen",
    "Jack Anderson",
    "Kate Thompson",
    "Liam Garcia",
    "Maya Patel",
    "Noah Rodriguez",
    "Olivia Martinez",
    "Paul Jackson",
    "Quinn White",
    "Ruby Harris",
    "Sam Clark",
    "Tina Lewis",
    "Uma Singh",
    "Victor Kim",
    "Wendy Liu",
    "Xavier Moore",
    "Yara Ahmed",
    "Zoe Cooper",
    "Alex Turner",
    "Blake Foster",
    "Chloe Reed",
    "Dylan Scott",
  ]

  const courses = [
    "BS Computer Science",
    "BS Information Technology",
    "BS Software Engineering",
    "BS Information Systems",
    "BS Data Science",
    "BS Cybersecurity",
  ]

  const students: Student[] = []

  for (let i = 0; i < count; i++) {
    const name = names[i % names.length]
    const firstName = name.split(" ")[0].toLowerCase()
    const lastName = name.split(" ")[1].toLowerCase()

    students.push({
      id: (i + 1).toString(),
      name: name,
      email: `${firstName}.${lastName}@university.edu`,
      course: courses[Math.floor(Math.random() * courses.length)],
      status: Math.random() > 0.2 ? "Active" : "Inactive",
      role: "Student",
      lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      avatar: `/placeholder.svg?height=40&width=40&text=${name
        .split(" ")
        .map((n) => n[0])
        .join("")}`,
    })
  }

  return students
}
