function ScheduleHeader({
  week,
  history,
  onWeekChange,
  onCreateSchedule,
  onHistorySelect,
}) {
  return (
    <div className="mb-3">
      <h4>График дежурств</h4>

      {/* Выбор недели */}
      <div className="form-inline mb-3">
        <input
          type="date"
          className="form-control mr-2"
          value={week}
          onChange={(e) => onWeekChange(e.target.value)}
        />

        <button className="btn btn-primary" onClick={onCreateSchedule}>
          Создать график
        </button>
      </div>

      {/* История */}
      <div className="mb-3">
        <select
          className="form-control"
          onChange={(e) => onHistorySelect(e.target.value)}
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
    </div>
  );
}

export default ScheduleHeader;
