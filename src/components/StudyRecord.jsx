export default function StudyRecord({ records }) {
  return (
    <section className="session-progress-card">
      <div className="kicker">HISTORY</div>
      <h2>Study records</h2>
      {records.length === 0 ? (
        <p>No records yet.</p>
      ) : (
        <ul>
          {records.map((record) => (
            <li key={record.id}>
              {record.date} · {record.subject} · {record.minutes} min
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
