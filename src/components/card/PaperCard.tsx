"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Download, Eye, MessageSquare, Calendar, Star, Bookmark } from "lucide-react"
import Link from "next/link"

interface PaperCardProps {
  paper: {
    uuid: string
    title: string
    authors?: string[]
    abstract?: string
    publishedDate?: string
    categories?: string[]
    fileUrl?: string
    views?: number
    downloads?: number
    comments?: number
    rating?: number
  }
  onDownloadPDF: () => void
  onToggleBookmark: () => void
  isBookmarked: boolean
}

export default function PaperCard({ paper, onDownloadPDF, onToggleBookmark, isBookmarked }: PaperCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight mb-2">
              <Link href={`/paper/${paper.uuid}`} className="hover:text-primary transition-colors">
                {paper.title}
              </Link>
            </CardTitle>

            {paper.authors && paper.authors.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">
                    {paper.authors[0]
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span>{paper.authors.slice(0, 2).join(", ")}</span>
                {paper.authors.length > 2 && <span>+{paper.authors.length - 2} more</span>}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(paper.publishedDate)}</span>
              </div>
              {paper.views && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{paper.views}</span>
                </div>
              )}
              {paper.comments && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{paper.comments}</span>
                </div>
              )}
            </div>

            {paper.categories && paper.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {paper.categories.slice(0, 3).map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="sm" onClick={onToggleBookmark} className="h-8 w-8 p-0">
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>
            {paper.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">{paper.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {paper.abstract && <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{paper.abstract}</p>}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {paper.downloads && <span className="text-xs text-muted-foreground">{paper.downloads} downloads</span>}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onDownloadPDF} className="text-xs bg-transparent">
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
            <Button variant="default" size="sm" asChild className="text-xs">
              <Link href={`/paper/${paper.uuid}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
