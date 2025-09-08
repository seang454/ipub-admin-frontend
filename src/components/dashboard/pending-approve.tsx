import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PendingApprove() {
  return (
    <div className="bg-white rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">Pending Approve</h3>
        <p className="text-sm text-gray-500">Items requiring your attention</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">New User Registration</h4>
              <p className="text-sm text-gray-500">John Smith - Software Developer</p>
              <p className="text-xs text-gray-400">2 hours ago</p>
            </div>
          </div>
          <Button size="sm" className="text-white bg-blue-600 hover:bg-blue-700">
            Review
          </Button>
        </div>
      </div>
    </div>
  )
}
