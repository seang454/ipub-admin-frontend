import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TopContributors() {
  const contributors = [
    { name: "Sarah Johnson", actions: 48, avatar: "/placeholder.svg?height=40&width=40" },
    { name: "Sarah Johnson", actions: 28, avatar: "/placeholder.svg?height=40&width=40" },
    { name: "Sarah Johnson", actions: 22, avatar: "/placeholder.svg?height=40&width=40" },
    { name: "Sarah Johnson", actions: 17, avatar: "/placeholder.svg?height=40&width=40" },
  ]

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">Top Contributors</h3>
        <p className="text-sm text-foreground">most active user this month</p>
      </div>

      <div className="space-y-4">
        {contributors.map((contributor, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={contributor.avatar || "/placeholder.svg"} alt={contributor.name} />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-900">{contributor.name}</span>
            </div>
            <span className="text-sm text-gray-500">{contributor.actions} actions</span>
          </div>
        ))}
      </div>
    </div>
  )
}
