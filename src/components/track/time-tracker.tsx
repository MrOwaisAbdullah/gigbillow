'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Play, Square } from "lucide-react"
import { projects } from "@/lib/data"

export function TimeTracker() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1)
      }, 1000)
    } else if (!isRunning && elapsedTime !== 0) {
      if(interval) clearInterval(interval);
    }
    return () => {
      if(interval) clearInterval(interval);
    }
  }, [isRunning, elapsedTime])
  
  const handleToggle = () => {
    setIsRunning(!isRunning)
  }

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = timeInSeconds % 60
    return [hours, minutes, seconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':')
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select>
              <SelectTrigger id="project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" placeholder="What are you working on?" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="font-mono text-3xl font-bold tracking-tighter">
              {formatTime(elapsedTime)}
            </div>
            <Button size="icon" onClick={handleToggle} className={`w-14 h-14 rounded-full ${isRunning ? 'bg-red-500 hover:bg-red-600' : ''}`}>
              {isRunning ? <Square className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              <span className="sr-only">{isRunning ? 'Stop' : 'Start'} Timer</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
