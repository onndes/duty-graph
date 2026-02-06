// import { useState } from 'react';
import { addOverride } from '../../db/overrides';
import './ScheduleCell.css';

function ScheduleCell({
  day,
  weekStart,
  personId,
  isAssigned,
  reload,
  isOpen,
  openCell,
  closeCell,
}) {
  // const [open, setOpen] = useState(false);

  const handleAdd = async () => {
    await addOverride({
      weekStart,
      personId,
      date: day,
      type: 'add',
    });
    closeCell();
    reload();
  };

  const handleRemove = async () => {
    await addOverride({
      weekStart,
      personId,
      date: day,
      type: 'remove',
    });
    closeCell();
    reload();
  };

  const handleUnavailable = async () => {
    await addOverride({
      weekStart,
      personId,
      date: day,
      type: 'unavailable',
    });
    closeCell();
    reload();
  };

  const handleClickCell = () => {
    openCell();
  };

  return (
    <td className={`schedule-cell ${isAssigned ? 'assigned' : ''}`} onClick={handleClickCell}>
      {isAssigned ? '●' : ''}

      {isOpen === true && (
        <div
          className="cell-popover"
          onClick={(e) => {
            e.stopPropagation();
            // если кликнули вне кнопок, закрываем поповер

            if (e.target === e.currentTarget) {
              closeCell();
            }
          }}
        >
          <button onClick={handleAdd}>➕ Поставить</button>
          <button onClick={handleRemove}>➖ Убрать</button>
          <button onClick={handleUnavailable}>🚫 Отсутствует</button>
        </div>
      )}
    </td>
  );
}

export default ScheduleCell;
