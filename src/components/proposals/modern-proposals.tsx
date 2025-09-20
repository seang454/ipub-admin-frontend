"use client"

import { Calendar, User, Clock, FileText, Tag, AlertCircle, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface Paper {
  uuid: string
  title: string
  abstract_text: string
  author_uuid: string
  author_name: string
  category_uuid: string
  category_name: string
  submitted_at: string
  created_at: string
  status: string
  thumbnail_url?: string
  download_count: number
  is_approved: boolean
  assigned_uuid: string | null
}

export function ModernProposals() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Mock data representing papers with is_approved=false and assigned_uuid=null
  const papers: Paper[] = [
    {
      uuid: "paper-1",
      title: "Machine Learning Applications in Healthcare Diagnostics",
      abstract_text:
        "This research explores the implementation of advanced machine learning algorithms for early disease detection and diagnosis optimization in clinical settings. We propose a novel approach that combines deep learning with traditional diagnostic methods to improve accuracy and reduce diagnostic time.",
      author_uuid: "author-1",
      author_name: "Dr. Sarah Johnson",
      category_uuid: "cat-1",
      category_name: "Artificial Intelligence",
      submitted_at: "2024-01-15",
      created_at: "2024-01-15",
      status: "Under Review",
      download_count: 0,
      is_approved: false,
      assigned_uuid: null,
    },
    {
      uuid: "paper-2",
      title: "Sustainable Energy Solutions for Urban Infrastructure",
      abstract_text:
        "An comprehensive analysis of renewable energy integration in metropolitan areas, focusing on smart grid technologies and energy storage systems. This study presents innovative approaches to reduce carbon footprint while maintaining reliable power distribution.",
      author_uuid: "author-2",
      author_name: "Prof. Michael Chen",
      category_uuid: "cat-2",
      category_name: "Environmental Science",
      submitted_at: "2024-01-12",
      created_at: "2024-01-12",
      status: "Pending Review",
      download_count: 0,
      is_approved: false,
      assigned_uuid: null,
    },
    {
      uuid: "paper-3",
      title: "Quantum Computing Algorithms for Cryptographic Security",
      abstract_text:
        "This paper investigates the potential of quantum computing in enhancing cryptographic protocols and developing quantum-resistant security measures. We present novel algorithms that leverage quantum properties for improved data protection.",
      author_uuid: "author-3",
      author_name: "Dr. Emily Rodriguez",
      category_uuid: "cat-3",
      category_name: "Computer Science",
      submitted_at: "2024-01-10",
      created_at: "2024-01-10",
      status: "Initial Review",
      download_count: 0,
      is_approved: false,
      assigned_uuid: null,
    },
    {
      uuid: "paper-4",
      title: "Neuroplasticity and Cognitive Enhancement Through Digital Therapeutics",
      abstract_text:
        "Exploring the intersection of neuroscience and digital health technologies to develop evidence-based therapeutic interventions for cognitive enhancement and neurological rehabilitation.",
      author_uuid: "author-4",
      author_name: "Dr. James Wilson",
      category_uuid: "cat-4",
      category_name: "Neuroscience",
      submitted_at: "2024-01-08",
      created_at: "2024-01-08",
      status: "Under Review",
      download_count: 0,
      is_approved: false,
      assigned_uuid: null,
    },
  ]

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.author_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || paper.category_name === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedPapers = [...filteredPapers].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
      case "oldest":
        return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
      case "title":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "under review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending review":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "initial review":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground text-balance">Research Proposals</h1>
              <p className="text-muted-foreground mt-1">Papers awaiting review and adviser assignment</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                {sortedPapers.length} Pending
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search papers, authors, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-card">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Artificial Intelligence">AI & ML</SelectItem>
              <SelectItem value="Environmental Science">Environmental</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Neuroscience">Neuroscience</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-32 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Papers Grid */}
        <div className="grid gap-6">
          {sortedPapers.map((paper) => (
            <Card
              key={paper.uuid}
              className="group hover:shadow-lg transition-all duration-300 border-border bg-card/50 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors text-balance">
                      {paper.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{paper.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Submitted {formatDate(paper.submitted_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{Math.floor(Math.random() * 10) + 1} days ago</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(paper.status)} font-medium`}>
                    <div className="w-2 h-2 bg-current rounded-full mr-2 opacity-70"></div>
                    {paper.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-card-foreground mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Abstract
                    </h4>
                    <p className="text-muted-foreground leading-relaxed text-pretty">{paper.abstract_text}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        <Tag className="w-3 h-3 mr-1" />
                        {paper.category_name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">ID: {paper.uuid.slice(-8)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground hover:text-primary bg-transparent"
                      >
                        View Details
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Assign Adviser
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedPapers.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">No papers found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
