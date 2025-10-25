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
      <div className="flex items-center mt-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-accent" : "text-muted-foreground"
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
      className={`card ${
        showBorder ? "border" : ""
      } ${className} w-full sm:w-[580px] md:w-[650px] min-h-[240px] sm:min-h-[259px] mt-5 rounded-lg flex flex-col gap-4 sm:gap-5 p-4 sm:p-5 md:p-6`}
    >
      <div className="flex items-center justify-between">
        {/* Profile section */}
        <div className="flex items-center min-w-0 flex-1">
          {feedback.userImage ? (
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
              <Image
                src={feedback.userImage}
                alt={feedback.userName}
                fill
                unoptimized
                className="object-cover transition-transform duration-300 ease-in-out scale-150 hover:scale-170"
              />
            </div>
          ) : (
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
              <span className="text-secondary dark:text-accent font-medium text-lg sm:text-xl">
                {feedback.userName.charAt(0)}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-base sm:text-lg md:text-xl font-semibold text-[var(--color-foreground)] truncate">
              {feedback.userName}
            </p>
            {feedback.userTitle && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {feedback.userTitle}
              </p>
            )}
          </div>
        </div>

        {/* Flipped icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="46"
          height="46"
          viewBox="0 0 16 16"
          className="-scale-x-100 text-accent dark:text-accent w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex-shrink-0"
        >
          <path
            fill="currentColor"
            d="M6.848 2.47a1 1 0 0 1-.318 1.378A7.3 7.3 0 0 0 3.75 7.01A3 3 0 1 1 1 10v-.027a4 4 0 0 1 .01-.232c.009-.15.027-.36.062-.618c.07-.513.207-1.22.484-2.014c.552-1.59 1.67-3.555 3.914-4.957a1 1 0 0 1 1.378.318m7 0a1 1 0 0 1-.318 1.378a7.3 7.3 0 0 0-2.78 3.162A3 3 0 1 1 8 10v-.027a4 4 0 0 1 .01-.232c.009-.15.027-.36.062-.618c.07-.513.207-1.22.484-2.014c.552-1.59 1.67-3.555 3.914-4.957a1 1 0 0 1 1.378.318"
          />
        </svg>
      </div>

      {/* Rating and date row */}
      {(feedback.rating !== undefined || feedback.date) && (
        <div className="flex justify-between items-center flex-wrap gap-2">
          {feedback.rating !== undefined && renderRating(feedback.rating)}
          {feedback.date && (
            <span className="text-xs sm:text-sm text-muted-foreground">
              {feedback.date}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <p className="text-sm sm:text-base text-[var(--color-foreground)] flex-grow">
        &ldquo;{feedback.content}&rdquo;
      </p>
    </div>
  );
};

export default FeedbackCard;
