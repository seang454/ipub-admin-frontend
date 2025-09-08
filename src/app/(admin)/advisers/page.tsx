import { AdviserStats } from '@/components/advisers/adviser-stats'
import { AdviserTable } from '@/components/advisers/adviser-table'
import React from 'react'

export default function AdviserPage() {
  return (
    <div className="p-6">
          <div>
            <h1 className="text-3xl font-semibold text-primary mb-6">Adviser Management</h1>
            <AdviserStats/>
    
            <div className="mt-6 bg-white p-6 rounded-lg">
              <div >
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Advisers</h2>
                <p className="text-gray-600">Manage users, roles, and permissions</p>
              </div>
              <AdviserTable />
            </div>
          </div>
        </div>
  )
}
