export default async function handler(req, res) {
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      // plain text string
    }
  }

  let latitude = null;
  let longitude = null;
  let displayName = "";

  if (body && typeof body === "object") {
    if (typeof body.latitude === "number" && typeof body.longitude === "number") {
      latitude = body.latitude;
      longitude = body.longitude;
      displayName = body.name || "";
    } else {
      displayName = body.location || Object.keys(body)[0] || "";
    }
  } else if (typeof body === "string") {
    displayName = body;
  }

  displayName = (displayName || "").trim();

  if (latitude === null || longitude === null) {
    if (!displayName) {
      return res.status(400).json({ name: "Location required", lat: 0, lon: 0 });
    }

    try {
      const geoRes = await fetch(
        "https://geocoding-api.open-meteo.com/v1/search?" +
          new URLSearchParams({
            name: displayName,
            count: "1",
          }).toString()
      );
      const data = await geoRes.json();
      if (data && Array.isArray(data.results) && data.results.length > 0) {
        const first = data.results[0];
        latitude = first.latitude;
        longitude = first.longitude;
        displayName = [first.name, first.admin1, first.country]
          .filter(Boolean)
          .join(", ");
      } else {
        return res.status(404).json({ name: "404 Not Found", lat: 0, lon: 0 });
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      return res.status(500).json({ name: "Error searching location", lat: 0, lon: 0 });
    }
  }

  try {
    const forecastRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&current_weather=true&longitude=${longitude}&hourly=temperature_2m&daily=temperature_2m_max&daily=temperature_2m_min&timezone=auto&timeformat=unixtime&daily=weathercode&hourly=weathercode`
    );
    const resp = await forecastRes.json();
    const respond = {
      ...resp,
      name: displayName,
    };
    return res.status(202).json(respond);
  } catch (err) {
    console.error("Forecast error:", err);
    return res.status(500).json({ name: "Error fetching weather", lat: 0, lon: 0 });
  }
}
