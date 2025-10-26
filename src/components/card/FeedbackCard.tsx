"use client";

import React from "react";
import Image from "next/image";

export interface Feedback {
  id: string;
  userName: string;
  userTitle?: string;
  content: string;
  date?: string;
  rating?: number;
  userImage?: string;
}

interface FeedbackCardProps {
  feedback: Feedback;
  className?: string;
  showBorder?: boolean;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  className = "",
  showBorder = true,
}) => {
  // Render star ratings if provided
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
              i < rating
                ? "text-yellow-400 dark:text-yellow-500 drop-shadow-sm"
                : "text-gray-300 dark:text-gray-600"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`group relative ${className} w-full sm:w-[580px] md:w-[650px] lg:w-[680px] xl:w-[700px] min-h-[280px] sm:min-h-[300px] md:min-h-[320px] lg:min-h-[340px] mt-5 rounded-2xl sm:rounded-3xl
        bg-card
        ${showBorder ? "border-2 border-border" : "border border-border/50"}
        shadow-xl hover:shadow-2xl 
        transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.01]
        overflow-hidden flex flex-col p-6 sm:p-7 md:p-8 lg:p-9 xl:p-10`}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-40 h-40 sm:w-48 sm:h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-opacity duration-500 group-hover:opacity-60" />
      <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-tr from-accent/10 to-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 transition-opacity duration-500 group-hover:opacity-60" />

      {/* Content wrapper with relative positioning */}
      <div className="relative z-10 flex flex-col h-full gap-5 sm:gap-6">
        {/* Header section */}
        <div className="flex items-start justify-between gap-4">
          {/* Profile section */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {feedback.userImage ? (
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-[72px] md:w-[72px] lg:h-20 lg:w-20 rounded-full overflow-hidden ring-4 ring-border shadow-lg flex-shrink-0 group-hover:ring-secondary/40 transition-all duration-300">
                <Image
                  src={feedback.userImage}
                  alt={feedback.userName}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 ease-out scale-110 group-hover:scale-125"
                />
              </div>
            ) : (
              <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-[72px] md:w-[72px] lg:h-20 lg:w-20 rounded-full bg-gradient-to-br from-secondary via-blue-600 to-blue-700 flex items-center justify-center ring-4 ring-border shadow-lg flex-shrink-0 group-hover:ring-secondary/40 transition-all duration-300">
                <span className="text-white font-bold text-xl sm:text-2xl md:text-3xl drop-shadow-lg">
                  {feedback.userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate mb-1 transition-colors">
                {feedback.userName}
              </h3>
              {feedback.userTitle && (
                <p className="text-sm sm:text-base text-muted-foreground truncate font-medium transition-colors">
                  {feedback.userTitle}
                </p>
              )}
            </div>
          </div>

          {/* Quote icon */}
          <div className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 16 16"
              className="-scale-x-100 text-accent w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 drop-shadow-md transition-colors"
            >
              <path
                fill="currentColor"
                d="M6.848 2.47a1 1 0 0 1-.318 1.378A7.3 7.3 0 0 0 3.75 7.01A3 3 0 1 1 1 10v-.027a4 4 0 0 1 .01-.232c.009-.15.027-.36.062-.618c.07-.513.207-1.22.484-2.014c.552-1.59 1.67-3.555 3.914-4.957a1 1 0 0 1 1.378.318m7 0a1 1 0 0 1-.318 1.378a7.3 7.3 0 0 0-2.78 3.162A3 3 0 1 1 8 10v-.027a4 4 0 0 1 .01-.232c.009-.15.027-.36.062-.618c.07-.513.207-1.22.484-2.014c.552-1.59 1.67-3.555 3.914-4.957a1 1 0 0 1 1.378.318"
              />
            </svg>
          </div>
        </div>

        {/* Rating section */}
        {feedback.rating !== undefined && (
          <div className="flex items-center justify-start">
            {renderRating(feedback.rating)}
          </div>
        )}

        {/* Content section */}
        <div className="flex-grow flex flex-col justify-center py-2">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground leading-relaxed italic transition-colors">
            &ldquo;{feedback.content}&rdquo;
          </p>
        </div>

        {/* Date section */}
        {feedback.date && (
          <div className="flex items-center justify-end pt-3 border-t border-border/50 transition-colors">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium transition-colors">
                {feedback.date}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent -skew-x-12 transform translate-x-full group-hover:-translate-x-full transition-transform duration-1000 ease-in-out" />
      </div>
    </div>
  );
};

export default FeedbackCard;
