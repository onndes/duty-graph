import { useEffect, useState } from 'react';
import ScheduleTable from '../components/schedule/ScheduleTable';
import ScheduleHeader from '../components/schedule/ScheduleHeader';
import { useSchedule } from '../hooks/useSchedule';

function getMonday(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

function SchedulePage() {
  const [week, setWeek] = useState(getMonday(new Date().toISOString()));

  const { people, schedule, history, loadScheduleForWeek, createSchedule } = useSchedule();

  // первый показ графика
  useEffect(() => {
    loadScheduleForWeek(week);
  }, []);

  return (
    <div>
      <ScheduleHeader
        week={week}
        history={history}
        onWeekChange={(value) => {
          const monday = getMonday(value);
          setWeek(monday);
          loadScheduleForWeek(monday);
        }}
        onCreateSchedule={() => createSchedule(week)}
        onHistorySelect={(weekStart) => loadScheduleForWeek(weekStart)}
      />

      {/* Таблица */}
      {schedule && (
        <ScheduleTable
          schedule={schedule}
          people={people}
          reload={() => loadScheduleForWeek(week)}
        />
      )}
    </div>
  );
}

export default SchedulePage;
