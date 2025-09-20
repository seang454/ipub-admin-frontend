/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  ChevronRight,
  Search,
  Filter,
  Eye,
  UserCheck,
  Clock,
  FileText,
  Mail,
  Phone,
  ChevronLeft,
  Star,
  Users,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { mockAdvisors, mockProposals } from "./data";

export function EnhancedProposals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningPaper, setAssigningPaper] = useState<any>(null);
  const [advisorSearch, setAdvisorSearch] = useState("");
  const [currentAdvisorPage, setCurrentAdvisorPage] = useState(1);
  const [currentPaperPage, setCurrentPaperPage] = useState(1);
  const advisorsPerPage = 4; // Single row display
  const papersPerPage = 3;

  const filteredProposals = mockProposals
    .filter(
      (proposal) =>
        !proposal.is_approved &&
        !proposal.assigned_uuid &&
        (proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proposal.author.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.abstract_text
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (categoryFilter === "all" || proposal.category === categoryFilter)
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.submitted_at).getTime() -
          new Date(a.submitted_at).getTime()
        );
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "author") {
        return a.author.name.localeCompare(b.author.name);
      }
      return 0;
    });

  const totalPaperPages = Math.ceil(filteredProposals.length / papersPerPage);
  const paginatedProposals = filteredProposals.slice(
    (currentPaperPage - 1) * papersPerPage,
    currentPaperPage * papersPerPage
  );

  // Filter and paginate advisors
  const filteredAdvisors = mockAdvisors.filter(
    (advisor: any) =>
      advisor.name.toLowerCase().includes(advisorSearch.toLowerCase()) ||
      advisor.specialization
        .toLowerCase()
        .includes(advisorSearch.toLowerCase()) ||
      advisor.department.toLowerCase().includes(advisorSearch.toLowerCase())
  );

  const totalAdvisorPages = Math.ceil(
    filteredAdvisors.length / advisorsPerPage
  );
  const paginatedAdvisors = filteredAdvisors.slice(
    (currentAdvisorPage - 1) * advisorsPerPage,
    currentAdvisorPage * advisorsPerPage
  );

  const handleAssignAdvisor = (advisor: any) => {
    console.log(
      `Assigning advisor ${advisor.name} to paper ${assigningPaper?.title}`
    );
    setShowAssignModal(false);
    setAssigningPaper(null);
    setCurrentAdvisorPage(1);
    setAdvisorSearch("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Research Proposals
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Review and assign advisors to pending research proposals
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 sm:mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by title, author, or keywords..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPaperPage(1); // Reset to first page when searching
                  }}
                  className="pl-10 border-slate-200 focus:border-[#2B7FFF] focus:ring-[#2B7FFF]"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => {
                    setCategoryFilter(value);
                    setCurrentPaperPage(1); // Reset to first page when filtering
                  }}
                >
                  <SelectTrigger className="w-full sm:w-48 border-slate-200">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Artificial Intelligence">AI</SelectItem>
                    <SelectItem value="Environmental Science">
                      Environmental
                    </SelectItem>
                    <SelectItem value="Biomedical Engineering">
                      Biomedical
                    </SelectItem>
                    <SelectItem value="Quantum Computing">Quantum</SelectItem>
                    <SelectItem value="Business Technology">
                      Business Tech
                    </SelectItem>
                    <SelectItem value="Climate Science">Climate</SelectItem>
                    <SelectItem value="Healthcare Technology">
                      Healthcare Tech
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40 border-slate-200">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-slate-600">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredProposals.length}
            </span>{" "}
            pending proposals
          </p>
          {totalPaperPages > 1 && (
            <p className="text-sm text-slate-500">
              Page {currentPaperPage} of {totalPaperPages}
            </p>
          )}
        </div>

        {/* Proposals Grid */}
        <div className="grid gap-6">
          {paginatedProposals.map((proposal) => (
            <Card
              key={proposal.uuid}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm"
            >
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                  {/* Thumbnail */}
                  <div className="w-full lg:w-64 flex-shrink-0">
                    <Image
                      width={100}
                      height={100}
                      unoptimized
                      src={
                        proposal.thumbnail_url ||
                        "/placeholder.svg?height=192&width=256"
                      }
                      alt={proposal.title}
                      className="w-full h-48 object-cover rounded-lg border border-slate-200"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                        {proposal.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/10 self-start"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {proposal.status}
                      </Badge>
                    </div>

                    {/* Author Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                      <button
                        onClick={() => setSelectedUser(proposal.author)}
                        className="flex items-center gap-3 hover:bg-slate-50 rounded-lg p-2 transition-colors self-start"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={
                              proposal.author.profile_picture ||
                              "/placeholder.svg?height=40&width=40"
                            }
                          />
                          <AvatarFallback>
                            {proposal.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-semibold text-slate-900">
                            {proposal.author.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {proposal.author.department}
                          </p>
                        </div>
                      </button>
                      <Separator
                        orientation="vertical"
                        className="h-8 hidden sm:block"
                      />
                      <div className="text-sm text-slate-600">
                        <p>
                          Submitted:{" "}
                          {new Date(proposal.submitted_at).toLocaleDateString()}
                        </p>
                        <p>
                          Category:{" "}
                          <span className="font-medium text-slate-900">
                            {proposal.category}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Abstract */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Abstract
                      </h4>
                      <p className="text-slate-700 leading-relaxed line-clamp-3">
                        {proposal.abstract_text}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedPaper(proposal)}
                          className="border-slate-300 hover:border-[#2B7FFF] hover:text-[#2B7FFF]"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          className="border-slate-300 hover:border-slate-400 bg-transparent"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                      <Button
                        onClick={() => {
                          setAssigningPaper(proposal);
                          setShowAssignModal(true);
                        }}
                        className="bg-gradient-to-r from-[#2B7FFF] to-[#3559AF] hover:from-[#2B7FFF]/90 hover:to-[#3559AF]/90 text-white"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Assign Advisor
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPaperPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {(currentPaperPage - 1) * papersPerPage + 1} to{" "}
              {Math.min(
                currentPaperPage * papersPerPage,
                filteredProposals.length
              )}{" "}
              of {filteredProposals.length} proposals
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPaperPage((prev) => Math.max(1, prev - 1))
                }
                disabled={currentPaperPage === 1}
                className="border-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, totalPaperPages) },
                  (_, i) => {
                    let pageNum;
                    if (totalPaperPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPaperPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPaperPage >= totalPaperPages - 2) {
                      pageNum = totalPaperPages - 4 + i;
                    } else {
                      pageNum = currentPaperPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPaperPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPaperPage(pageNum)}
                        className={
                          currentPaperPage === pageNum
                            ? "bg-[#2B7FFF] hover:bg-[#2B7FFF]/90"
                            : "border-slate-300"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPaperPage((prev) =>
                    Math.min(totalPaperPages, prev + 1)
                  )
                }
                disabled={currentPaperPage === totalPaperPages}
                className="border-slate-300"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Assign Advisor Modal */}
        <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
          <DialogContent className="bg-gradient-to-br from-white to-blue-50 border-0 shadow-2xl rounded-2xl p-6 max-w-lg sm:max-w-2xl">
            <DialogHeader className="pb-4 border-b border-gray-200/50">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 pr-10">
                Assign Advisor to {assigningPaper?.author.name}
              </DialogTitle>
              <p className="text-gray-500 mt-1 text-sm">
                Select an advisor based on expertise and availability
              </p>
            </DialogHeader>

            <div className="space-y-6">
              {/* Search Advisors */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, specialization, or department..."
                  value={advisorSearch}
                  onChange={(e) => {
                    setAdvisorSearch(e.target.value);
                    setCurrentAdvisorPage(1);
                  }}
                  className="pl-10 h-10 text-sm bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg shadow-sm transition-all duration-300"
                />
              </div>

              {/* Cards Container with Fixed Height */}
              <div className="relative">
                <div className="h-[50vh] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent">
                  {paginatedAdvisors.length > 0 ? (
                    paginatedAdvisors.map((advisor) => (
                      <Card
                        key={advisor.uuid}
                        className="border border-gray-200/50 bg-white/95 backdrop-blur-md rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out"
                      >
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex items-center gap-4 sm:gap-5">
                            {/* Avatar Section - Larger and more modern */}
                            <div className="flex-shrink-0">
                              <Avatar className="w-14 h-14 sm:w-16 sm:h-16 ring-2 ring-blue-500/30 hover:ring-blue-500/50 transition-all duration-300">
                                <AvatarImage
                                  src={
                                    advisor.profile_picture ||
                                    "/placeholder.svg?height=64&width=64"
                                  }
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-200 to-indigo-200 text-blue-700 font-semibold text-base">
                                  {advisor.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            </div>

                            {/* Main Info Section - Improved typography and spacing */}
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="space-y-1.5">
                                <h4 className="font-bold text-gray-900 text-lg sm:text-xl truncate">
                                  {advisor.name}
                                </h4>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-3 py-1 bg-blue-100/80 text-blue-700 border-blue-300/50 rounded-full font-medium"
                                  >
                                    {advisor.department}
                                  </Badge>
                                </div>
                              </div>

                              {/* Stats Row - Improved spacing and icon alignment */}
                              <div className="flex items-center gap-4 sm:gap-5 text-xs sm:text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-4 h-4 text-blue-500" />
                                  <span>
                                    {advisor.papers_supervised} papers
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Award className="w-4 h-4 text-blue-500" />
                                  <span>
                                    {advisor.years_experience} yrs exp.
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`w-2.5 h-2.5 rounded-full ${
                                      advisor.current_capacity <
                                      advisor.max_capacity * 0.7
                                        ? "bg-green-500"
                                        : advisor.current_capacity <
                                          advisor.max_capacity
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                    }`}
                                  ></span>
                                  <span>
                                    {advisor.current_capacity}/
                                    {advisor.max_capacity}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Button Section - Modernized button */}
                            <div className="flex-shrink-0">
                              <Button
                                onClick={() => handleAssignAdvisor(advisor)}
                                disabled={
                                  advisor.current_capacity >=
                                  advisor.max_capacity
                                }
                                className={`
                          bg-gradient-to-r from-blue-600 to-indigo-600 
                          hover:from-blue-700 hover:to-indigo-700 
                          disabled:bg-gray-200 disabled:text-gray-500 
                          disabled:cursor-not-allowed text-white 
                          font-medium text-sm px-5 py-2 rounded-lg 
                          shadow-sm hover:shadow-md hover:scale-105 
                          transition-all duration-300 ease-in-out
                        `}
                              >
                                {advisor.current_capacity >=
                                advisor.max_capacity
                                  ? "Full"
                                  : "Assign"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Users className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-sm font-medium">No advisors found</p>
                      <p className="text-xs">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination - Unchanged */}
              {filteredAdvisors.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200/50 bg-gray-50/30 -mx-6 px-6 -mb-6 pb-4 rounded-b-2xl">
                  {totalAdvisorPages > 1 && (
                    <div className="flex items-center justify-between w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentAdvisorPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentAdvisorPage === 1}
                        className="border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 text-xs px-3 py-1.5 rounded-md"
                      >
                        <ChevronLeft className="w-3 h-3 mr-1" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(totalAdvisorPages, 5) },
                          (_, i) => {
                            let pageNum;
                            if (totalAdvisorPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentAdvisorPage <= 3) {
                              pageNum = i + 1;
                            } else if (
                              currentAdvisorPage >=
                              totalAdvisorPages - 2
                            ) {
                              pageNum = totalAdvisorPages - 4 + i;
                            } else {
                              pageNum = currentAdvisorPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  currentAdvisorPage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentAdvisorPage(pageNum)}
                                className={`w-8 h-8 p-0 text-xs ${
                                  currentAdvisorPage === pageNum
                                    ? "bg-blue-600 text-white"
                                    : "border-gray-300 hover:border-blue-500 hover:text-blue-600"
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentAdvisorPage((prev) =>
                            Math.min(totalAdvisorPages, prev + 1)
                          )
                        }
                        disabled={currentAdvisorPage === totalAdvisorPages}
                        className="border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 text-xs px-3 py-1.5 rounded-md"
                      >
                        Next
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Paper Detail Modal */}
        <Dialog
          open={!!selectedPaper}
          onOpenChange={() => setSelectedPaper(null)}
        >
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900 pr-8">
                {selectedPaper?.title}
              </DialogTitle>
            </DialogHeader>
           {/* hello */}
            {selectedPaper && (
              <div className="space-y-6">
                {/* Paper Thumbnail */}
                <div className="w-full">
                  <Image
                    height={200}
                    unoptimized
                    width={100}
                    src={
                      selectedPaper.thumbnail_url ||
                      "/placeholder.svg?height=300&width=600"
                    }
                    alt={selectedPaper.title}
                    className="w-full h-64 object-cover rounded-lg border border-slate-200"
                  />
                </div>

                {/* Paper Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Paper Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Category:</span>{" "}
                        {selectedPaper.category}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        {selectedPaper.status}
                      </p>
                      <p>
                        <span className="font-medium">Submitted:</span>{" "}
                        {new Date(
                          selectedPaper.submitted_at
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(
                          selectedPaper.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Author Information
                    </h3>
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={
                            selectedPaper.author.profile_picture ||
                            "/placeholder.svg?height=48&width=48"
                          }
                        />
                        <AvatarFallback>
                          {selectedPaper.author.name
                            .split(" ")
                            .map((n: any) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {selectedPaper.author.name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {selectedPaper.author.department}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{selectedPaper.author.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{selectedPaper.author.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Abstract */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Abstract
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedPaper.abstract_text}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    className="border-slate-300 bg-transparent"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => {
                      setAssigningPaper(selectedPaper);
                      setSelectedPaper(null);
                      setShowAssignModal(true);
                    }}
                    className="bg-gradient-to-r from-[#2B7FFF] to-[#3559AF] hover:from-[#2B7FFF]/90 hover:to-[#3559AF]/90 text-white"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Assign Advisor
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* User Profile Modal */}
        <Dialog
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                User Profile
              </DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage
                      src={
                        selectedUser.profile_picture ||
                        "/placeholder.svg?height=80&width=80"
                      }
                    />
                    <AvatarFallback className="text-lg">
                      {selectedUser.name
                        .split(" ")
                        .map((n: any) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedUser.name}
                    </h3>
                    <p className="text-slate-600 mb-2">
                      {selectedUser.department}
                    </p>
                    <div className="flex flex-col gap-2 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{selectedUser.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Biography
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedUser.bio}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
