/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  GraduationCap,
} from "lucide-react";

const stats = [
  { title: "Total Advisor", value: "1,234", change: "+12%", trend: "up", icon: Users, iconVar: '--primary' },
  { title: "Active Advisor", value: "1,180", change: "+8%", trend: "up", icon: UserCheck, iconVar: '--success' },
  { title: "Inactive Advisor", value: "54", change: "-4%", trend: "down", icon: UserX, iconVar: '--muted-foreground' },
  { title: "Senior Advisor", value: "892", change: "+0%", trend: "neutral", icon: GraduationCap, iconVar: '--secondary' },
];

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function AdviserStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'var(--card)',
              color: 'var(--card-foreground)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground, var(--foreground))' }}>
                  {stat.title}
                </p>
                
                <p className="text-2xl font-bold mb-2" style={{ color: 'var(--card-foreground)' }}>
                  {stat.value}
                </p>

                <div className="flex items-center gap-1">
                  {stat.trend === "up" && (
                    <TrendingUp className="w-4 h-4" style={{ color: 'var(--success, #16a34a)'}}/>
                  )}
                  {stat.trend === "down" && (
                    <TrendingDown className="w-4 h-4" style={{ color: 'var(--destructive, #ef4444)' }} />
                  )}

                  <span
                    className={cn(
                      "text-sm font-medium",
                      stat.trend === "up" && "text-[var(--success,#16a34a)]",
                      stat.trend === "down" && "text-[var(--destructive,#ef4444)]",
                      stat.trend === "neutral" && "text-[var(--muted-foreground,#6b7280)]"
                    )}
                  >
                    {stat.change}
                  </span>

                  <span className="text-xs" style={{ color: 'var(--muted-foreground,#6b7280)' }}>
                    from last month
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Icon className="w-8 h-8" style={{ color: `var(${(stat as any).iconVar || '--primary'})` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
