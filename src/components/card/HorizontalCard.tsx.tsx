"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { BookOpen, Calendar, Award, Star, Download, Eye } from "lucide-react";

interface HorizontalCardProps {
  id: number; // Replace paperId with id
  title: string;
  authors: string[];
  authorImage?: string;
  journal: string;
  year: string;
  citations: string;
  abstract: string;
  tags: string[];
  image: string;
  isBookmarked?: boolean;
  onViewPaper?: () => void; // Add onViewPaper
  onDownloadPDF?: () => void;
  onToggleBookmark?: () => void;
  link?: string;
}

export default function HorizontalCard({
  id, // Replace paperId with id
  title,
  authors,
  authorImage,
  journal,
  year,
  citations,
  abstract,
  tags,
  image,
  isBookmarked = false,
  onViewPaper, // Add onViewPaper
  onDownloadPDF,
  onToggleBookmark,
  link,
}: HorizontalCardProps) {
  const router = useRouter();

  return (
    <div className="w-full bg-card overflow-hidden rounded-lg flex flex-col md:flex-row shadow-md hover:shadow-lg transition-shadow h-full">
      {/* Left Section - Image */}
      <div className="relative w-full md:w-1/3 h-48 sm:h-56 md:h-auto flex-shrink-0">
        <Image
          unoptimized
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right Section */}
      <div className="w-full md:w-2/3 p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-2 sm:mb-3 line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Authors */}
        <div className="flex items-center mb-2 sm:mb-3 min-w-0">
          {authorImage && (
            <Image
              src={authorImage}
              alt={authors[0]}
              width={32}
              height={32}
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full mr-2 flex-shrink-0"
              unoptimized
            />
          )}
          <span className="text-xs sm:text-sm md:text-base text-foreground truncate">
            {authors.join(", ")}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 text-xs sm:text-sm text-foreground">
          <div className="flex items-center space-x-1 truncate max-w-[150px] sm:max-w-none">
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{journal}</span>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{year}</span>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Award className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{citations}</span>
          </div>
          <button
            onClick={onToggleBookmark}
            className="flex items-center space-x-1 hover:text-secondary transition-colors flex-shrink-0 ml-auto"
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <Star
              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                isBookmarked ? "fill-accent text-accent" : ""
              }`}
            />
          </button>
        </div>

        {/* Abstract */}
        <p className="text-xs sm:text-sm text-foreground/80 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-1">
          {abstract}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-muted text-foreground text-xs rounded-full font-medium truncate max-w-[100px] sm:max-w-none"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-auto">
          <button
            onClick={onViewPaper || (() => router.push(`/papers/${id}`))} // Use onViewPaper if provided, else fallback to router
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 text-xs sm:text-sm font-medium flex-1 sm:flex-initial"
            aria-label="View paper"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>View</span>
          </button>
          <button
            onClick={onDownloadPDF}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 text-xs sm:text-sm border border-border font-medium flex-1 sm:flex-initial"
            aria-label="Download PDF"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
