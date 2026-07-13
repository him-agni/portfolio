import React from 'react';

const emphasizedLeads = [
  'Decision.',
  'Why.',
  'Trade-off.',
  'Alternatives considered.',
];

const NoteParagraph = ({ children }) => {
  const lead = emphasizedLeads.find((candidate) => children.startsWith(candidate));

  return (
    <p className="engineering-note-text">
      {lead ? (
        <>
          <strong>{lead}</strong>{children.slice(lead.length)}
        </>
      ) : children}
    </p>
  );
};

const Paragraphs = ({ paragraphs = [] }) => (
  paragraphs.map((paragraph, index) => (
    <NoteParagraph key={index}>{paragraph}</NoteParagraph>
  ))
);

const EngineeringNotes = ({ notes }) => (
  <div className="engineering-notes">
    {notes.map((note, noteIndex) => (
      <React.Fragment key={note.number}>
        {noteIndex > 0 && <hr className="detail-divider" />}
        <section className="detail-section engineering-note-section">
          <span className="section-label">
            // {note.number} — {note.title.toUpperCase()}
          </span>
          <h2 className="engineering-note-heading">{note.subtitle}</h2>

          <Paragraphs paragraphs={note.paragraphs} />

          {note.diagram && (
            <pre
              className="engineering-note-diagram"
              aria-label={`${note.title} system diagram`}
              tabIndex="0"
            >
              {note.diagram}
            </pre>
          )}

          <Paragraphs paragraphs={note.closingParagraphs} />

          {note.subsections?.map((subsection, index) => (
            <div className="engineering-note-subsection" key={index}>
              <h3>{subsection.title}</h3>
              <Paragraphs paragraphs={subsection.paragraphs} />
            </div>
          ))}
        </section>
      </React.Fragment>
    ))}
  </div>
);

export default EngineeringNotes;
