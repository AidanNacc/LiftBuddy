"use client";

import React, { useState, useEffect } from 'react';
import GoalSetter from './components/GoalSetter';
import CalendarView from './components/CalendarView';
import { Dumbbell, Calendar, Utensils, Plus, Trash2, TrendingUp, Award, Flame, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import "./page.css";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface WorkoutLog {
  date: string;
  templateId: string;
  templateName: string;
  exercises: Exercise[];
}

interface DietEntry {
  id: string;
  date: string;
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  suggested?: boolean;
  image?: string; // optional data URL or public path
}

const LiftBuddyLogo = () => (
  <div className="flex items-center gap-3">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl blur-lg opacity-60"></div>
      <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform rotate-6 hover:rotate-12 transition-transform">
        <Dumbbell className="w-8 h-8 text-white transform -rotate-6" strokeWidth={2.5} />
      </div>
    </div>
    <div>
      <h1 className="text-3xl font-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LiftBuddy</h1>
      <p className="text-sm text-gray-500 font-medium">Your Fitness Companion</p>
    </div>
  </div>
);

export default function LiftBuddy() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workouts' | 'diet' | 'calendar' | 'goals'>('dashboard');
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [showNewDiet, setShowNewDiet] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [roadmapEvents, setRoadmapEvents] = useState<any[]>([]);
  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [roadmapGoal, setRoadmapGoal] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDietFormForDate, setShowDietFormForDate] = useState<string | null>(null);
  const [dietForm, setDietForm] = useState({ meal: '', calories: '', protein: '', carbs: '', fats: '' });
  const [workoutLogDate, setWorkoutLogDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const templatesResult = await localStorage.getItem('workout-templates');
      const logsResult = await localStorage.getItem('workout-logs');
      const dietResult = await localStorage.getItem('diet-entries');

      if (templatesResult) {
        setWorkoutTemplates(JSON.parse(templatesResult));
      }
      if (logsResult) {
        setWorkoutLogs(JSON.parse(logsResult));
      }
      if (dietResult) {
        setDietEntries(JSON.parse(dietResult));
      }
      const roadmapResult = await localStorage.getItem('roadmap-events');
      if (roadmapResult) setRoadmapEvents(JSON.parse(roadmapResult));
      const goalResult = await localStorage.getItem('roadmap-goal');
      if (goalResult) setRoadmapGoal(JSON.parse(goalResult));
    } catch (error) {
      console.log('No existing data found');
    }
  };

  const saveData = async () => {
    try {
      await localStorage.setItem('workout-templates', JSON.stringify(workoutTemplates));
      await localStorage.setItem('workout-logs', JSON.stringify(workoutLogs));
      await localStorage.setItem('diet-entries', JSON.stringify(dietEntries));
      await localStorage.setItem('roadmap-events', JSON.stringify(roadmapEvents));
      await localStorage.setItem('roadmap-goal', JSON.stringify(roadmapGoal));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  useEffect(() => {
    saveData();
  }, [workoutTemplates, workoutLogs, dietEntries]);

  useEffect(() => {
    // persist roadmap events when changed
    try { localStorage.setItem('roadmap-events', JSON.stringify(roadmapEvents)); } catch (e) {}
  }, [roadmapEvents]);

  useEffect(() => {
    try { localStorage.setItem('roadmap-goal', JSON.stringify(roadmapGoal)); } catch (e) {}
  }, [roadmapGoal]);

  const addWorkoutTemplate = (name: string) => {
    const newTemplate: WorkoutTemplate = {
      id: Date.now().toString(),
      name,
      exercises: []
    };
    setWorkoutTemplates([...workoutTemplates, newTemplate]);
    setSelectedTemplate(newTemplate);
    setShowNewTemplate(false);
  };

  const addExerciseToTemplate = (templateId: string, exercise: Exercise) => {
    setWorkoutTemplates(templates =>
      templates.map(t =>
        t.id === templateId
          ? { ...t, exercises: [...t.exercises, exercise] }
          : t
      )
    );
  };

  const deleteExercise = (templateId: string, exerciseId: string) => {
    setWorkoutTemplates(templates =>
      templates.map(t =>
        t.id === templateId
          ? { ...t, exercises: t.exercises.filter(e => e.id !== exerciseId) }
          : t
      )
    );
  };

  const deleteTemplate = (templateId: string) => {
    setWorkoutTemplates(templates => templates.filter(t => t.id !== templateId));
  };

  const logWorkout = (date: string, template: WorkoutTemplate) => {
    const log: WorkoutLog = {
      date,
      templateId: template.id,
      templateName: template.name,
      exercises: template.exercises
    };
    setWorkoutLogs([...workoutLogs, log]);

    // Also add to calendar events
    setRoadmapEvents(events => [
      ...events,
      {
        type: 'workout',
        date,
        title: template.name,
        note: `${template.exercises.length} exercises`
      }
    ]);
    
    // Trigger celebration animation
    const messages = [
      'Beast Mode Activated!',
      'Crushing It!',
      'Unstoppable!',
      'Workout Complete!',
      'Keep It Up!',
      'You\'re On Fire!',
      'Amazing Work!'
    ];
    setCelebrationMessage(messages[Math.floor(Math.random() * messages.length)]);
    setShowCelebration(true);
    
    setTimeout(() => {
      setShowCelebration(false);
    }, 3000);
    // Generate diet suggestions for this workout
    try {
      generateDietForWorkout(log);
    } catch (e) {
      console.error('Failed to generate diet for workout', e);
    }
  };

  // Create simple diet recommendations based on workout volume
  const generateDietForWorkout = (log: WorkoutLog) => {
    // Estimate workload: sum(sets * reps * weight)
    const totalVolume = log.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps * (ex.weight || 0)), 0);

    // Heuristic: calories burned ~ totalVolume * 0.12 (tunable)
    const caloriesBurned = Math.round(totalVolume * 0.12);

    // Base daily calories (simple default). You can later extend this to use user profile.
    const baseCalories = 2000;

    // Recommend extra calories to refuel + small surplus for recovery
    const recommendedTotal = baseCalories + caloriesBurned + 200;

    // Split into 3 meals
    const breakfastCal = Math.round(recommendedTotal * 0.25);
    const lunchCal = Math.round(recommendedTotal * 0.35);
    const dinnerCal = recommendedTotal - breakfastCal - lunchCal;

    const caloriesToMacros = (cals: number) => {
      // Simple macro split: 30% protein, 45% carbs, 25% fats
      const proteinCals = cals * 0.30;
      const carbsCals = cals * 0.45;
      const fatsCals = cals * 0.25;

      return {
        protein: Math.round(proteinCals / 4),
        carbs: Math.round(carbsCals / 4),
        fats: Math.round(fatsCals / 9),
      };
    };

    const today = log.date;
    const now = Date.now();
    const suggestions: DietEntry[] = [
      {
        id: `${now}-b`,
        date: today,
        meal: `Breakfast (Post-workout suggestion)`,
        calories: breakfastCal,
        ...caloriesToMacros(breakfastCal),
        suggested: true,
      },
      {
        id: `${now}-l`,
        date: today,
        meal: `Lunch (Recovery)`,
        calories: lunchCal,
        ...caloriesToMacros(lunchCal),
        suggested: true,
      },
      {
        id: `${now}-d`,
        date: today,
        meal: `Dinner (Carb+Protein)`,
        calories: dinnerCal,
        ...caloriesToMacros(dinnerCal),
        suggested: true,
      }
    ];

    // Append suggestions to diet entries (avoid duplicating suggestions for same workout/date)
    setDietEntries(prev => {
      const existingSuggestedForDate = prev.filter(e => e.date === today && e.suggested);
      if (existingSuggestedForDate.length > 0) {
        // If suggestions already exist for this date, replace them
        const nonSuggested = prev.filter(e => !(e.date === today && e.suggested));
        return [...nonSuggested, ...suggestions];
      }
      return [...prev, ...suggestions];
    });

    // Switch user to diet tab to view suggestions
    setActiveTab('diet');
  };

  const addDietEntry = (entry: DietEntry) => {
    setDietEntries([...dietEntries, entry]);
    // Also add to calendar events
    setRoadmapEvents(events => [
      ...events,
      {
        type: 'diet',
        date: entry.date,
        title: entry.meal,
        caloriesTarget: entry.calories,
        note: `P:${entry.protein} C:${entry.carbs} F:${entry.fats}`
      }
    ]);
    setShowNewDiet(false);
  };

  const deleteDietEntry = (entryId: string) => {
    setDietEntries(entries => entries.filter(e => e.id !== entryId));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isWorkoutDay = (date: string) => {
    return workoutLogs.some(log => log.date === date);
  };

  const getWorkoutStreak = () => {
    if (workoutLogs.length === 0) return 0;
    
    const sortedLogs = [...workoutLogs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate = logDate;
      } else if (diffDays > streak) {
        break;
      }
    }
    
    return streak;
  };

  const getTotalCaloriesToday = () => {
    const today = formatDate(new Date());
    return dietEntries
      .filter(entry => entry.date === today)
      .reduce((sum, entry) => sum + entry.calories, 0);
  };

  const renderDashboard = () => {
    const streak = getWorkoutStreak();
    const todayCalories = getTotalCaloriesToday();
    const recentWorkouts = workoutLogs.slice(-3).reverse();

    const renderGoalCard = () => {
      if (!roadmapGoal) return null;
      const { startWeight, targetWeight, targetDate, activityLevel } = roadmapGoal;
      const today = new Date();
      const end = new Date(targetDate);
      const daysLeft = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      const totalToChange = Math.abs(targetWeight - startWeight) || 1;

      return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Goal</h3>
              <p className="text-sm text-gray-500">Target: <span className="font-semibold text-gray-800">{targetWeight} lbs</span> by <span className="font-semibold">{new Date(targetDate).toLocaleDateString()}</span></p>
              <p className="text-sm text-gray-500 mt-2">Start: <span className="font-semibold text-gray-800">{startWeight} lbs</span> · Activity: <span className="font-semibold">{activityLevel}</span></p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-gray-800">{daysLeft}</p>
              <p className="text-sm text-gray-500">days left</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => setShowGoalSetter(true)} className="px-4 py-2 rounded-md bg-blue-600 text-white">Edit Goal</button>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="group relative overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <Flame className="w-10 h-10 mb-3 opacity-90" strokeWidth={2} />
            <h3 className="text-4xl font-black mb-1">{streak}</h3>
            <p className="text-orange-100 font-medium">Day Streak 🔥</p>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <Dumbbell className="w-10 h-10 mb-3 opacity-90" strokeWidth={2} />
            <h3 className="text-4xl font-black mb-1">{workoutLogs.length}</h3>
            <p className="text-blue-100 font-medium">Total Workouts</p>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <Utensils className="w-10 h-10 mb-3 opacity-90" strokeWidth={2} />
            <h3 className="text-4xl font-black mb-1">{todayCalories}</h3>
            <p className="text-green-100 font-medium">Calories Today</p>
          </div>
        </div>

        {/* Quick Actions */}
        {renderGoalCard()}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="mb-2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('workouts')}
              title="Create and log workouts"
              className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-extrabold hover:shadow-xl transition-all hover:scale-105 overflow-hidden w-full"
            >
              <span className="relative z-10 text-white font-extrabold">Start Workout</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button
              onClick={() => setActiveTab('diet')}
              title="Add meal entry"
              className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-extrabold hover:shadow-xl transition-all hover:scale-105 overflow-hidden w-full"
            >
              <span className="relative z-10 text-white font-extrabold">Log Meal</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button
              onClick={() => setShowGoalSetter(true)}
              title="Plan a goal and roadmap"
              className="group relative bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-extrabold hover:shadow-xl transition-all hover:scale-105 overflow-hidden w-full"
            >
              <span className="relative z-10 text-white font-extrabold">Goal Setter</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Recent Workouts
          </h2>
          {recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {recentWorkouts.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{log.templateName}</p>
                      <p className="text-sm text-gray-500">{log.exercises.length} exercises</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-600">{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No workouts yet. Let's get started!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWorkouts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          <Dumbbell className="w-7 h-7 text-blue-500" />
          Workout Templates
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Log date:</label>
            <input
              type="date"
              value={workoutLogDate}
              onChange={(e) => setWorkoutLogDate(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-xl text-black"
            />
          </div>
        <button
          onClick={() => setShowNewTemplate(true)}
          title="Create a new workout template"
          className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-xl transition-all hover:scale-105 font-semibold overflow-hidden"
        >
          <Plus className="w-5 h-5 relative z-10" />
          <span className="relative z-10">New Template</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
        </div>
      </div>

      {showNewTemplate && (
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 animate-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Create New Template</h3>
            <button onClick={() => setShowNewTemplate(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Template name (e.g., Push Day, Leg Day)"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:border-blue-500 focus:outline-none transition-colors"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                addWorkoutTemplate(e.currentTarget.value);
              }
            }}
          />
        </div>
      )}

      {workoutTemplates.length === 0 && !showNewTemplate && (
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
          <Dumbbell className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Templates Yet</h3>
          <p className="text-gray-500 mb-6">Create your first workout template to get started!</p>
          <button
            onClick={() => setShowNewTemplate(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Create Template
          </button>
        </div>
      )}

      {workoutTemplates.map(template => (
        <div key={template.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-black text-gray-800">{template.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{template.exercises.length} exercises</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const dateToLog = workoutLogDate || formatDate(new Date());
                  logWorkout(dateToLog, template);
                }}
                title="Mark this workout as complete"
                className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all hover:scale-105 font-semibold flex items-center gap-2 overflow-hidden"
              >
                <Check className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Complete</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <button
                onClick={() => deleteTemplate(template.id)}
                title="Delete this template"
                className="group text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all hover:scale-110"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {template.exercises.length > 0 && (
            <div className="space-y-2 mb-4">
              {template.exercises.map((exercise, idx) => (
                <div key={exercise.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{exercise.name}</p>
                      <p className="text-sm text-gray-500 font-medium">
                        {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight} lbs
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteExercise(template.id, exercise.id)}
                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <AddExerciseForm
            onAdd={(exercise) => addExerciseToTemplate(template.id, exercise)}
          />
        </div>
      ))}
    </div>
  );

  const renderDiet = () => {
    const today = formatDate(new Date());
    const todayEntries = dietEntries.filter(e => e.date === today);
    const todayTotals = todayEntries.reduce((acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fats: acc.fats + entry.fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Utensils className="w-7 h-7 text-green-500" />
            Diet Tracking
          </h2>
          <button
            onClick={() => setShowNewDiet(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all hover:scale-105 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Meal
          </button>
        </div>

        {/* Today's Summary */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-black shadow-xl">
          <h3 className="text-lg font-bold mb-4 opacity-90">Today's Nutrition</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur">
              <p className="text-3xl font-black">{todayTotals.calories}</p>
              <p className="text-sm opacity-90 font-medium">Calories</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur">
              <p className="text-3xl font-black">{todayTotals.protein}g</p>
              <p className="text-sm opacity-90 font-medium">Protein</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur">
              <p className="text-3xl font-black">{todayTotals.carbs}g</p>
              <p className="text-sm opacity-90 font-medium">Carbs</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur">
              <p className="text-3xl font-black">{todayTotals.fats}g</p>
              <p className="text-sm opacity-90 font-medium">Fats</p>
            </div>
          </div>
        </div>

        {showNewDiet && (
          <AddDietForm
            onAdd={addDietEntry}
            onCancel={() => setShowNewDiet(false)}
          />
        )}

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Meal History</h3>
          {dietEntries.length > 0 ? (
            <div className="space-y-3">
              {dietEntries.slice().reverse().map(entry => (
                <div key={entry.id} className="group p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-green-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                          <div className="flex items-center gap-2">
                            {entry.image && (
                              <img src={entry.image} alt={entry.meal} className="w-12 h-10 object-cover rounded-lg mr-2" />
                            )}
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-800 text-lg">{entry.meal}</p>
                              {entry.suggested && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">Suggested</span>
                              )}
                            </div>
                          </div>
                      <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-2xl font-black text-green-600">{entry.calories}</p>
                      <button
                        onClick={() => deleteDietEntry(entry.id)}
                        title="Delete this meal"
                        className="group text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold">P: {entry.protein}g</span>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-semibold">C: {entry.carbs}g</span>
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg font-semibold">F: {entry.fats}g</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No meals logged yet</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGoals = () => {
    if (!roadmapGoal) {
      return (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
          <h2 className="text-2xl font-bold mb-3">No Goals Yet</h2>
          <p className="text-gray-600 mb-4">Create a goal to generate a workout and diet roadmap.</p>
          <div className="flex justify-center">
            <button onClick={() => setShowGoalSetter(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Create Goal</button>
          </div>
        </div>
      );
    }

    // show the saved goal and a summary of planned templates and diet
    const { startWeight, targetWeight, targetDate, activityLevel } = roadmapGoal;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Current Goal</h3>
              <p className="text-sm text-gray-600">Start: <span className="font-semibold text-gray-800">{startWeight} lbs</span> → Target: <span className="font-semibold text-gray-800">{targetWeight} lbs</span> by {new Date(targetDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 mt-2">Activity: <span className="font-semibold">{activityLevel}</span></p>
            </div>
            <div>
              <button onClick={() => setShowGoalSetter(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Edit Goal</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold mb-3">Planned Workouts</h3>
          {roadmapEvents.filter(e => e.type === 'workout').length === 0 ? (
            <p className="text-gray-600">No planned workouts.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roadmapEvents.filter(e => e.type === 'workout').slice(0, 12).map((e, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="font-bold text-gray-800">{e.title}</p>
                  <p className="text-sm text-gray-600">{e.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold mb-3">Planned Diet (sample)</h3>
          {dietEntries.length === 0 ? (
            <p className="text-gray-600">No planned meals.</p>
          ) : (
            <div className="space-y-2">
              {dietEntries.slice(0, 12).map(de => (
                <div key={de.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">{de.meal}</p>
                    <p className="text-sm text-gray-600">{de.date} · {de.calories} kcal · P:{de.protein}g C:{de.carbs}g F:{de.fats}g</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              title="Previous month"
              className="group p-3 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-gray-800" />
            </button>
            <h2 className="text-2xl font-black text-gray-800">{monthName}</h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              title="Next month"
              className="group p-3 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-gray-800" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-3 mb-3">
            {days.map(day => (
              <div key={day} className="text-center font-bold text-gray-600 text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
              const hasWorkout = isWorkoutDay(date);
              const isToday = date === formatDate(new Date());

              return (
                <div
                  key={day}
                  title={hasWorkout ? `Workout completed on ${date}` : isToday ? 'Today' : ''}
                  onClick={() => setSelectedCalendarDate(date)}
                  className={`aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer
                    ${hasWorkout 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105 hover:scale-110 hover:shadow-xl' 
                      : isToday
                      ? 'bg-gray-200 text-gray-800 ring-2 ring-blue-500 hover:scale-105'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-105'
                    }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Selected day details */}
        <div className="mt-4">
          {selectedCalendarDate ? (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Workouts on {new Date(selectedCalendarDate).toLocaleDateString()}</h3>
                <button onClick={() => setSelectedCalendarDate(null)} className="text-gray-500 hover:text-gray-700">Close</button>
              </div>
              {workoutLogs.filter(l => l.date === selectedCalendarDate).length > 0 ? (
                <div className="space-y-3">
                  {workoutLogs.filter(l => l.date === selectedCalendarDate).map((log, idx) => (
                    <div key={idx} className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">{log.templateName}</p>
                        <p className="text-sm text-gray-500">{log.exercises.length} exercises</p>
                      </div>
                      <div className="text-sm text-gray-600">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No workouts recorded on this day.</div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                <p className="text-gray-700 font-medium">Click a day to view recorded workouts</p>
              </div>
            </div>
          )}
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
            <p className="text-gray-700 font-medium">Workout completed</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black bg-opacity-30 animate-fade-in"></div>
          <div className="relative z-10 animate-bounce-in">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-12 py-8 rounded-3xl shadow-2xl transform scale-110">
              <div className="text-6xl font-black text-center mb-4 animate-pulse">
                {celebrationMessage}
              </div>
              <div className="flex justify-center gap-4 text-5xl animate-bounce">
                🎉 🎊 🏆 🎉 🎊
              </div>
            </div>
          </div>
          {/* Confetti effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                {['🎉', '🎊', '⭐', '✨', '💪', '🔥'][Math.floor(Math.random() * 6)]}
              </div>
            ))}
          </div>
        </div>
      )}

      {showGoalSetter && (
          <GoalSetter
            onGenerate={(result, goal) => {
              const events = result?.events || [];
              const templates = result?.templates || [];
              const dietPlans = result?.dietEntries || [];
              setRoadmapEvents(events);
              setRoadmapGoal(goal);
              setWorkoutTemplates(prev => {
                const existing = new Set(prev.map(t => t.id));
                const incoming = templates.filter((t: any) => !existing.has(t.id));
                return [...prev, ...incoming];
              });
              setDietEntries(prev => {
                const existing = new Set(prev.map(d => d.id));
                const incoming = dietPlans.filter((d: any) => !existing.has(d.id));
                return [...prev, ...incoming];
              });
              setActiveTab('calendar');
            }}
            onClose={() => setShowGoalSetter(false)}
          />
      )}

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setSelectedDate(null)} />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{new Date(selectedDate).toLocaleDateString()}</h3>
              <button onClick={() => setSelectedDate(null)} className="text-gray-500">Close</button>
            </div>
            <div className="space-y-4">
              {roadmapEvents.filter(ev => ev.date === selectedDate).length === 0 && (
                <p className="text-gray-600">No planned events for this day.</p>
              )}
              {roadmapEvents.filter(ev => ev.date === selectedDate).map((ev, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">{ev.title}</p>
                      {ev.caloriesTarget && <p className="text-sm text-gray-600">Calories target: {ev.caloriesTarget}</p>}
                      {ev.note && <p className="text-sm text-gray-600">{ev.note}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      {ev.type === 'workout' && (
                        <button onClick={() => {
                          const log = { date: selectedDate, templateId: 'roadmap-' + Date.now().toString(), templateName: ev.title, exercises: [] };
                          setWorkoutLogs(logs => [...logs, log]);
                          setCelebrationMessage('🏆 Roadmap workout logged!');
                          setShowCelebration(true);
                          setTimeout(() => setShowCelebration(false), 2500);
                        }} className="px-3 py-2 bg-blue-600 text-white rounded-md">Mark Done</button>
                      )}
                      {ev.type === 'diet' && (
                        <button onClick={() => setShowDietFormForDate(selectedDate)} className="px-3 py-2 bg-green-600 text-white rounded-md">Add Meal</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {showDietFormForDate === selectedDate && (
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold mb-2">Add Meal for {new Date(selectedDate).toLocaleDateString()}</h4>
                  <input className="w-full mb-2 p-2 border rounded" placeholder="Meal name" value={dietForm.meal} onChange={e => setDietForm(s => ({...s, meal: e.target.value}))} />
                  <input className="w-full mb-2 p-2 border rounded" placeholder="Calories" value={dietForm.calories} onChange={e => setDietForm(s => ({...s, calories: e.target.value}))} />
                  <div className="flex gap-2">
                    <input className="flex-1 p-2 border rounded" placeholder="Protein (g)" value={dietForm.protein} onChange={e => setDietForm(s => ({...s, protein: e.target.value}))} />
                    <input className="flex-1 p-2 border rounded" placeholder="Carbs (g)" value={dietForm.carbs} onChange={e => setDietForm(s => ({...s, carbs: e.target.value}))} />
                    <input className="flex-1 p-2 border rounded" placeholder="Fats (g)" value={dietForm.fats} onChange={e => setDietForm(s => ({...s, fats: e.target.value}))} />
                  </div>
                  <div className="mt-3 flex gap-2 justify-end">
                    <button onClick={() => setShowDietFormForDate(null)} className="px-3 py-2 border rounded">Cancel</button>
                    <button onClick={() => {
                      if (!dietForm.meal || !dietForm.calories) return;
                      const entry = { id: Date.now().toString(), date: selectedDate, meal: dietForm.meal, calories: parseInt(dietForm.calories) || 0, protein: parseInt(dietForm.protein) || 0, carbs: parseInt(dietForm.carbs) || 0, fats: parseInt(dietForm.fats) || 0 };
                      setDietEntries(entries => [...entries, entry]);
                      setDietForm({ meal: '', calories: '', protein: '', carbs: '', fats: '' });
                      setShowDietFormForDate(null);
                    }} className="px-3 py-2 bg-green-600 text-white rounded-md">Save Meal</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mx-6">

          <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
          {[
            { id: 'dashboard', icon: TrendingUp, label: 'Dashboard', gradient: 'from-purple-500 to-pink-500', tooltip: 'View your progress' },
            { id: 'workouts', icon: Dumbbell, label: 'Workouts', gradient: 'from-blue-500 to-indigo-600', tooltip: 'Manage workout templates' },
            { id: 'diet', icon: Utensils, label: 'Diet', gradient: 'from-green-500 to-emerald-600', tooltip: 'Track your nutrition' },
            { id: 'calendar', icon: Calendar, label: 'Calendar', gradient: 'from-orange-500 to-red-500', tooltip: 'View workout history' },
            { id: 'goals', icon: Award, label: 'Goals', gradient: 'from-teal-500 to-cyan-600', tooltip: 'Manage goals and plans' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              title={tab.tooltip}
              className={`relative group flex items-center justify-center gap-2 w-full px-4 md:px-6 py-3 md:py-4 rounded-xl font-extrabold transition-all text-center
                ${activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                  : 'bg-white text-black hover:bg-gray-50 shadow-sm hover:shadow-md hover:scale-105'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-extrabold">{tab.label}</span>
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {tab.tooltip}
              </span>
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'workouts' && renderWorkouts()}
        {activeTab === 'diet' && renderDiet()}
        {activeTab === 'calendar' && (
            <CalendarView
              events={[...roadmapEvents]}
              currentDate={currentDate}
              selectedDate={selectedDate}
              onMonthChange={(d: Date) => setCurrentDate(d)}
              onDayClick={(iso: string) => setSelectedDate(iso)}
            />
          )}
        {activeTab === 'goals' && renderGoals()}
        </div>
      </div>
    </div>
  );
}

function AddExerciseForm({ onAdd }: { onAdd: (exercise: Exercise) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = () => {
    if (name) {
      onAdd({
        id: Date.now().toString(),
        name,
        sets: parseInt(sets) || 3,
        reps: parseInt(reps) || 10,
        weight: parseFloat(weight) || 0
      });
      setName('');
      setSets('');
      setReps('');
      setWeight('');
      setShowForm(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        title="Add a new exercise to this template"
        className="w-full mt-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all font-semibold hover:scale-105"
      >
        + Add Exercise
      </button>
    );
  }

  return (
    <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-gray-800">New Exercise</h4>
        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Exercise name (e.g., Bench Press)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors font-medium text-black"
      />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Sets</label>
          <input
            type="number"
            placeholder="3"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            min="1"
            step="1"
            className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-center font-bold text-black"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Reps</label>
          <input
            type="number"
            placeholder="10"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            min="1"
            step="1"
            className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-center font-bold text-black"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Weight (lbs)</label>
          <input
            type="number"
            placeholder="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            min="0"
            step="0.5"
            className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-center font-bold text-black"
          />
        </div>
      </div>
      <button
        onClick={handleSubmit}
        title="Add this exercise"
        className="group relative w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl hover:shadow-xl transition-all font-bold overflow-hidden hover:scale-105"
      >
        <span className="relative z-10">Add Exercise</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>
    </div>
  );
}

function AddDietForm({ onAdd, onCancel }: { onAdd: (entry: DietEntry) => void; onCancel: () => void }) {
  const [meal, setMeal] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleSubmit = () => {
    if (meal && calories) {
      onAdd({
        id: Date.now().toString(),
        date,
        meal,
        calories: parseInt(calories),
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fats: parseInt(fats) || 0,
        image: imagePreview || undefined
      });

      // Also add to calendar events
      try {
        // use parent setter via closure not available here; dispatch through localStorage pattern by lifting state? Instead rely on parent effect with dietEntries; parent calendar uses roadmapEvents only.
      } catch {}
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Add Diet Entry</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-600 mb-1 block">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors font-medium text-black"
        />
      </div>
      <input
        type="text"
        placeholder="Meal name (e.g., Chicken & Rice)"
        value={meal}
        onChange={(e) => setMeal(e.target.value)}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors font-medium"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Calories</label>
          <input
            type="number"
            placeholder="500"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors font-bold"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Protein (g)</label>
          <input
            type="number"
            placeholder="30"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors font-bold"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Carbs (g)</label>
          <input
            type="number"
            placeholder="50"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors font-bold"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Fats (g)</label>
          <input
            type="number"
            placeholder="15"
            value={fats}
            onChange={(e) => setFats(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors font-bold"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-600 mb-1 block">Photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />
        {imagePreview && (
          <img src={imagePreview} alt="preview" className="mt-3 w-32 h-24 object-cover rounded-lg border" />
        )}
      </div>
      <button
        onClick={handleSubmit}
        title="Add this meal"
        className="group relative w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl hover:shadow-xl transition-all font-bold overflow-hidden hover:scale-105"
      >
        <span className="relative z-10">Add Meal</span>
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>
    </div>
  );
}