"use client"

import { Annotation, FileItem, ProjectData, storage } from "@/lib/auth/storagepdf"
import { useState, useEffect, useCallback } from "react"
export function useFiles() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFiles = () => {
      try {
        const storedFiles = storage.getFiles()
        setFiles(storedFiles)
      } catch (error) {
        console.error("Failed to load files:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFiles()
  }, [])

  const addFile = useCallback((file: FileItem) => {
    storage.addFile(file)
    setFiles((prev) => [...prev, file])
  }, [])

  const removeFile = useCallback((fileId: string) => {
    storage.removeFile(fileId)
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }, [])

  const updateFile = useCallback(
    (fileId: string, updates: Partial<FileItem>) => {
      const updatedFiles = files.map((f) => (f.id === fileId ? { ...f, ...updates } : f))
      storage.saveFiles(updatedFiles)
      setFiles(updatedFiles)
    },
    [files],
  )

  return {
    files,
    loading,
    addFile,
    removeFile,
    updateFile,
  }
}

export function useAnnotations(fileId: string) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!fileId) return

    const loadAnnotations = () => {
      try {
        const storedAnnotations = storage.getAnnotations(fileId)
        setAnnotations(storedAnnotations)
      } catch (error) {
        console.error("Failed to load annotations:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAnnotations()
  }, [fileId])

  const saveAnnotations = useCallback(
    (newAnnotations: Annotation[]) => {
      storage.saveAnnotations(fileId, newAnnotations)
      setAnnotations(newAnnotations)
    },
    [fileId],
  )

  const addAnnotation = useCallback(
    (annotation: Annotation) => {
      const updated = [...annotations, annotation]
      saveAnnotations(updated)
    },
    [annotations, saveAnnotations],
  )

  const updateAnnotation = useCallback(
    (annotationId: string, updates: Partial<Annotation>) => {
      const updated = annotations.map((ann) => (ann.id === annotationId ? { ...ann, ...updates } : ann))
      saveAnnotations(updated)
    },
    [annotations, saveAnnotations],
  )

  const removeAnnotation = useCallback(
    (annotationId: string) => {
      const updated = annotations.filter((ann) => ann.id !== annotationId)
      saveAnnotations(updated)
    },
    [annotations, saveAnnotations],
  )

  return {
    annotations,
    loading,
    saveAnnotations,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
  }
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [currentProject, setCurrentProject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = () => {
      try {
        const storedProjects = storage.getProjects()
        const currentProjectId = storage.getCurrentProject()
        setProjects(storedProjects)
        setCurrentProject(currentProjectId)
      } catch (error) {
        console.error("Failed to load projects:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  const createProject = useCallback((name: string) => {
    const newProject: ProjectData = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      files: [],
      annotations: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    storage.saveProject(newProject)
    setProjects((prev) => [...prev, newProject])
    return newProject
  }, [])

  const updateProject = useCallback(
    (projectId: string, updates: Partial<ProjectData>) => {
      const updated = projects.map((p) => (p.id === projectId ? { ...p, ...updates, updatedAt: Date.now() } : p))
      const updatedProject = updated.find((p) => p.id === projectId)
      if (updatedProject) {
        storage.saveProject(updatedProject)
        setProjects(updated)
      }
    },
    [projects],
  )

  const removeProject = useCallback(
    (projectId: string) => {
      storage.removeProject(projectId)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      if (currentProject === projectId) {
        setCurrentProject(null)
        storage.setCurrentProject("")
      }
    },
    [currentProject],
  )

  const switchProject = useCallback((projectId: string) => {
    storage.setCurrentProject(projectId)
    setCurrentProject(projectId)
  }, [])

  return {
    projects,
    currentProject,
    loading,
    createProject,
    updateProject,
    removeProject,
    switchProject,
  }
}

export function useStorageInfo() {
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 0,
    percentage: 0,
  })

  const updateStorageInfo = useCallback(() => {
    const info = storage.getStorageUsage()
    setStorageInfo(info)
  }, [])

  useEffect(() => {
    updateStorageInfo()
  }, [updateStorageInfo])

  return {
    storageInfo,
    updateStorageInfo,
  }
}
