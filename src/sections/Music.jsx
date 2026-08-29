import { useEffect, useState } from "react";
import { mediaService } from "../services/media";

const Music = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStream = async () => {
      try {
        const response = await mediaService.list({
          platform: "spotify",
          placement: "stream",
        });

        if (response.success) {
          setTracks(response.data);
        }
      } catch (err) {
        console.error("Failed to load stream tracks:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStream();
  }, []);

  return (
    <section id="music" className="section-flex">
      <h2 className="section-heading">Stream</h2>

      <div className="section-content-center">
        {loading && <p>Loading...</p>}

        {!loading && tracks.length === 0 && (
          <p>Nothing to stream yet — check back soon.</p>
        )}

        {!loading && tracks.length > 0 && (
          <div className="stream-grid">
            {tracks.map((track) => (
              <div key={track.id} className="card stream-card">
                <iframe
                  title={`Spotify: ${track.title}`}
                  src={`https://open.spotify.com/embed/${track.embed_code}`}
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                ></iframe>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Music;
