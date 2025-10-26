"use client";
import DevelopmentServicesBanner from "@/components/carousel/LogoCarousel";
import HorizontalCardCarousel from "@/components/carousel/HorizontalCardCarousel.tsx";
import FeedbackCardCarousel from "@/components/carousel/FeedbackCarousel";
import VerticalCard from "@/components/card/verticalCard";
import ButtonScrollHorizontal from "@/components/scrollHorizontal/buttonScrollHorizontal";
import FeatureCardGrid from "@/components/cardGrid/FeatureCardGrid";
import WorksCardGrid from "@/components/cardGrid/WorksCardGrid";
import AdventureSection from "@/components/ctaBanner/CtaBanner";
import DiscussionForumSection from "@/components/ctaBanner/DiscussionForumSection";
import HeroSection from "@/components/heroSection/HeroSection";
import { useTranslation } from "react-i18next";
export default function PageHome() {
  const { t } = useTranslation("common");

  const handleViewPaper = (paperId: number) => {
    window.location.href = `/papers/${paperId}`;
  };
  const handleDownloadPDF = (paperId: number) =>
    console.log("Download PDF:", paperId);
  const handleToggleBookmark = (paperId: number) =>
    console.log("Toggle bookmark:", paperId);
  const researchPapers = [
    {
      id: 1,
      title: "Annual Financial Report 2024",
      authors: ["Finance Department"],
      authorImage: "https://randomuser.me/api/portraits/men/32.jpg",
      journal: "GlobalCorp Ltd",
      year: "2024",
      citations: "120",
      abstract:
        "This document provides a detailed overview of GlobalCorp’s financial performance for the fiscal year 2024, including revenue, expenses, and projections for 2025.",
      tags: ["Finance", "Reports"],
      isBookmarked: false,
      image:
        "https://storage.googleapis.com/bukas-website-v3-prd/website_v3/images/Article_Image_College_Courses_x_Computer_and_I.width-800.png",
    },
    {
      id: 2,
      title: "Public Health Guidelines for 2025",
      authors: ["Ministry of Health"],
      authorImage: "https://randomuser.me/api/portraits/women/44.jpg",
      journal: "National Health Council",
      year: "2025",
      citations: "85",
      abstract:
        "Updated public health guidelines outlining preventive measures, vaccination strategies, and emergency preparedness protocols for 2025.",
      tags: ["Health", "Guidelines"],
      isBookmarked: true,
      image:
        "https://picnie-data.s3.ap-south-1.amazonaws.com/templates_output_images/new_7178_230917084321.jpg",
    },
    {
      id: 3,
      title: "Smart City Development Plan",
      authors: ["Urban Development Authority"],
      authorImage: "https://randomuser.me/api/portraits/men/56.jpg",
      journal: "City Council",
      year: "2024",
      citations: "65",
      abstract:
        "A strategic plan detailing infrastructure, technology integration, and sustainability projects for the upcoming Smart City initiative.",
      tags: ["Urban Planning", "Sustainability"],
      isBookmarked: false,
      image:
        "https://idpdefault.s3.ap-south-1.amazonaws.com/589465a620a8be4fd4220240116115232.jpg",
    },
    {
      id: 4,
      title: "Environmental Impact Assessment",
      authors: ["Eco Analytics Team"],
      authorImage: "https://randomuser.me/api/portraits/women/68.jpg",
      journal: "Green Earth Foundation",
      year: "2024",
      citations: "150",
      abstract:
        "This report analyzes the environmental impact of industrial projects across regions and provides recommendations for eco-friendly practices.",
      tags: ["Environment", "Assessment"],
      isBookmarked: false,
      image:
        "https://data-flair.training/wp-content/uploads/2020/06/free-python-certification-course-thumbnail.webp",
    },
    {
      id: 5,
      title: "Digital Transformation Strategy",
      authors: ["IT Strategy Board"],
      authorImage: "https://randomuser.me/api/portraits/men/70.jpg",
      journal: "TechVision Group",
      year: "2024",
      citations: "95",
      abstract:
        "A roadmap for implementing digital technologies across various business units, focusing on automation, AI adoption, and data security.",
      tags: ["Technology", "Business"],
      isBookmarked: true,
      image:
        "https://instructor-academy.onlinecoursehost.com/content/images/2020/10/react-2.png",
    },
    {
      id: 6,
      title: "Tourism Development Report",
      authors: ["Tourism Authority"],
      authorImage: "https://randomuser.me/api/portraits/women/55.jpg",
      journal: "National Tourism Board",
      year: "2025",
      citations: "78",
      abstract:
        "An official report highlighting growth opportunities, investment plans, and cultural preservation strategies for the tourism sector.",
      tags: ["Tourism", "Development"],
      isBookmarked: false,
      image:
        "https://data-flair.training/wp-content/uploads/2023/06/free-javascript-certification-course-thumbnail-hindi.webp",
    },
  ];

  const feedbacksData = [
    {
      id: "1",
      userName: "Chim Theara",
      userTitle: "ISTAD’s Student",
      content:
        "IPUB AcademicHub helped me publish my first research paper and connect with mentors who guided me every step of the way.",
      rating: 5,
      userImage: "/memberTeam/ChimTheara.JPG",
    },
    {
      id: "2",
      userName: "Sorn Sophamarinet",
      userTitle: "ISTAD’s Student",
      content:
        "The platform streamlines mentorship and feedback, making it easier to guide multiple students and track their progress.",
      rating: 4,
      userImage: "/memberTeam/SornSophamarinet.JPG",
    },
    {
      id: "3",
      userName: "BUT SEAVTHONG",
      userTitle: "ISTAD’s Student",
      content:
        "I discovered valuable research in my field and received constructive feedback that greatly improved a lot of my works.",
      rating: 5,
      userImage: "/memberTeam/BUTSEAVTHONG.jpg",
    },
    {
      id: "4",
      userName: "KRY SOBOTHTY",
      userTitle: "ISTAD’s Student",
      content:
        "The advanced search and project discovery features helped me find relevant studies and collaborate with peers worldwide.",
      rating: 4,
      userImage: "/memberTeam/KrySobothty.JPG",
    },
  ];
  return (
    <div className="min-h-screen flex flex-col bg-background-root">
      {/* Hero Section */}
      <HeroSection />

      <DevelopmentServicesBanner />

      {/* Card Section */}
      <section className="w-full bg-muted/60 transition-colors">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground mb-4 sm:mb-6 md:mb-8">
            {t("newDocuments")}
          </h2>
          <div className="mb-4 sm:mb-5 md:mb-6">
            <ButtonScrollHorizontal />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 justify-items-center">
            {researchPapers.map((paper) => (
              <VerticalCard
                key={paper.id}
                title={paper.title}
                authors={paper.authors}
                authorImage={paper.authorImage}
                journal={paper.journal}
                year={paper.year}
                citations={paper.citations}
                abstract={paper.abstract}
                tags={paper.tags}
                isBookmarked={paper.isBookmarked}
                image={paper.image}
                paperId={paper.id.toString()}
                onDownloadPDF={() => handleDownloadPDF(paper.id)}
                onToggleBookmark={() => handleToggleBookmark(paper.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Most Popular Documents */}
      <section className="w-full px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-12 bg-background transition-colors">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground mb-8 sm:mb-10">
          {t("popularDocuments")}
        </h2>
        <HorizontalCardCarousel
          papers={researchPapers}
          onViewPaper={handleViewPaper}
          onDownloadPDF={handleDownloadPDF}
          onToggleBookmark={handleToggleBookmark}
        />
      </section>

      {/* Feature Section */}
      <FeatureCardGrid />
      <AdventureSection />
      <WorksCardGrid />
      <DiscussionForumSection />

      {/* Feedback Section */}
      <section className="w-full py-8 sm:py-10 md:py-12 bg-muted/60 transition-colors">
        {/* Banner */}
        <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] bg-[url('/banner/feedbackBanner.png')] bg-cover bg-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>

          {/* Text Content */}
          <div className="absolute top-1/2 left-1/2 sm:left-1/3 transform -translate-x-1/2 -translate-y-1/2 px-4 sm:px-6 md:px-10 z-10 w-full sm:w-auto text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4">
              {t("banner.title")}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200">
              {t("banner.subtitle")}
            </p>
          </div>
        </div>

        {/* Carousel */}
        <div className="max-w-7xl mx-auto -mt-20 sm:-mt-24 md:-mt-32 mb-12 sm:mb-16 md:mb-20 px-3 sm:px-4 md:px-6 lg:px-8">
          <FeedbackCardCarousel
            feedbacks={feedbacksData}
            autoPlay
            autoPlayInterval={6000}
            showControls
            showIndicators
          />
        </div>
      </section>
    </div>
  );
}
