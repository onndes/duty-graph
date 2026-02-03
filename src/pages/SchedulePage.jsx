import { useEffect, useState } from 'react';
import { getParticipants } from '../db/participants';
import { saveSchedule, getScheduleByWeek, getScheduleHistory } from '../db/schedules';
import { generateWeekSchedule } from '../core/schedule/generateWeekSchedule';

function getMonday(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

function SchedulePage() {
  const [people, setPeople] = useState([]);
  const [week, setWeek] = useState(getMonday(new Date().toISOString()));
  const [schedule, setSchedule] = useState(null);
  const [history, setHistory] = useState([]);
  const loadHistory = () => {
    getScheduleHistory().then(setHistory);
  };
  useEffect(() => {
    getParticipants().then(setPeople);
    loadHistory();
  }, []);

  function createSchedule() {
    if (!people.length) return;
    console.log('WEEK:', week);
    const newSchedule = generateWeekSchedule({
      people,
      weekStart: week,
    });

    saveSchedule(newSchedule).then(() => {
      setSchedule(newSchedule);
      loadHistory();
    });
  }

  function loadSchedule(weekStart) {
    getScheduleByWeek(weekStart).then(setSchedule);
  }

  return (
    <div>
      <h4>График дежурств</h4>

      {/* Выбор недели */}
      <div className="form-inline mb-3">
        <input
          type="date"
          className="form-control mr-2"
          value={week}
          onChange={(e) => setWeek(getMonday(e.target.value))}
        />

        <button className="btn btn-primary" onClick={createSchedule}>
          Создать график
        </button>
      </div>

      {/* История */}
      <div className="mb-3">
        <select
          className="form-control"
          onChange={(e) => loadSchedule(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            История недель
          </option>
          {history.map((h) => (
            <option key={h.weekStart} value={h.weekStart}>
              {h.weekStart}
            </option>
          ))}
        </select>
      </div>

      {/* Таблица */}
      {schedule && (
        <table className="table table-sm table-bordered text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>Примечание</th>
              <th>ФИО</th>
              {Object.keys(schedule.assignments).map((day) => (
                <th key={day}>{day.slice(5)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {people.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.note}</td>
                <td>{p.fullName}</td>
                {Object.keys(schedule.assignments).map((day) => (
                  <td key={day}>{schedule.assignments[day].includes(p.id) ? '✔' : ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SchedulePage;
