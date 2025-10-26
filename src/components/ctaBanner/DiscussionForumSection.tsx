import React from "react";
import Image from "next/image";

const DiscussionForumSection: React.FC = () => {
  return (
    <section className="bg-background transition-colors py-8 sm:py-10 md:py-12 w-full items-center px-4 sm:px-6 md:px-10 lg:px-20 flex flex-col md:flex-row gap-8 sm:gap-10 md:gap-12 mx-auto">
      {/* Left side: Image container with blue blob */}
      <div className="relative w-48 h-[320px] sm:w-56 sm:h-[380px] md:w-64 md:h-[460px] flex-shrink-0">
        {/* Blue blob background with blur */}
        <div
          className="absolute -top-8 sm:-top-10 md:-top-12 -left-8 sm:-left-10 md:-left-12 w-52 h-[320px] sm:w-60 sm:h-[380px] md:w-72 md:h-[460px] bg-blue-600 rounded-[80%_44%_44%_70%/_100%_100%_100%_100%] filter drop-shadow-lg"
          style={{ filter: "blur(8px)" }}
        ></div>
        <div className="absolute -top-8 sm:-top-10 md:-top-12 -left-8 sm:-left-10 md:-left-12 w-52 h-[320px] sm:w-60 sm:h-[380px] md:w-72 md:h-[460px] bg-blue-600 rounded-[80%_44%_44%_70%/_100%_100%_100%_100%] filter drop-shadow-lg backdrop-blur-md"></div>
        {/* Person image */}
        <Image
          src="/hero-section/DiscussionForumSection.png"
          alt="Person holding laptop"
          className="relative h-full -top-2 sm:-top-3 md:-top-4 left-2 sm:left-3 md:left-4 scale-135 object-contain"
          width={256}
          height={460}
        />
      </div>

      {/* Right side: Text and stats */}
      <div className="max-w-xl flex flex-col gap-4 sm:gap-5 md:gap-6 text-center md:text-left">
        {/* Label */}
        <p className="text-xs sm:text-sm text-secondary font-semibold uppercase tracking-widest transition-colors">
          DOCUHUB DISCUSSION FORUM
        </p>

        {/* Main heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-tight transition-colors">
          Connect, Share, and Learn Together
        </h2>

        {/* Description */}
        <p className="text-muted-foreground text-sm sm:text-base md:text-md leading-relaxed transition-colors">
          Join DocuHub&apos;s Discussion Forum—a vibrant space for exchanging
          ideas, sharing research insights, and supporting fellow learners.
          Collaborate with a global academic community and expand your knowledge
          through meaningful conversations and mentorship.
        </p>

        {/* Stats container */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 md:gap-6 mt-2 sm:mt-3 md:mt-4">
          {/* Stat Item */}
          <div className="bg-card rounded-xl px-4 py-6 sm:px-5 sm:py-7 md:px-6 md:py-8 flex flex-col items-center shadow-md w-20 sm:w-22 md:w-24 transition-colors border border-border">
            <span className="text-secondary font-bold text-2xl sm:text-2xl md:text-3xl transition-colors">
              12k
            </span>
            <span className="font-semibold text-foreground mt-1 sm:mt-1.5 md:mt-2 text-xs sm:text-sm transition-colors">
              Members
            </span>
          </div>

          <div className="bg-card rounded-xl px-4 py-6 sm:px-5 sm:py-7 md:px-6 md:py-8 flex flex-col items-center shadow-md w-24 sm:w-26 md:w-28 transition-colors border border-border">
            <span className="text-secondary font-bold text-2xl sm:text-2xl md:text-3xl transition-colors">
              98+
            </span>
            <span className="font-semibold text-foreground mt-1 sm:mt-1.5 md:mt-2 text-xs sm:text-sm text-center transition-colors">
              Discussions
            </span>
          </div>

          <div className="bg-card rounded-xl px-4 py-6 sm:px-5 sm:py-7 md:px-6 md:py-8 flex flex-col items-center shadow-md w-20 sm:w-22 md:w-28 transition-colors border border-border">
            <span className="text-secondary font-bold text-2xl sm:text-2xl md:text-3xl transition-colors">
              10+
            </span>
            <span className="font-semibold text-foreground mt-1 sm:mt-1.5 md:mt-2 text-xs sm:text-sm transition-colors">
              Advisers
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscussionForumSection;
