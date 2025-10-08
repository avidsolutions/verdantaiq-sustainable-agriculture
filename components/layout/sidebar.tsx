
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  Thermometer,
  BarChart3,
  Settings,
  Bug,
  BookOpen,
  Users,
  Bell,
  Leaf,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'System overview and key metrics'
  },
  {
    title: 'Environmental',
    href: '/environmental',
    icon: Thermometer,
    description: 'Temperature, moisture, pH monitoring'
  },
  {
    title: 'Production',
    href: '/production',
    icon: BarChart3,
    description: 'Yield analytics and production metrics'
  },
  {
    title: 'Performance',
    href: '/performance',
    icon: Settings,
    description: 'System performance and maintenance'
  },
  {
    title: 'Vermiculture',
    href: '/vermiculture',
    icon: Bug,
    description: 'Worm farming system management'
  },
  {
    title: 'Training',
    href: '/training',
    icon: BookOpen,
    description: 'Documentation and training resources'
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    description: 'User management and access control'
  },
  {
    title: 'Alerts',
    href: '/alerts',
    icon: Bell,
    description: 'System alerts and notifications'
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex flex-col border-r bg-gradient-to-b from-green-50 to-blue-50 transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="text-xl font-semibold text-gray-900">Peoria</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 text-left",
                    isActive && "bg-green-600 hover:bg-green-700",
                    collapsed && "px-2"
                  )}
                >
                  <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {!collapsed && (
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs opacity-70">{item.description}</span>
                    </div>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t p-4">
          <div className="text-xs text-gray-500 text-center">
            <p>Peoria Platform</p>
            <p>v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  )
}
