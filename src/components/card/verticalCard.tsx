"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { BookOpen, Calendar, Award, Star, Download, Eye } from "lucide-react";

interface VerticalCardProps {
  title: string;
  authors: string[];
  authorImage?: string;
  journal?: string;
  year?: string;
  citations?: string;
  abstract?: string;
  tags?: string[];
  image?: string;
  isBookmarked?: boolean;
  paperId: string;
  onDownloadPDF?: () => void;
  onToggleBookmark?: () => void;
  className?: string;
}

export default function VerticalCard({
  title,
  authors,
  authorImage,
  journal,
  year,
  citations,
  abstract,
  tags = [],
  image,
  isBookmarked = false,
  paperId,
  onDownloadPDF,
  onToggleBookmark,
  className = "",
}: VerticalCardProps) {
  const router = useRouter();
  const displayAuthors =
    authors.length > 2 ? [...authors.slice(0, 2), "..."] : authors;

  // Truncate abstract to 150 characters with ... if longer
  const displayAbstract = abstract
    ? abstract.length > 150
      ? `${abstract.slice(0, 150).trim()}...`
      : abstract
    : "";

  const handleViewPaper = () => {
    router.push(`/papers/${paperId}`);
  };

  return (
    <div
      className={`w-full max-w-[380px] sm:max-w-[420px] md:max-w-[440px] mx-auto bg-card rounded-lg overflow-hidden flex flex-col shadow-md hover:shadow-lg transition-shadow ${className} min-h-[420px] sm:min-h-[480px] md:min-h-[500px]`}
    >
      {/* Header Image */}
      {image && (
        <div className="relative w-full h-36 sm:h-40 md:h-44 flex-shrink-0">
          <Image
            unoptimized
            src={image}
            alt={title}
            fill
            className="object-cover"
            priority={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      )}

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-2 sm:mb-3 line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Authors */}
        <div className="flex items-center mb-2 sm:mb-3 min-w-0">
          {authorImage && (
            <Image
              src={authorImage}
              alt={authors[0] || "Author"}
              width={32}
              height={32}
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full mr-2 sm:mr-2.5 md:mr-3 flex-shrink-0"
              priority={false}
              unoptimized
            />
          )}
          <span className="text-xs sm:text-sm md:text-base text-foreground truncate">
            {displayAuthors.join(", ")}
          </span>
        </div>

        {/* Publication Info */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mb-2 sm:mb-3 text-xs sm:text-sm text-foreground">
          {journal && (
            <div className="flex items-center space-x-1 truncate max-w-[140px] sm:max-w-none">
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">{journal}</span>
            </div>
          )}
          {year && (
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              <span className="text-xs sm:text-sm">{year}</span>
            </div>
          )}
          {citations && (
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              <span className="text-xs sm:text-sm">{citations}</span>
            </div>
          )}
          <button
            onClick={onToggleBookmark}
            className="flex items-center space-x-1 hover:text-secondary transition-colors flex-shrink-0 ml-auto"
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <Star
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${
                isBookmarked ? "fill-accent text-accent" : "text-foreground"
              }`}
            />
          </button>
        </div>

        {/* Abstract */}
        {displayAbstract && (
          <p className="text-xs sm:text-sm md:text-base text-foreground/80 mb-2 sm:mb-3 line-clamp-3 flex-1">
            {displayAbstract}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 mb-3 sm:mb-4">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 sm:py-1 text-foreground text-xs sm:text-sm rounded-full font-medium truncate max-w-[100px] sm:max-w-none"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-2.5 md:gap-3 mt-auto">
          <button
            onClick={handleViewPaper}
            className="flex items-center justify-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors text-xs sm:text-sm md:text-base flex-1 font-medium"
            aria-label="View paper"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <span>View</span>
          </button>
          <button
            onClick={onDownloadPDF}
            className="flex items-center justify-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors text-xs sm:text-sm md:text-base flex-1 border border-border font-medium"
            aria-label="Download PDF"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <span>PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
