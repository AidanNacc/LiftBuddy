"use client";

import React from 'react';

export default function CalendarView({ events = [], currentDate, onMonthChange, onDayClick, selectedDate }: { events?: any[]; currentDate: Date; onMonthChange?: (d: Date) => void; onDayClick?: (isoDate: string) => void; selectedDate?: string | null }) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const eventsByDate = events.reduce((acc: Record<string, any[]>, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => onMonthChange && onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded-md">◀</button>
            <h3 className="text-lg font-bold">{monthName}</h3>
            <button onClick={() => onMonthChange && onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded-md">▶</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-semibold text-gray-600">
          {days.map(d => <div key={d} className="py-1">{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: startingDayOfWeek }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const date = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
            const evList = eventsByDate[date] || [];
            const isSelected = selectedDate === date;
            return (
              <div key={date} onClick={() => onDayClick && onDayClick(date)} role="button" tabIndex={0} className={`aspect-square rounded-xl p-2 text-sm font-bold flex flex-col justify-between cursor-pointer select-none transition-shadow ${evList.length ? 'bg-gradient-to-br from-white to-gray-50 border border-gray-200' : 'bg-gray-50'} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="text-xs text-gray-600">{day}</div>
                <div className="flex flex-col gap-1">
                  {evList.slice(0, 2).map((ev: any, i2: number) => (
                    <div key={i2} className={`text-xs px-2 py-1 rounded-full font-medium ${ev.type === 'workout' ? 'bg-blue-500 text-white' : ev.type === 'diet' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h4 className="font-bold mb-2">Legend</h4>
        <div className="flex gap-3 items-center text-sm">
          <div className="px-3 py-1 rounded-full bg-blue-500 text-white font-semibold">Workout</div>
          <div className="px-3 py-1 rounded-full bg-green-500 text-white font-semibold">Diet</div>
          <div className="px-3 py-1 rounded-full bg-gray-300 text-gray-800 font-semibold">Rest</div>
        </div>
      </div>
    </div>
  );
}
