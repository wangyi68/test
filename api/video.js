import ytdl from "ytdl-core";

export default async function handler(req, res) {
  const { url, itag, type } = req.query;

  if (!url) return res.status(400).json({ error: "URL missing" });

  try {
    if (type === "mp3") {
      res.setHeader("Content-Disposition", `attachment; filename="audio.mp3"`);
      ytdl(url, { filter: "audioonly" }).pipe(res);
    } else if (itag) {
      res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);
      ytdl(url, { quality: itag }).pipe(res);
    } else {
      const info = await ytdl.getInfo(url);
      const formats = ytdl.filterFormats(info.formats, "videoandaudio");
      const links = formats.map(f => ({
        quality: f.qualityLabel,
        itag: f.itag
      })).filter((v, i, a) => !a.find(x => x.quality === v.quality));

      res.json({
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails.slice(-1)[0].url,
        links,
        embedUrl: `https://www.youtube.com/embed/${info.videoDetails.videoId}`
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch video" });
  }
}
