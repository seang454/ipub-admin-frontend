export interface FileItem {
  id: string
  name: string
  type: string
  size: number
  url: string
  lastModified: number
  uploadedAt: number
}

export interface Annotation {
  id: string
  type: "highlight" | "note" | "draw" | "text" | "shape"
  x: number
  y: number
  width?: number
  height?: number
  content?: string
  color: string
  page: number
  timestamp: number
  strokeWidth?: number
  path?: { x: number; y: number }[]
}

export interface ProjectData {
  id: string
  name: string
  files: FileItem[]
  annotations: Record<string, Annotation[]> // fileId -> annotations
  createdAt: number
  updatedAt: number
}

class StorageManager {
  private static instance: StorageManager
  private readonly STORAGE_PREFIX = "pdfaid_"
  private readonly FILES_KEY = "files"
  private readonly PROJECTS_KEY = "projects"
  private readonly CURRENT_PROJECT_KEY = "current_project"

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  // File Management
  saveFiles(files: FileItem[]): void {
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}${this.FILES_KEY}`, JSON.stringify(files))
    } catch (error) {
      console.error("Failed to save files:", error)
    }
  }

  getFiles(): FileItem[] {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}${this.FILES_KEY}`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to load files:", error)
      return []
    }
  }

  addFile(file: FileItem): void {
    const files = this.getFiles()
    const updatedFiles = [...files, file]
    this.saveFiles(updatedFiles)
  }

  removeFile(fileId: string): void {
    const files = this.getFiles()
    const updatedFiles = files.filter((f) => f.id !== fileId)
    this.saveFiles(updatedFiles)

    // Also remove annotations for this file
    this.removeAnnotations(fileId)
  }

  getFile(fileId: string): FileItem | null {
    const files = this.getFiles()
    return files.find((f) => f.id === fileId) || null
  }

  // Annotation Management
  saveAnnotations(fileId: string, annotations: Annotation[]): void {
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}annotations_${fileId}`, JSON.stringify(annotations))
    } catch (error) {
      console.error("Failed to save annotations:", error)
    }
  }

  getAnnotations(fileId: string): Annotation[] {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}annotations_${fileId}`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to load annotations:", error)
      return []
    }
  }

  removeAnnotations(fileId: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}annotations_${fileId}`)
    } catch (error) {
      console.error("Failed to remove annotations:", error)
    }
  }

  // Project Management
  saveProject(project: ProjectData): void {
    try {
      const projects = this.getProjects()
      const existingIndex = projects.findIndex((p) => p.id === project.id)

      if (existingIndex >= 0) {
        projects[existingIndex] = { ...project, updatedAt: Date.now() }
      } else {
        projects.push(project)
      }

      localStorage.setItem(`${this.STORAGE_PREFIX}${this.PROJECTS_KEY}`, JSON.stringify(projects))
    } catch (error) {
      console.error("Failed to save project:", error)
    }
  }

  getProjects(): ProjectData[] {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}${this.PROJECTS_KEY}`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to load projects:", error)
      return []
    }
  }

  getProject(projectId: string): ProjectData | null {
    const projects = this.getProjects()
    return projects.find((p) => p.id === projectId) || null
  }

  removeProject(projectId: string): void {
    try {
      const projects = this.getProjects()
      const updatedProjects = projects.filter((p) => p.id !== projectId)
      localStorage.setItem(`${this.STORAGE_PREFIX}${this.PROJECTS_KEY}`, JSON.stringify(updatedProjects))
    } catch (error) {
      console.error("Failed to remove project:", error)
    }
  }

  // Current Project Management
  setCurrentProject(projectId: string): void {
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}${this.CURRENT_PROJECT_KEY}`, projectId)
    } catch (error) {
      console.error("Failed to set current project:", error)
    }
  }

  getCurrentProject(): string | null {
    try {
      return localStorage.getItem(`${this.STORAGE_PREFIX}${this.CURRENT_PROJECT_KEY}`)
    } catch (error) {
      console.error("Failed to get current project:", error)
      return null
    }
  }

  // Export/Import functionality
  exportData(): string {
    try {
      const files = this.getFiles()
      const projects = this.getProjects()
      const allAnnotations: Record<string, Annotation[]> = {}

      // Collect all annotations
      files.forEach((file) => {
        const annotations = this.getAnnotations(file.id)
        if (annotations.length > 0) {
          allAnnotations[file.id] = annotations
        }
      })

      const exportData = {
        files,
        projects,
        annotations: allAnnotations,
        exportedAt: Date.now(),
        version: "1.0",
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error("Failed to export data:", error)
      throw new Error("Export failed")
    }
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData)

      if (data.files) {
        this.saveFiles(data.files)
      }

      if (data.projects) {
        localStorage.setItem(`${this.STORAGE_PREFIX}${this.PROJECTS_KEY}`, JSON.stringify(data.projects))
      }

      if (data.annotations) {
        Object.entries(data.annotations).forEach(([fileId, annotations]) => {
          this.saveAnnotations(fileId, annotations as Annotation[])
        })
      }
    } catch (error) {
      console.error("Failed to import data:", error)
      throw new Error("Import failed")
    }
  }

  // Utility methods
  clearAllData(): void {
    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith(this.STORAGE_PREFIX))
      keys.forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.error("Failed to clear data:", error)
    }
  }

  getStorageUsage(): { used: number; total: number; percentage: number } {
    try {
      let used = 0
      const keys = Object.keys(localStorage).filter((key) => key.startsWith(this.STORAGE_PREFIX))

      keys.forEach((key) => {
        const value = localStorage.getItem(key)
        if (value) {
          used += new Blob([value]).size
        }
      })

      // Estimate total localStorage capacity (usually 5-10MB)
      const total = 5 * 1024 * 1024 // 5MB estimate
      const percentage = (used / total) * 100

      return { used, total, percentage }
    } catch (error) {
      console.error("Failed to calculate storage usage:", error)
      return { used: 0, total: 0, percentage: 0 }
    }
  }
}

export const storage = StorageManager.getInstance()
