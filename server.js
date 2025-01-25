import express from "express";
import axios from "axios";
import cors from "cors";
import { getValidToken } from "./onemapServices";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/search-address", async (req, res) => {
  const { postalCode } = req.query;

  if (!postalCode) {
    return res.status(400).json({ error: "Postal code is required" });
  }

  try {
    const token = await getValidToken(); // Ensure valid token
    console.log(`Using token for search. Expiry logged in token service.`);

    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
    const response = await axios.get(url, {
      headers: {
        Authorization: token,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error searching address:", error.message);
    res.status(500).json({ error: "Error searching address" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
