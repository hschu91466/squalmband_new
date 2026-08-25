import { useEffect, useState } from "react";
import { tourService } from "../services/tour";
import TourDateRow from "../components/features/TourDateRow";

const Tour = () => {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDates = async () => {
      try {
        const response = await tourService.listUpcoming();

        if (response.success) {
          setDates(response.data);
        }
      } catch (err) {
        console.error("Failed to load tour dates:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDates();
  }, []);

  return (
    <section id="tour" className="section-flex">
      <h2 className="section-heading">Tour</h2>

      <div className="section-content-center">
        {loading && <p>Loading...</p>}
        {!loading && dates.length === 0 && (
          <p>No upcoming shows right now — check back soon.</p>
        )}
        {!loading && dates.length > 0 && (
          <ul className="tour-list">
            {dates.map((date) => (
              <TourDateRow key={date.id} tourDate={date} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default Tour;
