const laneClips = [
  ["Verse Vox", "Hook Double"],
  ["MIDI Chords", "Lead Layer"],
  ["Kick + Snare", "Perc Loop"],
  ["Bass Phrase"],
];

export function TimelineViewport() {
  return (
    <section className="timeline-viewport">
      <div className="timeline-ruler">
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index}>Bar {index + 1}</span>
        ))}
      </div>

      <div className="timeline-grid">
        {laneClips.map((clips, laneIndex) => (
          <div key={laneIndex} className="timeline-lane">
            {clips.map((clip) => (
              <article key={clip} className="timeline-clip">
                <span>{clip}</span>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
