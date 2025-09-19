import { PaperStats } from '@/components/papers/paper-stats'
import PaperManagement from '@/components/papers/paper-table'
import React from 'react'

export default function page() {
  return (
    <div className="p-6">
              <div>
                <h1 className="text-3xl font-semibold text-primary mb-6">Paper Management</h1>
                <PaperStats/>
                <div className="mt-6 bg-white rounded-lg p-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-primary mb-2">Papers</h2>
                    <p className="text-muted">Manage Approved, Rejected, and Submitted</p>
                  </div>
                   <PaperManagement/>
                </div>
              </div>
            </div>
  )
}
