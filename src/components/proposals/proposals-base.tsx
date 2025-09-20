import { Calendar, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Proposals() {
  const proposals = [
    {
      id: 1,
      title: "Machine Learning Applications in Healthcare",
      author: "John Smith",
      submitted: "2024-01-15",
      dueDate: "2024-01-30",
      description:
        "Exploring the use of ML algorithms for medical diagnosis and treatment optimization...",
      tags: ["#BackEnd", "#Cloud Computing"],
      status: "Pending Review",
    },
    {
      id: 2,
      title: "Machine Learning Applications in Healthcare",
      author: "John Smith",
      submitted: "2024-01-15",
      dueDate: "2024-01-30",
      description:
        "Exploring the use of ML algorithms for medical diagnosis and treatment optimization...",
      tags: ["#BackEnd", "#Cloud Computing"],
      status: "Pending Review",
    },
  ];

  return (
    <div className="flex space-x-6">
      {/* Proposals */}
      <div className="space-y-6 w-auto flex-1 ">
        {proposals.map((proposal) => (
          <Card
            key={proposal.id}
            className="p-6 border-none bg-white shadow-none"
          >
            <CardContent className="p-0">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {proposal.title}
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700 hover:bg-orange-100"
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  {proposal.status}
                </Badge>
              </div>

              <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {proposal.author}
                </div>
                <div>Submitted: {proposal.submitted}</div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  due date: {proposal.dueDate}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{proposal.description}</p>
              </div>

              <div className="flex gap-2 mb-6">
                {proposal.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Assign Adviser
                  </h4>
                  <Button
                    variant="outline"
                    className="text-gray-600 bg-transparent"
                  >
                    Choose an adviser
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <Button className="text-white bg-blue-600 hover:bg-blue-700">
                  Assign Adviser
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
