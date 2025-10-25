// WorksCard.tsx (with suppressHydrationWarning added)
"use client";

import React, { FC } from "react";

interface WorksCardProps {
  title?: string;
  description?: string;
  variant?: "default" | "hover";
  index?: number; // to show card number
}

const WorksCard: FC<WorksCardProps> = ({
  title = "PU Card 1",
  description = "Description 1",
  variant = "default",
  index = 1,
}) => {
  return (
    <div
      className={`
        w-full sm:w-[280px] md:w-[300px] h-auto min-h-[220px] sm:min-h-[240px] rounded-[8px] overflow-hidden border
        flex flex-col justify-between items-center
        p-4 sm:pt-[12px] sm:pr-[50px] sm:pb-[12px] sm:pl-[50px]
        mt-0 sm:mt-[18px] ml-0 sm:ml-[9px]
        bg-card text-card-foreground
        border-[var(--color-border)]
        transition-all duration-300 ease-in-out
        ${variant === "hover" ? "hover:scale-105 hover:shadow-lg" : ""}
      `}
      suppressHydrationWarning={true}
    >
      {/* Number indicator */}
      <div
        className={`
          flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-lg my-4 sm:my-[25px]
          bg-accent text-[var(--text-white)]
          text-2xl sm:text-3xl md:text-4xl font-bold
          transition-transform duration-300
          ${variant === "hover" ? "group-hover:scale-110" : ""}
        `}
        suppressHydrationWarning={true}
      >
        {index}
      </div>

      {/* Content */}
      <div className="text-center px-2 pb-2" suppressHydrationWarning={true}>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[var(--color-foreground)] mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-[var(--color-foreground)]/80">
          {description}
        </p>
      </div>
    </div>
  );
};

export default WorksCard;
