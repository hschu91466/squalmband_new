import { useState } from "react";
import ContentForm from "../../components/admin/ContentForm";

const SECTIONS = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
];

const ManageContent = () => {
  const [sectionKey, setSectionKey] = useState("home");

  return (
    <div>
      <h2>Manage Site Content</h2>

      <label htmlFor="section-select">Section</label>
      <select
        id="section-select"
        value={sectionKey}
        onChange={(e) => setSectionKey(e.target.value)}
      >
        {SECTIONS.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>

      <ContentForm sectionKey={sectionKey} />
    </div>
  );
};

export default ManageContent;
