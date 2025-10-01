'use client'

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Play, Square, Pause, Trash2, BookOpen } from "lucide-react"
import { projects, timeEntries, getProjectById } from "@/lib/data"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TodaysEntriesSheet } from "./todays-entries-sheet"
import type { Project } from "@/lib/types"

type TimerState = 'running' | 'paused' | 'stopped';

export function TimeTracker() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [timerState, setTimerState] = useState<TimerState>('stopped');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isDiscardAlertOpen, setIsDiscardAlertOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null;
  const todaysProjectTime = timeEntries
    .filter(e => e.projectId === selectedProjectId && new Date(e.startTime).toDateString() === new Date().toDateString())
    .reduce((acc, e) => acc + e.hours * 3600, 0);

  // Load from localStorage
  useEffect(() => {
    try {
      const storedState = localStorage.getItem('timerState');
      if (storedState) {
        const { projectId, startTime: storedStartTime, state, elapsedTime: storedElapsedTime } = JSON.parse(storedState);
        if (state === 'running' && projectId && storedStartTime) {
          setSelectedProjectId(projectId);
          setTimerState('running');
          setStartTime(storedStartTime);
          setElapsedTime(Math.floor((Date.now() - storedStartTime) / 1000) + storedElapsedTime);
        } else if (state === 'paused' && projectId && storedElapsedTime) {
            setSelectedProjectId(projectId);
            setTimerState('paused');
            setElapsedTime(storedElapsedTime);
        }
      }
    } catch (error) {
      console.error("Failed to parse timer state from localStorage", error);
      localStorage.removeItem('timerState');
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      if (timerState !== 'stopped') {
        const stateToStore = {
          projectId: selectedProjectId,
          startTime: startTime,
          state: timerState,
          elapsedTime: elapsedTime
        };
        localStorage.setItem('timerState', JSON.stringify(stateToStore));
      } else {
        localStorage.removeItem('timerState');
      }
    } catch (error) {
        console.error("Failed to save timer state to localStorage", error);
    }
  }, [timerState, selectedProjectId, startTime, elapsedTime]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerState === 'running') {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState]);
  
  const handleStart = () => {
      if (!selectedProjectId) return;
      if(timerState !== 'stopped') {
          // Auto-stop previous entry logic would go here
          console.log("Stopping previous timer...");
      }
      setTimerState('running');
      setStartTime(Date.now());
      setElapsedTime(0);
  };

  const handleStop = () => {
    // API call to save entry would go here
    console.log(`Saved ${formatTime(elapsedTime)} to project ${selectedProject?.name}`);
    setTimerState('stopped');
    setElapsedTime(0);
    setStartTime(null);
  };

  const handlePause = () => {
    setTimerState('paused');
    // Save partial entry logic would go here
  };
  
  const handleResume = () => {
    setTimerState('running');
    setStartTime(Date.now()); // This would be more complex if we need to keep history clean
  };

  const handleDiscard = () => {
    setIsDiscardAlertOpen(false);
    setTimerState('stopped');
    setElapsedTime(0);
    setStartTime(null);
    // API call to delete entry would go here
  };
  
  const handleProjectChange = (projectId: string) => {
      if(timerState !== 'stopped') {
          // auto-stop current timer
          handleStop();
      }
      setSelectedProjectId(projectId);
  }

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return [hours, minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':');
  };

  const formatShortTime = (timeInSeconds: number) => {
      const hours = Math.floor(timeInSeconds / 3600);
      const minutes = Math.floor((timeInSeconds % 3600) / 60);
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
  }

  const isActionable = !!selectedProjectId;
  const isRunningOrPaused = timerState === 'running' || timerState === 'paused';

  return (
    <>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-auto sm:flex-grow">
                 <Select onValueChange={handleProjectChange} value={selectedProjectId || ''} disabled={isRunningOrPaused}>
                  <SelectTrigger id="project" className="text-base">
                    <SelectValue placeholder="Select a project to start tracking" />
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
            {timerState !== 'running' ? (
                <Button 
                    onClick={handleStart} 
                    disabled={!isActionable || timerState === 'running'}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white h-10 px-6 text-base"
                >
                    <Play className="mr-2" /> Start
                </Button>
            ) : (
                <Button onClick={handleStop} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white h-10 px-6 text-base">
                    <Square className="mr-2" /> Stop
                </Button>
            )}
          </div>
          
          {timerState !== 'stopped' && (
             <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-sm">
                Keep this tab open – timer may stop if the tab is closed.
             </div>
          )}
         
          <div className="text-center my-8">
            <div className="font-mono text-7xl sm:text-8xl font-bold tracking-tighter">
              {formatTime(elapsedTime)}
            </div>
          </div>

          <div className="text-center text-muted-foreground space-y-1">
             <p>{selectedProject?.name || "No project selected"}</p>
             <p>Today's total: <span className="font-semibold">{formatShortTime(todaysProjectTime + (timerState !== 'stopped' ? elapsedTime : 0))}</span></p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            {timerState === 'running' && (
                <Button variant="ghost" size="icon" onClick={handlePause} title="Pause">
                    <Pause />
                </Button>
            )}
             {timerState === 'paused' && (
                <Button variant="ghost" size="icon" onClick={handleResume} title="Resume">
                    <Play />
                </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsDiscardAlertOpen(true)} disabled={!isRunningOrPaused} title="Discard">
                <Trash2 className="text-destructive"/>
            </Button>
            <Button variant="ghost" onClick={() => setIsSheetOpen(true)}>
                <BookOpen className="mr-2 h-4 w-4" />
                Log
            </Button>
          </div>

           {timerState === 'stopped' && elapsedTime > 0 && (
             <div className="text-sm text-muted-foreground text-center">
                 Last entry: {formatShortTime(elapsedTime)} saved to {selectedProject?.name}.
             </div>
            )}
        </CardContent>
      </Card>

      <AlertDialog open={isDiscardAlertOpen} onOpenChange={setIsDiscardAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Discard this time entry?</AlertDialogTitle>
                  <AlertDialogDescription>
                      You will lose {formatTime(elapsedTime)}. This cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDiscard} className="bg-destructive hover:bg-destructive/90">
                      Discard
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      
      <TodaysEntriesSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  )
}
