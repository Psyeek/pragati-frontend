import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8808"; // Adjust if deployed

const MaterialAutocomplete = ({ value, onChange }) => {
  const [query, setQuery] = useState(value?.item || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const ignoreBlurRef = useRef(false);

  useEffect(() => {
    if (!query.trim()) return setSuggestions([]);

    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/materials?query=${query}`);
        setSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Autocomplete fetch failed:", err);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const handleSelect = (item) => {
    setQuery(item.item);
    setShowDropdown(false);
    onChange({
      item: item.item,
      rate: item.rate,
      itemDescription: item.itemDescription,
    });
  };

  const handleBlur = async () => {
    if (ignoreBlurRef.current) return;

    setShowDropdown(false); // Hide dropdown on blur

    // If no change from previous value, no need to create
    if (query === value?.item) return;

    try {
      const res = await axios.post("/api/materials", {
        item: query,
        itemDescription: "",
        rate: 0,
      });

      onChange({
        item: res.data.item,
        rate: res.data.rate,
        itemDescription: res.data.itemDescription,
      });
    } catch (e) {
      console.error("Error auto-creating material:", e);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        value={query}
        className="material-autocomplete-input"
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
          onChange({ item: e.target.value, rate: "", itemDescription: "" });
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={handleBlur}
        placeholder="Enter item"
        autoComplete="off"
      />

      {showDropdown && suggestions.length > 0 && (
        <ul
          className="material-autocomplete-dropdown"
          onMouseEnter={() => (ignoreBlurRef.current = true)}
          onMouseLeave={() => (ignoreBlurRef.current = false)}
        >
          {suggestions.map((item, i) => (
            <li key={i} onMouseDown={() => handleSelect(item)}>
              {item.item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MaterialAutocomplete;
