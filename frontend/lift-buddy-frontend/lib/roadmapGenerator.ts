type Params = {
  startWeight: number;
  targetWeight: number;
  targetDate: string; // ISO date
  activityLevel?: string;
};

type RoadmapEvent = {
  date: string; // YYYY-MM-DD
  type: 'workout' | 'diet' | 'rest';
  title: string;
  caloriesTarget?: number;
  note?: string;
  templateId?: string;
};

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

type WorkoutTemplate = {
  id: string;
  name: string;
  exercises: Exercise[];
};

type DietEntry = {
  id: string;
  date: string;
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

// Return events, workout templates and diet entries to merge into app state.
export default function generateRoadmap(params: Params): { events: RoadmapEvent[]; templates: WorkoutTemplate[]; dietEntries: DietEntry[] } {
  const { startWeight, targetWeight, targetDate, activityLevel = 'moderate' } = params;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setHours(0, 0, 0, 0);

  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  // simple calories per lb estimate
  const caloriesPerLb = 3500;
  const weightDiff = targetWeight - startWeight; // positive if gaining
  const totalCaloriesChange = weightDiff * caloriesPerLb; // positive if gaining
  const dailyCaloriesDelta = Math.round(totalCaloriesChange / days) * (weightDiff >= 0 ? 1 : -1);

  // Base maintenance by activity
  const baseMaintenance = activityLevel === 'sedentary' ? 2000 : activityLevel === 'light' ? 2200 : activityLevel === 'moderate' ? 2500 : 2800;

  const events: RoadmapEvent[] = [];
  const templates: WorkoutTemplate[] = [];
  const dietEntries: DietEntry[] = [];

  // Basic exercise pool and heuristics for progressive overload
  const exercisePool = [
    { name: 'Squat', factor: 0.6 },
    { name: 'Bench Press', factor: 0.4 },
    { name: 'Deadlift', factor: 0.8 },
    { name: 'Overhead Press', factor: 0.25 },
    { name: 'Barbell Row', factor: 0.35 }
  ];

  // We'll create a 3-day rotation: Push, Pull, Legs
  const rotation = [ ['Bench Press','Overhead Press','Barbell Row'], ['Deadlift','Barbell Row','Squat'], ['Squat','Bench Press','Overhead Press'] ];

  for (let i = 0; i <= days; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const iso = d.toISOString().split('T')[0];

    const isRest = i % 7 === 0; // 1 rest per week

    if (isRest) {
      events.push({ date: iso, type: 'rest', title: 'Rest Day', note: 'Recovery and mobility' });
      continue;
    }

    // Decide workout vs diet day: workouts on Mon/Tue/Thu/Fri (approx) -> pattern using i % 3
    const dayType = i % 3 === 0 ? 'workout' : 'diet';

    if (dayType === 'workout') {
      // build a templated workout with progressive overload
      const cycle = Math.floor(i / 3);
      const rotationIdx = i % rotation.length;
      const exercises = rotation[rotationIdx].map((exName, idx) => {
        const pool = exercisePool.find(p => p.name === exName) || exercisePool[idx % exercisePool.length];
        const base = Math.max(10, Math.round(startWeight * (pool.factor || 0.3)));
        // progressive overload: +2.5 lbs every two cycles
        const weight = Math.round(base + cycle * 2.5 * (Math.floor((idx+1))));
        return {
          id: `${iso}-${exName}`,
          name: exName,
          sets: 3,
          reps: 5 + (rotationIdx === 0 ? 0 : 0),
          weight
        } as Exercise;
      });

      const template: WorkoutTemplate = {
        id: `roadmap-w-${iso}`,
        name: `Planned Workout ${d.toLocaleDateString()}`,
        exercises
      };

      templates.push(template);
      events.push({ date: iso, type: 'workout', title: template.name, note: 'Planned strength session', templateId: template.id });
    } else {
      // diet day: set calorie target and simple macro split
      const caloriesTarget = Math.max(1200, baseMaintenance + Math.round(dailyCaloriesDelta));
      const protein = Math.round(0.25 * caloriesTarget / 4); // 25% calories from protein -> grams
      const fats = Math.round(0.25 * caloriesTarget / 9);
      const carbs = Math.round((caloriesTarget - protein * 4 - fats * 9) / 4);

      events.push({ date: iso, type: 'diet', title: 'Nutrition Target', caloriesTarget, note: `P:${protein}g C:${carbs}g F:${fats}g` });

      // create 3 sample meal entries (breakfast, lunch, dinner)
      const meals = ['Breakfast','Lunch','Dinner'];
      const mealSplit = [0.25, 0.4, 0.35];
      meals.forEach((meal, mi) => {
        const cals = Math.round(caloriesTarget * mealSplit[mi]);
        const p = Math.round(protein * mealSplit[mi]);
        const f = Math.round(fats * mealSplit[mi]);
        const c = Math.round(carbs * mealSplit[mi]);
        dietEntries.push({ id: `roadmap-d-${iso}-${mi}-${Date.now()}`, date: iso, meal: `${meal} (Planned)`, calories: cals, protein: p, carbs: c, fats: f });
      });
    }
  }

  return { events, templates, dietEntries };
}
