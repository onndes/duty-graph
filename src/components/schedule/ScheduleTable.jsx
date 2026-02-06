import { useState, useEffect } from 'react';
import ScheduleCell from './ScheduleCell';

function ScheduleTable({ people, schedule, reload }) {
  // const tableRef = useRef(null);
  const [openedCell, setOpenedCell] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (event.target.closest('.cell-popover')) {
        return;
      }
      setOpenedCell(null);
    }

    document.addEventListener('mousedown', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, []);

  if (!schedule) return null;

  return (
    <div>
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
                <ScheduleCell
                  key={day}
                  day={day}
                  personId={p.id}
                  isAssigned={schedule.assignments[day]?.includes(p.id)}
                  reload={reload}
                  weekStart={schedule.weekStart}
                  isOpen={openedCell?.day === day && openedCell?.personId === p.id}
                  openCell={() => setOpenedCell({ day, personId: p.id })}
                  closeCell={() => setOpenedCell(null)}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleTable;
