import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Public Search proxy (no token). Keeps your front-end origin clean and rate-limitable.
app.get("/search-address", async (req, res) => {
  const q = req.query || {};
  const postalCode = String(q.postalCode || q.searchVal || "").trim(); // <-- accept both

  if (!/^\d{6}$/.test(postalCode)) {
    return res.status(400).json({ error: "A valid 6-digit postalCode is required" });
  }

  try {
    const url = "https://developers.onemap.sg/commonapi/search";
    const { data } = await axios.get(url, {
      params: { searchVal: postalCode, returnGeom: "Y", getAddrDetails: "Y", pageNum: 1 },
      timeout: 10000,
    });
    res.json(data);
  } catch (error) {
    console.error("Error searching address:", error?.response?.status, error?.message);
    res.status(502).json({ error: "Error searching address" });
  }
});

// Example: protected endpoints (routing, themes, etc.) still use token
import { callOneMapAPI } from "./onemapServices.js";
app.get("/themes", async (_req, res) => {
  try {
    const data = await callOneMapAPI("/themesvc/getAllThemesInfo", {}, { authRequired: true });
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: "Theme fetch failed" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));