'use client'

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Square, Pause, Trash2, BookOpen, Loader2 } from "lucide-react"
import { getProjects } from "@/lib/api/projects"
import { getTimeEntriesByProject, createTimeEntry } from "@/lib/api/time-entries"
import { useToast } from "@/hooks/use-toast"
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
import { TimeLogSheet } from "./time-log-sheet"
import type { Project, TimeEntry } from "@/lib/types"
import { SelectWithCreate } from "../select-with-create"
import { ProjectForm } from "../projects/project-form"
import { getClients } from "@/lib/api/clients"

type TimerState = 'running' | 'paused' | 'stopped';

export function TimeTracker() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [timerState, setTimerState] = useState<TimerState>('stopped');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalProjectTime, setTotalProjectTime] = useState(0);
  const [isDiscardAlertOpen, setIsDiscardAlertOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [lastSavedEntry, setLastSavedEntry] = useState<{ duration: number, projectName: string } | null>(null);
  const [isStopping, setIsStopping] = useState(false);

  const { toast } = useToast();
  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  const fetchProjects = useCallback(async () => {
      const { projects: projectsData } = await getProjects('first', null, 9999);
      const activeProjects = projectsData.filter(p => p.status === 'active');
      setProjects(activeProjects);
      return activeProjects;
  }, []);

  const fetchClients = useCallback(async () => {
    const { clients: clientsData } = await getClients('first', null, 9999);
    setClients(clientsData);
  }, []);
  
  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, [fetchProjects, fetchClients]);
  
  useEffect(() => {
    async function fetchTotalTime() {
        if(selectedProjectId) {
            const entries = await getTimeEntriesByProject(selectedProjectId);
            const totalTime = entries.reduce((acc, e) => acc + e.hours * 3600, 0);
            setTotalProjectTime(totalTime);
        } else {
            setTotalProjectTime(0);
        }
    }
    fetchTotalTime();
  }, [selectedProjectId]);

  // Load from localStorage
  useEffect(() => {
    try {
      const storedState = localStorage.getItem('timerState');
      if (storedState) {
        const { projectId, startTime: storedStartTime, state, elapsedTime: storedElapsedTime } = JSON.parse(storedState);
        if ((state === 'running' || state === 'paused') && projectId && storedElapsedTime !== undefined) {
          setSelectedProjectId(projectId);
          setTimerState(state);
          setElapsedTime(storedElapsedTime);
          if (state === 'running' && storedStartTime) {
             setElapsedTime(Math.floor((Date.now() - new Date(storedStartTime).getTime()) / 1000) + storedElapsedTime);
             setStartTime(new Date(storedStartTime));
          }
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
      
      if(isRunningOrPaused) {
          handleStop(true); // Auto-save previous entry
      }
      setTimerState('running');
      setStartTime(new Date());
      setElapsedTime(0);
      setLastSavedEntry(null);
  };

  const handleStop = async (isAutoSaving = false) => {
    if (!startTime || !selectedProject) return;
    setIsStopping(true);

    const endTime = new Date();
    const hours = elapsedTime / 3600;

    // Don't save entries that are less than a second
    if (hours <= 0) {
        if(!isAutoSaving) {
            setTimerState('stopped');
            setElapsedTime(0);
            setStartTime(null);
        }
        setIsStopping(false);
        return;
    }

    const newEntry: Omit<TimeEntry, 'id'> = {
        projectId: selectedProject.id,
        startTime,
        endTime,
        description: `Time tracked for ${selectedProject.name}`,
        hours,
    };

    try {
        await createTimeEntry(newEntry);
        if(!isAutoSaving) {
            toast({ title: "Time Saved", description: `Saved ${formatShortTime(elapsedTime)} to project ${selectedProject?.name}` });
            setLastSavedEntry({ duration: elapsedTime, projectName: selectedProject.name });
            setTotalProjectTime(prev => prev + elapsedTime);
        }
    } catch (error) {
        // API handles error toast
    } finally {
        if(!isAutoSaving) {
            setTimerState('stopped');
            setElapsedTime(0);
            setStartTime(null);
        }
        setIsStopping(false);
    }
  };

  const handlePause = () => {
    if(timerState === 'running') {
      setTimerState('paused');
      // The elapsedTime is preserved
    }
  };
  
  const handleResume = () => {
    if(timerState === 'paused') {
        setTimerState('running');
        setStartTime(new Date(Date.now() - elapsedTime * 1000)); // Adjust start time to correctly calculate total elapsed
    }
  };

  const handleDiscard = () => {
    setIsDiscardAlertOpen(false);
    setTimerState('stopped');
    setElapsedTime(0);
    setStartTime(null);
    setLastSavedEntry(null);
  };
  
  const handleProjectChange = (projectId: string) => {
      if(isRunningOrPaused) {
        toast({ title: "Timer running", description: "Stop the current timer before changing projects." });
        return;
      }
      setSelectedProjectId(projectId);
      setTimerState('stopped');
      setElapsedTime(0);
      setStartTime(null);
      setLastSavedEntry(null);
  }
  
  const handleNewProject = async () => {
    const updatedProjects = await fetchProjects();
    const newProject = updatedProjects[updatedProjects.length - 1];
    if(newProject) {
        setSelectedProjectId(newProject.id);
    }
  }

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return [hours, minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':');
  };

  const formatShortTime = (timeInSeconds: number) => {
      if (timeInSeconds < 60) return `${timeInSeconds}s`;
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
                 <SelectWithCreate
                    value={selectedProjectId || ''}
                    onValueChange={handleProjectChange}
                    items={projects.map(p => ({ value: p.id, label: p.name }))}
                    placeholder="Select a project to start tracking"
                    dialogTitle="Create New Project"
                    dialogDescription="Add a new project to start tracking time."
                    onCreated={handleNewProject}
                    disabled={isRunningOrPaused}
                 >
                    <ProjectForm clients={clients} onSuccess={() => {}} onClientCreated={fetchClients} />
                 </SelectWithCreate>
            </div>
            {timerState !== 'running' ? (
                <Button 
                    onClick={timerState === 'paused' ? handleResume : handleStart} 
                    disabled={!isActionable}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white h-10 px-6 text-base"
                >
                    <Play className="mr-2" /> {timerState === 'paused' ? 'Resume' : 'Start'}
                </Button>
            ) : (
                <Button onClick={() => handleStop()} disabled={isStopping} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white h-10 px-6 text-base">
                    {isStopping ? <Loader2 className="mr-2 animate-spin" /> : <Square className="mr-2" />}
                    Stop
                </Button>
            )}
          </div>
          
          {isRunningOrPaused && (
             <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-sm text-center">
                Keep this page open – timer might stop if you close this tab.
             </div>
          )}
         
          <div className="text-center my-8">
            <div className="font-mono text-7xl sm:text-8xl font-bold tracking-tighter">
              {formatTime(elapsedTime)}
            </div>
          </div>

          <div className="text-center text-muted-foreground space-y-1">
             <p>{selectedProject?.name || "No project selected"}</p>
             <p>Total time for this project: <span className="font-semibold">{formatShortTime(totalProjectTime + (isRunningOrPaused ? elapsedTime : 0))}</span></p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            {timerState === 'running' && (
                <Button variant="ghost" size="icon" onClick={handlePause} title="Pause">
                    <Pause />
                </Button>
            )}
             
            <Button variant="ghost" size="icon" onClick={() => setIsDiscardAlertOpen(true)} disabled={!isRunningOrPaused} title="Discard">
                <Trash2 className="text-destructive"/>
            </Button>
            <Button variant="ghost" onClick={() => setIsSheetOpen(true)}>
                <BookOpen className="mr-2 h-4 w-4" />
                History
            </Button>
          </div>

           {timerState === 'stopped' && lastSavedEntry && (
             <div className="text-sm text-muted-foreground text-center">
                 Last entry: {formatShortTime(lastSavedEntry.duration)} saved to {lastSavedEntry.projectName}.
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
      
      <TimeLogSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  )
}
