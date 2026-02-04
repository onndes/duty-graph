import { useState } from 'react';
import { addOverride } from '../../db/overrides';
import './ScheduleCell.css';

function ScheduleCell({ day, weekStart, personId, isAssigned, reload }) {
  const [open, setOpen] = useState(false);

  const handleAdd = async () => {
    console.log('ADD CLICK', { weekStart, day, personId });
    await addOverride({
      weekStart,
      personId,
      date: day,
      type: 'add',
    });
    setOpen(false);
    reload();
  };

  const handleRemove = async () => {
    await addOverride({
      weekStart,
      personId,
      date: day,
      type: 'remove',
    });
    setOpen(false);
    reload();
  };

  const handleUnavailable = async () => {
    await addOverride({
      weekStart,
      personId,
      date: day,
      type: 'unavailable',
    });
    setOpen(false);
    reload();
  };

  return (
    <td className={`schedule-cell ${isAssigned ? 'assigned' : ''}`} onClick={() => setOpen(true)}>
      {isAssigned ? '●' : ''}

      {open && (
        <div className="cell-popover" onClick={(e) => e.stopPropagation()}>
          <button onClick={handleAdd}>➕ Поставить</button>
          <button onClick={handleRemove}>➖ Убрать</button>
          <button onClick={handleUnavailable}>🚫 Отсутствует</button>
        </div>
      )}
    </td>
  );
}

export default ScheduleCell;
