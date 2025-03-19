import axios from "axios";

export async function getChannelQualitys(link, refferer) {
  try {
    const response = await axios.get(link, {
      headers: { Referer: refferer },
    });
    console.log(response.data);
    return chanelQualityParser(response.data);
  } catch (error) {
    console.error("Error fetching channel data:", error.message);
    return [];
  }
}
function chanelQualityParser(file = "") {
  const lines = file.split("\n").filter((line) => line.trim().length > 0);
  const res = [];

  for (const line of lines) {
    if (line.includes("#EXT-X-STREAM-INF")) {
      const data = line.split("#EXT-X-STREAM-INF:")[1].split(",");
      console.log(data);
      const resolution = data
        .find((e) => e.includes("RESOLUTION="))
        .split("RESOLUTION=")[1];
      const bitrate = data
        .find((e) => e.includes("BANDWIDTH="))
        .split("BANDWIDTH=")[1];
      res.push([resolution, null, bitrate]);
      continue;
    }
    if (!line.startsWith("#")) {
      res[res.length - 1][1] = line;
    }
  }

  return res;
}
