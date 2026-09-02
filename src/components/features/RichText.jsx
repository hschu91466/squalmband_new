/**
 * Renders plain text as paragraphs, splitting on blank lines (double line breaks).
 * Admins enter body text as plain text in a textarea, separating paragraphs
 * with a blank line — no HTML is ever accepted or rendered here.
 */
const RichText = ({ text }) => {
  if (!text) return null;

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </>
  );
};

export default RichText;
