import { useEffect, useState } from "react";
import NewsImageMedia from "../components/features/NewsImageMedia";
import RichText from "../components/features/RichText";
import { contentService } from "../services/content";

const About = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await contentService.list();
        if (response.success) {
          const about = response.data.find((s) => s.section_key === "about");
          setContent(about || null);
        }
      } catch (err) {
        console.error("Failed to load About content:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  if (loading) return null;

  return (
    <section id="about" className="section-flex">
      <h2>About</h2>
      <div className="section-content-center">
        <div className="about-grid grid-2col">
          <div className="about-column">
            {/* <h2 className="section-heading about-heading">
              {content?.title || "About"}
            </h2> */}
            <div className="about-bio card">
              {content?.title && <h5>{content.title}</h5>}
              <RichText text={content?.body} />
            </div>
          </div>

          <div className="about-photo-wrap">
            <NewsImageMedia
              src={content?.image_path}
              alt={content?.image_alt}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
