"use client";

import React, { useState, useEffect } from 'react';
import { Dumbbell, Calendar, Utensils, Plus, Trash2, TrendingUp, Award, Flame, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

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
      <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LiftBuddy</h1>
      <p className="text-sm text-gray-500 font-medium">Your Fitness Companion</p>
    </div>
  </div>
);

export default function LiftBuddy() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workouts' | 'diet' | 'calendar'>('dashboard');
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [showNewDiet, setShowNewDiet] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

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
    } catch (error) {
      console.log('No existing data found');
    }
  };

  const saveData = async () => {
    try {
      await localStorage.setItem('workout-templates', JSON.stringify(workoutTemplates));
      await localStorage.setItem('workout-logs', JSON.stringify(workoutLogs));
      await localStorage.setItem('diet-entries', JSON.stringify(dietEntries));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  useEffect(() => {
    saveData();
  }, [workoutTemplates, workoutLogs, dietEntries]);

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
    
    // Trigger celebration animation
    const messages = [
      '💪 Beast Mode Activated!',
      '🔥 Crushing It!',
      '⚡ Unstoppable!',
      '🏆 Workout Complete!',
      '💯 Keep It Up!',
      '🚀 You\'re On Fire!',
      '⭐ Amazing Work!'
    ];
    setCelebrationMessage(messages[Math.floor(Math.random() * messages.length)]);
    setShowCelebration(true);
    
    setTimeout(() => {
      setShowCelebration(false);
    }, 3000);
  };

  const addDietEntry = (entry: DietEntry) => {
    setDietEntries([...dietEntries, entry]);
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
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('workouts')}
              title="Create and log workouts"
              className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10">Start Workout</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button
              onClick={() => setActiveTab('diet')}
              title="Add meal entry"
              className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10">Log Meal</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
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
                  const today = formatDate(new Date());
                  logWorkout(today, template);
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
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
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
                      <p className="font-bold text-gray-800 text-lg">{entry.meal}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
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

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <LiftBuddyLogo />
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: TrendingUp, label: 'Dashboard', gradient: 'from-purple-500 to-pink-500', tooltip: 'View your progress' },
            { id: 'workouts', icon: Dumbbell, label: 'Workouts', gradient: 'from-blue-500 to-indigo-600', tooltip: 'Manage workout templates' },
            { id: 'diet', icon: Utensils, label: 'Diet', gradient: 'from-green-500 to-emerald-600', tooltip: 'Track your nutrition' },
            { id: 'calendar', icon: Calendar, label: 'Calendar', gradient: 'from-orange-500 to-red-500', tooltip: 'View workout history' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              title={tab.tooltip}
              className={`relative group flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm hover:shadow-md hover:scale-105'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
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
        {activeTab === 'calendar' && renderCalendar()}
      </div>
    </div>
  );
}

function AddExerciseForm({ onAdd }: { onAdd: (exercise: Exercise) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('0');

  const handleSubmit = () => {
    if (name) {
      onAdd({
        id: Date.now().toString(),
        name,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight)
      });
      setName('');
      setSets('3');
      setReps('10');
      setWeight('0');
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
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors font-medium"
      />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Sets</label>
          <input
            type="number"
            placeholder="Sets"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-center font-bold"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Reps</label>
          <input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-center font-bold"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Weight (lbs)</label>
          <input
            type="number"
            placeholder="Weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-center font-bold"
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

  const handleSubmit = () => {
    if (meal && calories) {
      onAdd({
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        meal,
        calories: parseInt(calories),
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fats: parseInt(fats) || 0
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Add Diet Entry</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
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

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes bounce-in {
    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
    50% { transform: scale(1.2) rotate(10deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  
  @keyframes confetti {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
  
  .animate-bounce-in {
    animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  .animate-confetti {
    animation: confetti linear forwards;
    font-size: 2rem;
  }
`;
document.head.appendChild(style);