export default async function handler(req, res) {
  // console.log(req.body.location)
  console.log(req.body);
  let response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?` +
      new URLSearchParams({
        name: `${req.body}`,
        count: 1,
      }).toString(),
    {
      method: "GET",
    }
  );
  let data = await response.json();
  if (data.hasOwnProperty("results")) {
    let dat = {
      lat: data.results[0].latitude,
      lon: data.results[0].longitude,
    };
    response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${dat.lat}&current_weather=true&longitude=${dat.lon}&hourly=temperature_2m&daily=temperature_2m_max&daily=temperature_2m_min&timezone=auto&timeformat=unixtime&daily=weathercode&hourly=weathercode`)
    let resp = await response.json()
    let respond = { 
      ...resp,
      name: `${data.results[0].name}, ${data.results[0].admin1}, ${data.results[0].country}`
    }
    res.status(202).json(respond)
  }else{
     res.status(404).json({name:`404 Not Found`,lat:0,lon:0});
  }
}
