import { useEffect, useState } from "react";
import { mediaService } from "../services/media";
import { contentService } from "../services/content";
import RichText from "../components/features/RichText";
import { Play } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaSpotify,
  FaXTwitter,
  FaSnapchat,
  FaApple,
} from "react-icons/fa6";

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61551555816555&mibextid=ZbWKwL",
    icon: FaFacebook,
  },
  {
    name: "Spotify",
    href: "https://open.spotify.com/artist/2cMMWuinHbQs0Bf1RTVNgH?si=edduLr8cTeWX836mLhJjCA",
    icon: FaSpotify,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/squalm2?igshid=OGQ5ZDc2ODk2ZA==",
    icon: FaInstagram,
  },
  {
    name: "Twitter X",
    href: "https://x.com/Squalm1175841?t=zaONE7OqIAf8n9NFVbKSTQ&s=09",
    icon: FaXTwitter,
  },
  {
    name: "Snapchat",
    href: "https://www.snapchat.com/add/squalm_band?share_id=VylJjntB1DM&locale=en-US",
    icon: FaSnapchat,
  },
  {
    name: "Apple Music",
    href: "https://music.apple.com/us/artist/squalm/1623436486",
    icon: FaApple,
  },
];

const Home = () => {
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const response = await mediaService.list({
          platform: "youtube",
          placement: "featured",
        });

        if (response.success && response.data.length > 0) {
          setFeaturedVideo(response.data[0]);
        }
      } catch (err) {
        console.error("Failed to load featured video:", err);
      }
    };

    const loadContent = async () => {
      try {
        const response = await contentService.list();
        if (response.success) {
          const home = response.data.find((s) => s.section_key === "home");
          setContent(home || null);
        }
      } catch (err) {
        console.error("Failed to load Home content:", err);
      }
    };

    Promise.all([loadFeatured(), loadContent()]).finally(() =>
      setLoading(false),
    );
  }, []);

  return (
    <section id="home">
      <div className="home-main">
        <div className="home-content">
          <h2>{content?.title || "Are you looking for us??"}</h2>
          <RichText text={content?.body} />
        </div>

        {!loading && featuredVideo && (
          <div className="featured-video">
            <p className="featured-video-label">Watch featured video</p>
            <a
              href={`https://www.youtube.com/watch?v=${featuredVideo.embed_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="featured-video-thumb"
              aria-label={`Watch ${featuredVideo.title} on YouTube`}
            >
              <img
                src={`https://img.youtube.com/vi/${featuredVideo.embed_code}/hqdefault.jpg`}
                alt=""
                aria-hidden="true"
              />
              <span className="play-button" aria-hidden="true">
                <Play size={28} fill="currentColor" />
              </span>
            </a>
            <p className="featured-video-title">{featuredVideo.title}</p>
          </div>
        )}
      </div>

      <ul className="social-links" aria-label="Follow Squalm on social media">
        {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              title={name}
            >
              <Icon size={20} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Home;
