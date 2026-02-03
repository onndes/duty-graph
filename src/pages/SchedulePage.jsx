import { useEffect, useRef, useState } from 'react';
import { getParticipants } from '../db/participants';
import { saveSchedule, getScheduleByWeek, getScheduleHistory } from '../db/schedules';
import { generateWeekSchedule } from '../core/schedule/generateWeekSchedule';
import { getMeta, setMeta } from '../db/meta';
import { seedParticipants } from '../db/devSeed';
import createEmptySchedule from '../logic/createEmptySchedule';

function getMonday(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

function SchedulePage() {
  const [people, setPeople] = useState([]);
  const [week, setWeek] = useState(getMonday(new Date().toISOString()));
  const [dragItem, setDragItem] = useState(null);
  // { fromDay, personId }
  const [schedule, setSchedule] = useState(null);
  const [history, setHistory] = useState([]);
  const seededRef = useRef(false);
  const loadHistory = () => {
    getScheduleHistory().then(setHistory);
  };
  const loadScheduleForWeek = async (weekStart) => {
    const existing = await getScheduleByWeek(weekStart);

    if (existing) {
      setSchedule(existing);
    } else {
      setSchedule(createEmptySchedule(weekStart, people));
    }
  };
  useEffect(() => {
    if (!seededRef.current) {
      seededRef.current = true;
      seedParticipants();
    }

    getParticipants().then(setPeople);
    loadHistory();
  }, []);

  async function createSchedule() {
    if (!people.length) return;

    const meta = await getMeta('rotationOffset');
    const rotationOffset = meta?.value || 0;

    const newSchedule = generateWeekSchedule({
      people,
      weekStart: week,
      rotationOffset,
    });

    await saveSchedule(newSchedule);

    await setMeta('rotationOffset', rotationOffset + 1);

    setSchedule(newSchedule);
    loadHistory();
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
          onChange={(e) => {
            const monday = getMonday(e.target.value);
            setWeek(monday);
            loadScheduleForWeek(monday);
          }}
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
                {Object.keys(schedule.assignments).map((day) => {
                  const isOnDuty = schedule.assignments[day].includes(p.id);

                  return (
                    <td
                      key={day}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (!dragItem) return;

                        const { fromDay, personId } = dragItem;

                        if (fromDay === day) return;

                        setSchedule((prev) => {
                          const next = structuredClone(prev);

                          next.assignments[fromDay] = next.assignments[fromDay].filter(
                            (id) => id !== personId
                          );

                          if (!next.assignments[day].includes(personId)) {
                            next.assignments[day].push(personId);
                          }

                          return next;
                        });

                        setDragItem(null);
                      }}
                    >
                      {isOnDuty && (
                        <span
                          draggable
                          onDragStart={() => setDragItem({ fromDay: day, personId: p.id })}
                          style={{ cursor: 'grab' }}
                        >
                          ✔
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SchedulePage;
