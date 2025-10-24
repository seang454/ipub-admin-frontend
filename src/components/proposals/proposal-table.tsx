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
  Users,
  Download,
  Calendar,
  Tag,
  FileCheck,
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
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useGetPaperQuery } from "@/lib/api/paperSlice";
import { useGetAllAdvisorsQuery } from "@/lib/api/advisorSlice";
import { useAssignAdviserMutation } from "@/lib/api/assignMentor";
import { Paper } from "@/types/paperType/paperType";
import { User } from "@/types/userType/userType";
import { toast, ToastContainer } from "react-toastify";
import PDFViewer from "@/components/pdf/pdfView";

export function EnhancedProposals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningPaper, setAssigningPaper] = useState<Paper | null>(null);
  const [advisorSearch, setAdvisorSearch] = useState("");
  const [currentAdvisorPage, setCurrentAdvisorPage] = useState(1);
  const [currentPaperPage, setCurrentPaperPage] = useState(1);
  const [deadline, setDeadline] = useState<string>("");
  const [assignError, setAssignError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"details" | "pdf">("details");
  const advisorsPerPage = 4;
  const papersPerPage = 3;

  // Function to handle PDF download
  const handleDownloadPDF = async (fileUrl: string, fileName: string) => {
    try {
      // Show loading toast
      toast.info("Downloading PDF...", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      const response = await fetch(fileUrl, {
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "document.pdf";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success("PDF downloaded successfully!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
    } catch (error) {
      toast.warning("Could not download directly. Opening in new tab...", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      // Fallback: create a link with download attribute
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || "document.pdf";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const {
    data: papersData,
    isLoading: papersLoading,
    error: papersError,
  } = useGetPaperQuery({ token: accessToken ?? "" }, { skip: !accessToken });

  console.log("papersData :>> ", papersData);

  const {
    data: advisersData,
    isLoading: advisorsLoading,
    error: advisorsError,
  } = useGetAllAdvisorsQuery(
    { token: accessToken ?? "" },
    { skip: !accessToken }
  );

  const [assignAdviser, { isLoading: isAssigning }] =
    useAssignAdviserMutation();

  // Get unique categories from papers
  const availableCategories = Array.from(
    new Set(
      (papersData?.papers?.content || []).flatMap(
        (paper: Paper) => paper.categoryNames
      )
    )
  ).sort();

  // Filter papers that are pending and not approved
  const filteredProposals = (papersData?.papers?.content || [])
    .filter(
      (paper: Paper) =>
        (paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          paper.abstractText
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (categoryFilter === "all" ||
          paper.categoryNames.includes(categoryFilter))
    )
    .sort((a: Paper, b: Paper) => {
      if (sortBy === "date") {
        return (
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const totalPaperPages = Math.ceil(filteredProposals.length / papersPerPage);
  const paginatedProposals = filteredProposals.slice(
    (currentPaperPage - 1) * papersPerPage,
    currentPaperPage * papersPerPage
  );
  console.log("filteredProposals :>> ", filteredProposals);
  console.log("paginatedProposals :>> ", paginatedProposals);
  // Filter only active advisors
  const filteredAdvisors = (advisersData?.content || []).filter(
    (advisor: User) =>
      advisor.isAdvisor &&
      advisor.isActive &&
      (advisor.fullName.toLowerCase().includes(advisorSearch.toLowerCase()) ||
        advisor.email.toLowerCase().includes(advisorSearch.toLowerCase()))
  );

  const totalAdvisorPages = Math.ceil(
    filteredAdvisors.length / advisorsPerPage
  );
  const paginatedAdvisors = filteredAdvisors.slice(
    (currentAdvisorPage - 1) * advisorsPerPage,
    currentAdvisorPage * advisorsPerPage
  );

  const handleAssignAdvisor = async (advisor: User) => {
    if (!assigningPaper || !deadline || !accessToken) {
      setAssignError("Please select a deadline before assigning.");
      return;
    }
    console.log("datel :>> ", deadline);
    console.log("advisor :>> ", advisor);
    console.log("Papers :>> ", assigningPaper);

    try {
      await assignAdviser({
        token: accessToken,
        assignMent: {
          paperUuid: assigningPaper.uuid,
          adviserUuid: advisor.uuid,
          deadline: deadline,
        },
      }).unwrap();

      toast.success("Assigned advisor successfully!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      // Refresh students list after successful creation
      // Reset modal state
      setShowAssignModal(false);
      setAssigningPaper(null);
      setCurrentAdvisorPage(1);
      setAdvisorSearch("");
      setDeadline("");
      setAssignError("");
    } catch (error: unknown) {
      // setAssignError(
      //   error?.data?.message || "Failed to assign advisor. Please try again."
      // );
      // toast.error(assignError, {
      //   position: "top-left",
      //   autoClose: 3000,
      //   theme: "colored",
      // });
    }
  };

  if (papersLoading || advisorsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  if (papersError || advisorsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Data</p>
          <p className="text-sm">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen rounded-2xl sm:p-6 p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl py-6 border-border transition-all duration-200 font-bold text-dynamic2">
            Research Proposals
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Review and assign advisors to pending research proposals
          </p>
        </div>

        <Card className="mb-6 sm:mb-8 border-0 p-6 bg-card shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by title or keywords..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPaperPage(1);
                  }}
                  className="pl-10 focus:border-blue-500 focus:ring-blue-500 border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => {
                    setCategoryFilter(value);
                    setCurrentPaperPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-48 border-slate-300 rounded-lg">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40 border-slate-300 rounded-lg">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-muted-foreground">
            Showing{" "}
            <span className="font-semibold">{filteredProposals.length}</span>{" "}
            pending proposals
          </p>
          {totalPaperPages > 1 && (
            <p className="text-sm text-slate-500">
              Page {currentPaperPage} of {totalPaperPages}
            </p>
          )}
        </div>

        {/* papers */}

        {filteredProposals.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No Proposals Found
              </h3>
              <p className="text-slate-600">
                {searchTerm || categoryFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "There are no pending proposals at the moment"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {paginatedProposals.map((proposal: Paper) => (
              <Card
                key={proposal.uuid}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    <div className="w-full lg:w-64 flex-shrink-0">
                      <Image
                        width={256}
                        height={192}
                        unoptimized
                        src={
                          proposal.thumbnailUrl ||
                          "/placeholder.svg?height=192&width=256"
                        }
                        alt={proposal.title}
                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
                        <h3 className="text-xl sm:text-2xl font-bold text-dynamic2 leading-tight">
                          {proposal.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-700 self-start"
                        >
                          <Clock className="w-3 h-3 mr-1 text-dynamic2" />
                          {proposal.status}
                        </Badge>
                      </div>

                      <div className="text-sm text-dynamic2 mb-4 space-y-1">
                        <p>
                          <span className="font-medium text-dynamic">
                            Submitted:
                          </span>{" "}
                          {new Date(proposal.submittedAt).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium text-dynamic2">
                            Categories:
                          </span>{" "}
                          {proposal.categoryNames.join(", ")}
                        </p>
                        <p>
                          <span className="font-medium text-dynamic2">
                            Downloads:
                          </span>{" "}
                          {proposal.downloads}
                        </p>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-dynamic2 mb-2">
                          Abstract
                        </h4>
                        <p className="text-dynamic2 leading-relaxed line-clamp-3">
                          {proposal.abstractText || "No abstract provided"}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedPaper(proposal)}
                            className="border-slate-300 hover:border-blue-500 hover:text-blue-500"
                          >
                            <Eye className="w-4 h-4 mr-2 text-dynamic2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleDownloadPDF(
                                proposal.fileUrl,
                                `${proposal.title}.pdf`
                              )
                            }
                            className="border-slate-300 hover:border-slate-400"
                          >
                            <FileText className="w-4 h-4 mr-2 text-dynamic2" />
                            Download PDF
                          </Button>
                        </div>
                        <Button
                          onClick={() => {
                            setAssigningPaper(proposal);
                            setShowAssignModal(true);
                            setAssignError("");
                          }}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
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
        )}

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
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {currentPaperPage} of {totalPaperPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPaperPage((prev) =>
                    Math.min(totalPaperPages, prev + 1)
                  )
                }
                disabled={currentPaperPage === totalPaperPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <Dialog
          open={showAssignModal}
          onOpenChange={(open) => {
            setShowAssignModal(open);
            if (!open) {
              setAssignError("");
              setDeadline("");
              setAdvisorSearch("");
              setCurrentAdvisorPage(1);
            }
          }}
        >
          <DialogContent className="max-h-[90vh] flex flex-col p-0 bg-card border-border shadow-sm overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200/50 flex-shrink-0">
              <DialogTitle className="text-2xl font-bold text-blue-700">
                Assign Advisor
              </DialogTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Select an advisor for:{" "}
                <span className="font-semibold">{assigningPaper?.title}</span>
              </p>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {assignError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {assignError}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="deadline"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Review Deadline <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    id="deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full"
                    required
                  />
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search advisors by name or email..."
                    value={advisorSearch}
                    onChange={(e) => {
                      setAdvisorSearch(e.target.value);
                      setCurrentAdvisorPage(1);
                    }}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
                  {paginatedAdvisors.length > 0 ? (
                    paginatedAdvisors.map((advisor: User) => (
                      <Card
                        key={advisor.uuid}
                        className="border rounded-xl bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center gap-5">
                            <Avatar className="w-16 h-16 ring-2 ring-blue-500/30">
                              <AvatarImage
                                src={advisor.imageUrl || undefined}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-200 to-indigo-200 text-blue-700 font-semibold">
                                {advisor.firstName[0]}
                                {advisor.lastName[0]}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0 space-y-2">
                              <h4 className="font-bold text-dynamic2 text-xl truncate">
                                {advisor.fullName}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-dynamic2">
                                <Mail className="w-4 h-4 text-blue-500" />
                                <span className="truncate">
                                  {advisor.email}
                                </span>
                              </div>
                              {advisor.contactNumber &&
                                advisor.contactNumber !== "null" && (
                                  <div className="flex items-center gap-2 text-sm text-dynamic2">
                                    <Phone className="w-4 h-4 text-blue-500" />
                                    <span>{advisor.contactNumber}</span>
                                  </div>
                                )}
                            </div>

                            <Button
                              onClick={() => handleAssignAdvisor(advisor)}
                              // disabled={isAssigning || !deadline}
                              className=" bg-secondary text-dynamic2 "
                            >
                              {isAssigning ? "Assigning..." : "Assign"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                      <Users className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-sm font-medium">No advisors found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try adjusting your search
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {totalAdvisorPages > 1 && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-card">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {filteredAdvisors.length} advisor
                    {filteredAdvisors.length !== 1 ? "s" : ""} available
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentAdvisorPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentAdvisorPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-foreground">
                      {currentAdvisorPage} / {totalAdvisorPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentAdvisorPage((prev) =>
                          Math.min(totalAdvisorPages, prev + 1)
                        )
                      }
                      disabled={currentAdvisorPage === totalAdvisorPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Dialog
          open={!!selectedPaper}
          onOpenChange={() => {
            setSelectedPaper(null);
            setActiveTab("details");
          }}
        >
          <DialogContent className="w-[98vw] max-w-[1800px] h-[95vh] overflow-hidden p-0 gap-0 bg-background border border-border shadow-2xl">
            {selectedPaper && (
              <div className="flex flex-col h-full max-h-[95vh]">
                {/* Modern Header */}
                <div className="relative border-b border-border flex-shrink-0 bg-gradient-to-br from-card via-card to-muted/50">
                  <div className="px-8 py-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-1.5 bg-gradient-to-b from-secondary to-secondary-hover rounded-full" />
                          <h2 className="text-3xl font-bold text-foreground line-clamp-2">
                            {selectedPaper.title}
                          </h2>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap ml-4">
                          <Badge
                            variant="secondary"
                            className="bg-accent/15 text-accent border border-accent/30 hover:bg-accent/20"
                          >
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            {selectedPaper.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-muted/50 text-foreground border-border hover:bg-muted"
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            {selectedPaper.downloads} downloads
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden border-2 border-border shadow-lg">
                        <Image
                          height={128}
                          width={128}
                          unoptimized
                          src={selectedPaper.thumbnailUrl || "/placeholder.svg"}
                          alt={selectedPaper.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modern Tab Navigation */}
                <div className="border-b border-border bg-card flex-shrink-0">
                  <div className="flex gap-2 px-6 pt-4">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`relative flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300 ${
                        activeTab === "details"
                          ? "text-secondary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <FileCheck className="w-4 h-4" />
                      Details
                      {activeTab === "details" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary to-secondary-hover" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("pdf")}
                      className={`relative flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300 ${
                        activeTab === "pdf"
                          ? "text-secondary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      View PDF
                      {activeTab === "pdf" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary to-secondary-hover" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto min-h-0 bg-background">
                  {activeTab === "details" ? (
                    <div className="p-8 max-w-[90%] mx-auto space-y-8 pb-8">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 gap-4 lg:gap-6">
                        <Card className="group relative overflow-hidden border border-border bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-4 lg:p-5 text-center relative z-10">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2 lg:mb-3 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Download className="w-5 h-5 lg:w-6 lg:h-6 text-secondary" />
                            </div>
                            <p className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                              {selectedPaper.downloads}
                            </p>
                            <p className="text-xs lg:text-sm text-muted-foreground font-medium truncate px-1">
                              Downloads
                            </p>
                          </CardContent>
                          <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Card>

                        <Card className="group relative overflow-hidden border border-border bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-4 lg:p-5 text-center relative z-10">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2 lg:mb-3 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-accent" />
                            </div>
                            <p className="text-base lg:text-xl font-bold text-foreground mb-1">
                              {new Date(
                                selectedPaper.submittedAt
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-xs lg:text-sm text-muted-foreground font-medium truncate px-1">
                              Submitted
                            </p>
                          </CardContent>
                          <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Card>

                        <Card className="group relative overflow-hidden border border-border bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-4 lg:p-5 text-center relative z-10">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2 lg:mb-3 rounded-full bg-chart-2/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-chart-2" />
                            </div>
                            <p className="text-base lg:text-xl font-bold text-foreground mb-1">
                              {selectedPaper.isPublished ? "Yes" : "No"}
                            </p>
                            <p className="text-xs lg:text-sm text-muted-foreground font-medium truncate px-1">
                              Published
                            </p>
                          </CardContent>
                          <div className="absolute inset-0 bg-gradient-to-tr from-chart-2/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Card>

                        <Card className="group relative overflow-hidden border border-border bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-4 lg:p-5 text-center relative z-10">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2 lg:mb-3 rounded-full bg-chart-4/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Tag className="w-5 h-5 lg:w-6 lg:h-6 text-chart-4" />
                            </div>
                            <p className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                              {selectedPaper.categoryNames.length}
                            </p>
                            <p className="text-xs lg:text-sm text-muted-foreground font-medium truncate px-1">
                              Categories
                            </p>
                          </CardContent>
                          <div className="absolute inset-0 bg-gradient-to-tr from-chart-4/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Card>
                      </div>

                      {/* Categories */}
                      <Card className="border border-border bg-card hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                              <Tag className="w-5 h-5 text-secondary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">
                              Categories
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {selectedPaper.categoryNames.map(
                              (category, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="px-4 py-2 text-sm font-medium bg-secondary/5 text-secondary border-secondary/20 hover:bg-secondary/10 hover:border-secondary/30 transition-colors duration-200"
                                >
                                  {category}
                                </Badge>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Abstract */}
                      <Card className="border border-border bg-card hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-accent" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">
                              Abstract
                            </h3>
                          </div>
                          <p className="text-foreground leading-relaxed text-base">
                            {selectedPaper.abstractText ||
                              "No abstract provided"}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Timeline */}
                      <Card className="border border-border bg-card hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-chart-2" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">
                              Timeline
                            </h3>
                          </div>
                          <div className="relative space-y-6 pl-8">
                            {/* Timeline line */}
                            <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-gradient-to-b from-secondary via-accent to-chart-2" />

                            <div className="flex items-start gap-4 relative">
                              <div className="absolute -left-8 w-5 h-5 bg-secondary rounded-full border-4 border-card shadow-md" />
                              <div>
                                <p className="font-bold text-foreground text-lg">
                                  Created
                                </p>
                                <p className="text-muted-foreground mt-1">
                                  {new Date(
                                    selectedPaper.createdAt
                                  ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-4 relative">
                              <div className="absolute -left-8 w-5 h-5 bg-accent rounded-full border-4 border-card shadow-md" />
                              <div>
                                <p className="font-bold text-foreground text-lg">
                                  Submitted
                                </p>
                                <p className="text-muted-foreground mt-1">
                                  {new Date(
                                    selectedPaper.submittedAt
                                  ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>

                            {selectedPaper.publishedAt && (
                              <div className="flex items-start gap-4 relative">
                                <div className="absolute -left-8 w-5 h-5 bg-chart-2 rounded-full border-4 border-card shadow-md" />
                                <div>
                                  <p className="font-bold text-foreground text-lg">
                                    Published
                                  </p>
                                  <p className="text-muted-foreground mt-1">
                                    {new Date(
                                      selectedPaper.publishedAt
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="p-6">
                      <PDFViewer pdfUri={selectedPaper.fileUrl} />
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="border-t border-border bg-card p-5 flex gap-4 flex-shrink-0 shadow-lg">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleDownloadPDF(
                        selectedPaper.fileUrl,
                        `${selectedPaper.title}.pdf`
                      )
                    }
                    className="flex-1 h-12 font-semibold border-border hover:bg-muted hover:border-muted-foreground transition-all duration-200"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => {
                      setAssigningPaper(selectedPaper);
                      setSelectedPaper(null);
                      setShowAssignModal(true);
                      setAssignError("");
                      setActiveTab("details");
                    }}
                    variant="default"
                    className="flex-1 h-12 font-semibold bg-gradient-to-r from-secondary to-secondary-hover hover:from-secondary-hover hover:to-secondary shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <UserCheck className="w-5 h-5 mr-2" />
                    Assign Advisor
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
