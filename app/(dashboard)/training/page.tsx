
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { PlayCircle, FileText, CheckSquare, BookOpen, Clock, Award, Search } from 'lucide-react'

export default function TrainingPage() {
  const [content, setContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Mock training content data
    setContent([
      {
        id: '1',
        title: 'Vermiculture Basics',
        description: 'Introduction to vermiculture systems and worm farming',
        contentType: 'VIDEO',
        duration: 25,
        difficulty: 'Beginner',
        tags: ['vermiculture', 'basics'],
        completionRate: 85,
        isCompleted: true
      },
      {
        id: '2',
        title: 'pH Monitoring Best Practices',
        description: 'How to properly monitor and maintain pH levels',
        contentType: 'DOCUMENT',
        difficulty: 'Intermediate',
        tags: ['pH', 'monitoring'],
        completionRate: 92,
        isCompleted: false
      },
      {
        id: '3',
        title: 'System Maintenance Checklist',
        description: 'Complete checklist for system maintenance procedures',
        contentType: 'CHECKLIST',
        difficulty: 'Intermediate',
        tags: ['maintenance', 'procedures'],
        completionRate: 78,
        isCompleted: true
      },
      {
        id: '4',
        title: 'Advanced Nutrient Management',
        description: 'Advanced techniques for optimizing nutrient distribution',
        contentType: 'INTERACTIVE_MODULE',
        duration: 45,
        difficulty: 'Advanced',
        tags: ['nutrients', 'optimization'],
        completionRate: 65,
        isCompleted: false
      },
      {
        id: '5',
        title: 'Emergency Procedures',
        description: 'What to do in case of system emergencies',
        contentType: 'PROCEDURE',
        difficulty: 'Intermediate',
        tags: ['emergency', 'safety'],
        completionRate: 88,
        isCompleted: false
      }
    ])
    setIsLoading(false)
  }, [])

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <PlayCircle className="h-5 w-5 text-blue-600" />
      case 'DOCUMENT':
        return <FileText className="h-5 w-5 text-green-600" />
      case 'CHECKLIST':
        return <CheckSquare className="h-5 w-5 text-purple-600" />
      case 'INTERACTIVE_MODULE':
        return <BookOpen className="h-5 w-5 text-orange-600" />
      case 'PROCEDURE':
        return <FileText className="h-5 w-5 text-red-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'Advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const completedCount = content.filter(item => item.isCompleted).length
  const totalCount = content.length
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Training & Documentation</h1>
        <p className="text-gray-600">Educational resources and training materials</p>
      </div>

      {/* Progress overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.toFixed(0)}%</div>
            <Progress value={overallProgress} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedCount} of {totalCount} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Training materials available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content.reduce((sum, item) => sum + (item.duration || 10), 0)} min
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total estimated time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Training Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search training materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="interactive">Interactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContent.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getContentIcon(item.contentType)}
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                            {item.difficulty}
                          </Badge>
                          {item.duration && (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {item.duration} min
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {item.isCompleted && (
                      <Badge className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Completion Rate</span>
                        <span>{item.completionRate}%</span>
                      </div>
                      <Progress value={item.completionRate} className="h-1" />
                    </div>

                    <Button 
                      className="w-full" 
                      variant={item.isCompleted ? "outline" : "default"}
                    >
                      {item.isCompleted ? "Review" : "Start"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContent
              .filter(item => item.contentType === 'VIDEO')
              .map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <PlayCircle className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                          {item.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.duration} min
                        </Badge>
                      </div>
                      <Button className="w-full">
                        {item.isCompleted ? "Watch Again" : "Watch Now"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContent
              .filter(item => ['DOCUMENT', 'CHECKLIST', 'PROCEDURE'].includes(item.contentType))
              .map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      {getContentIcon(item.contentType)}
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                        {item.difficulty}
                      </Badge>
                      <Button className="w-full">
                        {item.isCompleted ? "Read Again" : "Read Now"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="interactive" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContent
              .filter(item => item.contentType === 'INTERACTIVE_MODULE')
              .map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-orange-600" />
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                          {item.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.duration} min
                        </Badge>
                      </div>
                      <Button className="w-full">
                        {item.isCompleted ? "Practice Again" : "Start Module"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
