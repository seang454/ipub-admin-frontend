"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Users } from "lucide-react"

const papers = [
	{
		id: 1,
		title: "Machine Learning Applications",
		author: "Alice Cooper",
		status: "Submitted",
		statusColor: "bg-primary",
		file: "ml_applications_research.pdf",
		size: "2.0 MB",
		date: "2024-01-15",
	},
	{
		id: 2,
		title: "Machine Learning Applications",
		author: "Alice Cooper",
		status: "Under Review",
		statusColor: "bg-orange-500",
		file: "ml_applications_research.pdf",
		size: "2.0 MB",
		date: "2024-01-12",
	},
	{
		id: 3,
		title: "Machine Learning Applications",
		author: "Alice Cooper",
		status: "Approved",
		statusColor: "bg-green-500",
		file: "ml_applications_research.pdf",
		size: "2.0 MB",
		date: "2024-01-23",
	},
	{
		id: 4,
		title: "Machine Learning Applications",
		author: "Alice Cooper",
		status: "Draft",
		statusColor: "bg-muted-foreground",
		file: "ml_applications_research.pdf",
		size: "2.0 MB",
		date: "2024-01-15",
	},
]

export function PaperTable() {
	const [searchTerm, setSearchTerm] = useState("")

	// Filter papers based on search term
	const filteredPapers = papers.filter((paper) => {
		const searchString = searchTerm.toLowerCase()
		return (
			paper.title.toLowerCase().includes(searchString) ||
			paper.author.toLowerCase().includes(searchString) ||
			paper.status.toLowerCase().includes(searchString) ||
			paper.file.toLowerCase().includes(searchString)
		)
	})

	return (
		<div className="bg-card rounded-lg">
			<div className="py-6 border-b border-gray-200">
				<div className="flex items-center justify-between gap-4">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
						<Input
							placeholder="Search Paper..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-border">
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">Paper Details</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">File Info</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">Submission</th>
							<th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
						</tr>
					</thead>
					<tbody>
						{filteredPapers.map((paper) => (
							<tr key={paper.id} className="border-b border-border hover:bg-muted/50">
								<td className="py-4 px-4">
									<div>
										<div className="font-medium text-card-foreground">{paper.title}</div>
										<div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
											<Users className="w-3 h-3" />
											{paper.author}
										</div>
									</div>
								</td>
								<td className="py-4 px-4">
									<Badge className={`${paper.statusColor} text-white border-0`}>{paper.status}</Badge>
								</td>
								<td className="py-4 px-4">
									<div>
										<div className="text-sm text-card-foreground">{paper.file}</div>
										<div className="text-sm text-muted-foreground">{paper.size}</div>
									</div>
								</td>
								<td className="py-4 px-4">
									<div className="text-sm text-muted-foreground">{paper.date}</div>
								</td>
								<td className="py-4 px-4">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreHorizontal className="w-4 h-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem>View Details</DropdownMenuItem>
											<DropdownMenuItem>Download</DropdownMenuItem>
											<DropdownMenuItem>Edit Status</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
