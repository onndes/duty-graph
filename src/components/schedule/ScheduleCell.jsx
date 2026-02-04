function ScheduleCell({ day, person, schedule, dragItem, setDragItem, setSchedule }) {
  const isOnDuty = schedule.assignments[day].includes(person.id);

  return (
    <td
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        if (!dragItem) return;

        const { fromDay, personId } = dragItem;
        if (fromDay === day) return;

        setSchedule((prev) => {
          const next = structuredClone(prev);

          next.assignments[fromDay] = next.assignments[fromDay].filter((id) => id !== personId);

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
          onDragStart={() => setDragItem({ fromDay: day, personId: person.id })}
          style={{ cursor: 'grab' }}
        >
          ✔
        </span>
      )}
    </td>
  );
}

export default ScheduleCell;
