const tracks = [
  { name: "Lead Vox", type: "Audio", color: "amber" },
  { name: "Keys", type: "MIDI", color: "cyan" },
  { name: "Drums", type: "Audio", color: "rose" },
  { name: "Bass", type: "MIDI", color: "lime" },
];

export function TrackHeaderPane() {
  return (
    <aside className="track-header-pane">
      <button className="primary-button add-track-button">Add track</button>
      <div className="track-list">
        {tracks.map((track) => (
          <article key={track.name} className="track-row">
            <div className={`track-color ${track.color}`} />
            <div className="track-copy">
              <strong>{track.name}</strong>
              <span>{track.type}</span>
            </div>
            <div className="track-toggles">
              <button>M</button>
              <button>S</button>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
