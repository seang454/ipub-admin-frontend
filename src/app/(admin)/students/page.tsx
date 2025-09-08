import { StudentStats } from '@/components/students/student-stats'
import { StudentTable } from '@/components/students/student-table'
import React from 'react'

export default function page() {
  return (
    <div>
      <div className="p-6">
            <div>
              <h1 className="text-3xl font-semibold text-primary mb-6">Student Management</h1>
              <StudentStats />
      
              <div className="mt-6 bg-white p-6 rounded-lg">
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-2">Students</h2>
                  <p className="text-gray-600">Manage users, roles, and permissions</p>
                </div>
                <StudentTable />
              </div>
            </div>
          </div>
    </div>
  )
}
