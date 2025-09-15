// Authentication utilities and types
export type UserRole = "admin" | "mentor" | "student" | "public"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  title?: string
  department?: string
  university?: string
  bio?: string
  researchInterests?: string[]
  profilePicture?: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Mock authentication functions - in a real app, these would connect to your backend
export async function signIn(email: string, password: string): Promise<{ user: User; token: string }> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock user data based on email for demo purposes
  const mockUsers: Record<string, User> = {
    "admin@ipub.com": {
      id: "1",
      email: "admin@ipub.com",
      name: "Admin User",
      role: "admin",
      title: "Platform Administrator",
      isActive: true,
      createdAt: "2024-01-01",
      lastLogin: new Date().toISOString(),
    },
    "mentor@ipub.com": {
      id: "2",
      email: "mentor@ipub.com",
      name: "Dr. Sarah Chen",
      role: "mentor",
      title: "Professor of Computer Science",
      department: "Computer Science",
      university: "Tech University",
      bio: "Expert in machine learning and AI research",
      researchInterests: ["Machine Learning", "AI", "Data Science"],
      isActive: true,
      createdAt: "2024-01-01",
      lastLogin: new Date().toISOString(),
    },
    "student@ipub.com": {
      id: "3",
      email: "student@ipub.com",
      name: "John Smith",
      role: "student",
      title: "Graduate Student",
      department: "Computer Science",
      university: "Tech University",
      bio: "PhD candidate researching neural networks",
      researchInterests: ["Deep Learning", "Computer Vision"],
      isActive: true,
      createdAt: "2024-01-01",
      lastLogin: new Date().toISOString(),
    },
    "user@ipub.com": {
      id: "4",
      email: "user@ipub.com",
      name: "Jane Doe",
      role: "public",
      title: "Independent Researcher",
      bio: "Passionate about AI ethics and research",
      researchInterests: ["AI Ethics", "Philosophy"],
      isActive: true,
      createdAt: "2024-01-01",
      lastLogin: new Date().toISOString(),
    },
  }

  const user = mockUsers[email]
  if (!user || password !== "password") {
    throw new Error("Invalid credentials")
  }

  return {
    user,
    token: `mock-jwt-token-${user.id}`,
  }
}

export async function signUp(data: {
  email: string
  password: string
  name: string
  role: UserRole
  title?: string
  department?: string
  university?: string
}): Promise<{ user: User; token: string }> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user: User = {
    id: Math.random().toString(36).substr(2, 9),
    email: data.email,
    name: data.name,
    role: data.role,
    title: data.title,
    department: data.department,
    university: data.university,
    isActive: true,
    createdAt: new Date().toISOString(),
  }

  return {
    user,
    token: `mock-jwt-token-${user.id}`,
  }
}

export async function signOut(): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
}

export async function getCurrentUser(token: string): Promise<User | null> {
  // Simulate API call to validate token and get user
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real app, you'd validate the JWT token here
  if (!token || !token.startsWith("mock-jwt-token-")) {
    return null
  }

  // Mock user lookup - in reality, you'd decode the JWT or query your database
  const userId = token.replace("mock-jwt-token-", "")
  const mockUsers: Record<string, User> = {
    "1": {
      id: "1",
      email: "admin@ipub.com",
      name: "Admin User",
      role: "admin",
      title: "Platform Administrator",
      isActive: true,
      createdAt: "2024-01-01",
      lastLogin: new Date().toISOString(),
    },
    "2": {
      id: "2",
      email: "mentor@ipub.com",
      name: "Dr. Sarah Chen",
      role: "mentor",
      title: "Professor of Computer Science",
      department: "Computer Science",
      university: "Tech University",
      bio: "Expert in machine learning and AI research",
      researchInterests: ["Machine Learning", "AI", "Data Science"],
      isActive: true,
      createdAt: "2024-01-01",
      lastLogin: new Date().toISOString(),
    },
    "3": {
      id: "3",
      email: "student@ipub.com",
      name: "John Smith",
      role: "student",
      title: "Graduate Student",
      department: "Computer Science",
      university: "Tech University",
      bio: "PhD candidate researching neural networks",
      researchInterests: ["Deep Learning", "Computer Vision"],
      isActive: true,
      createdAt: "2024-01-01",
      lastLogin: new Date().toISOString(),
    },
    "4": {
      id: "4",
      email: "user@ipub.com",
      name: "Jane Doe",
      role: "public",
      title: "Independent Researcher",
      bio: "Passionate about AI ethics and research",
      researchInterests: ["AI Ethics", "Philosophy"],
      isActive: true,
      createdAt: "2024-01-01",
      lastLogin: new Date().toISOString(),
    },
  }

  return mockUsers[userId] || null
}

// Role-based access control utilities
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    public: 0,
    student: 1,
    mentor: 2,
    admin: 3,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Define route access rules
  const routePermissions: Record<string, UserRole> = {
    "/admin": "admin",
    "/mentor": "mentor",
    "/student": "student",
    "/profile": "public", // Any authenticated user can access profile
  }

  const requiredRole = routePermissions[route]
  if (!requiredRole) return true // Public routes

  return hasPermission(userRole, requiredRole)
}
