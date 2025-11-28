"use client";

import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import generateRoadmap from '../../lib/roadmapGenerator';

export default function GoalSetter({ onGenerate, onClose }: { onGenerate: (result: any, goal: any) => void; onClose: () => void }) {
  const [targetWeight, setTargetWeight] = useState('');
  const [startWeight, setStartWeight] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');

  const handleGenerate = () => {
    const params = {
      startWeight: parseFloat(startWeight) || 0,
      targetWeight: parseFloat(targetWeight) || 0,
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      activityLevel
    };

    const result = generateRoadmap(params);
    onGenerate(result, params);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Set a Goal</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Current weight (lbs)</label>
            <input className="w-full px-3 py-2 border rounded-md" value={startWeight} onChange={e => setStartWeight(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Target weight (lbs)</label>
            <input className="w-full px-3 py-2 border rounded-md" value={targetWeight} onChange={e => setTargetWeight(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Target date</label>
            <input type="date" className="w-full px-3 py-2 border rounded-md" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Activity level</label>
            <select className="w-full px-3 py-2 border rounded-md" value={activityLevel} onChange={e => setActivityLevel(e.target.value)}>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md border">Cancel</button>
          <button onClick={handleGenerate} className="px-4 py-2 rounded-md bg-blue-600 text-white flex items-center gap-2">Generate <CalendarIcon className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
