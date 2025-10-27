"use client";

import React from "react";
import Image from "next/image";
import { Users, MessageSquare, UserCheck } from "lucide-react";

const DiscussionForumSection: React.FC = () => {
  const stats = [
    {
      value: "12k",
      label: "Members",
      icon: Users,
      description: "Active community",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      value: "98+",
      label: "Discussions",
      icon: MessageSquare,
      description: "Ongoing conversations",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      value: "10+",
      label: "Advisers",
      icon: UserCheck,
      description: "Expert mentors",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-background via-background to-secondary/5 transition-colors">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Left side: Image container with enhanced blob */}
          <div className="relative order-2 lg:order-1 flex justify-center lg:justify-start">
            <div className="relative w-64 h-80 sm:w-72 sm:h-96 md:w-80 md:h-[28rem] lg:w-96 lg:h-[32rem]">
              {/* Animated gradient blob background */}
              <div className="absolute inset-0 -left-8 -top-8 w-[110%] h-[110%]">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-[80%_44%_44%_70%/_100%_100%_100%_100%] animate-blob opacity-90"
                  style={{ filter: "blur(20px)" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-[80%_44%_44%_70%/_100%_100%_100%_100%] opacity-80"></div>
              </div>

              {/* Person image with enhanced styling */}
              <div className="relative z-10 h-full w-full">
                <Image
                  src="/hero-section/DiscussionForumSection.png"
                  alt="Student with laptop representing collaborative learning"
                  className="relative h-full w-full object-contain drop-shadow-2xl"
                  width={384}
                  height={512}
                  priority
                />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-sm z-20 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">
                      Active Now
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      2,847 Online
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Content */}
          <div className="order-1 lg:order-2 flex flex-col gap-6 sm:gap-8 text-center lg:text-left">
            {/* Label with badge style */}
            <div className="inline-flex items-center justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 border border-secondary/30 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider text-secondary transition-all hover:bg-secondary/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                DocuHub Discussion Forum
              </span>
            </div>

            {/* Main heading with gradient */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-secondary bg-clip-text text-transparent">
                Connect, Share, and
              </span>
              <br />
              <span className="bg-gradient-to-r from-secondary to-blue-500 bg-clip-text text-transparent">
                Learn Together
              </span>
            </h2>

            {/* Description with better spacing */}
            <p className="text-muted-foreground text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Join DocuHub&apos;s Discussion Forum—a vibrant space for
              exchanging ideas, sharing research insights, and supporting fellow
              learners. Collaborate with a global academic community and expand
              your knowledge through meaningful conversations and mentorship.
            </p>

            {/* Stats grid - fully responsive */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className={`group relative bg-card ${stat.borderColor} border-2 rounded-2xl p-4 sm:p-5 lg:p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-opacity-50 cursor-pointer overflow-hidden`}
                  >
                    {/* Background gradient on hover */}
                    <div
                      className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    ></div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                      {/* Icon */}
                      <div
                        className={`${stat.color} p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>

                      {/* Value */}
                      <div
                        className={`${stat.color} font-bold text-2xl sm:text-3xl lg:text-4xl transition-colors`}
                      >
                        {stat.value}
                      </div>

                      {/* Label */}
                      <div className="font-semibold text-foreground text-xs sm:text-sm lg:text-base">
                        {stat.label}
                      </div>

                      {/* Description - hidden on small screens */}
                      <div className="hidden sm:block text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {stat.description}
                      </div>
                    </div>

                    {/* Animated border on hover */}
                    <div
                      className={`absolute inset-0 rounded-2xl ${stat.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
                    ></div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button (optional) */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-6">
              <button className="px-8 py-4 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95">
                Join Discussion
              </button>
              <button className="px-8 py-4 bg-card border-2 border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations to your global CSS or tailwind config */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            border-radius: 80% 44% 44% 70% / 100% 100% 100% 100%;
          }
          25% {
            border-radius: 70% 50% 50% 80% / 90% 110% 90% 110%;
          }
          50% {
            border-radius: 60% 60% 60% 60% / 100% 80% 100% 80%;
          }
          75% {
            border-radius: 50% 70% 70% 50% / 110% 90% 110% 90%;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-blob {
          animation: blob 8s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default DiscussionForumSection;
