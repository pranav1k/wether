export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  let query = "";
  if (req.method === "GET") {
    query = req.query.q || req.query.query || "";
  } else {
    query =
      (req.body && (req.body.q || req.body.query || req.body.location)) ||
      (typeof req.body === "string" ? req.body : "");
  }

  const trimmedQuery = (query || "").trim();

  if (trimmedQuery.length < 2) {
    return res.status(200).json({ results: [] });
  }

  try {
    const searchUrl =
      "https://geocoding-api.open-meteo.com/v1/search?" +
      new URLSearchParams({
        name: trimmedQuery,
        count: "6",
        language: "en",
        format: "json",
      }).toString();

    const response = await fetch(searchUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(200).json({ results: [] });
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.results)) {
      return res.status(200).json({ results: [] });
    }

    const results = data.results.map((item) => {
      const parts = [item.name, item.admin1, item.country].filter(Boolean);
      return {
        id: item.id,
        name: item.name,
        admin1: item.admin1 || "",
        country: item.country || "",
        country_code: item.country_code || "",
        latitude: item.latitude,
        longitude: item.longitude,
        label: parts.join(", "),
      };
    });

    return res.status(200).json({ results });
  } catch (error) {
    console.error("Geocoding suggest error:", error);
    return res
      .status(500)
      .json({ results: [], error: "Failed to fetch suggestions" });
  }
}
