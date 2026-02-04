import ScheduleCell from './ScheduleCell';

function ScheduleTable({ people, schedule, dragItem, setDragItem, setSchedule }) {
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
                person={p}
                schedule={schedule}
                dragItem={dragItem}
                setDragItem={setDragItem}
                setSchedule={setSchedule}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ScheduleTable;
