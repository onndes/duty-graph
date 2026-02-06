import { useState } from 'react';
import ScheduleCell from './ScheduleCell';

function ScheduleTable({ people, schedule, reload }) {
  const [openedCell, setOpenedCell] = useState(null);
  if (!schedule) return null;

  return (
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
  );
}

export default ScheduleTable;
