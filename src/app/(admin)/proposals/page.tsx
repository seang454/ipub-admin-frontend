import { Proposals } from '@/components/proposals/proposal-table'
import React from 'react'

export default function page() {
  return (
    <div className="p-6">
                <div>
                  <div className="mb-6">
                    <h2 className="text-3xl font-semibold text-primary">Proposals Management</h2>
                    <p className="text-gray-600">Manage all proposal statments</p>
                  </div>
                  <Proposals/>
                </div>
            </div>
  )
}
