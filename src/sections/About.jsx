import NewsImageMedia from "../components/features/NewsImageMedia";

const About = () => {
  return (
    <section id="about" className="section-flex">
      <div className="about-grid grid-2col">
        <div className="about-column">
          <h2 className="section-heading about-heading">About</h2>
          <div className="about-bio card">
            <p>
              Brothers Josiah and Isaiah Schu were raised in Colfax, Washington.
              They met coincidentally on the day of Isaiah's birth. Since then,
              they've been as close as brothers; and soon, with Isaiah learning
              drums and Josiah learning bass, they were well on their way to
              becoming a struggling duo of almost musicians.
            </p>
            <p>
              After 15 years of playing and learning to produce and play
              additional instruments they recorded their first album{" "}
              <span>Dollar Bread</span> under the band name Squalm in their
              filthy house in Moscow, Idaho, with the help of guitarist/cult
              leader Marcus Mead.
            </p>
            <p className="about-bio-secondary">
              In 2022, just after the release of their album, they set off to
              struggle even harder in the big city. In Portland, Oregon, they
              met Phil Felicia, their current guitarist, and are well on their
              way to a more rewarding and fruitful struggle.
            </p>
          </div>
        </div>

        <div className="about-photo-wrap">
          <NewsImageMedia
            src="https://pub-a74fa48b03e04c5c8b558f051bb069dd.r2.dev/squalm/images/about/TheBoyz.png"
            alt="Squalm band members Josiah Schu, Isaiah Schu, and Phil Felicia"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
