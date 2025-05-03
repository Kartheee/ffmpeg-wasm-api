import express from 'express';
import fetch from 'node-fetch';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const app = express();
const ffmpeg = createFFmpeg({ log: true });
app.use(express.json());

app.post('/process', async (req, res) => {
  try {
    const { url, start, duration } = req.body;

    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    const input = 'input.mp4';
    const output = 'output.mp4';
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    ffmpeg.FS('writeFile', input, new Uint8Array(arrayBuffer));
    await ffmpeg.run('-ss', start, '-t', duration, '-i', input, '-c', 'copy', output);
    const data = ffmpeg.FS('readFile', output);

    res.setHeader('Content-Disposition', `attachment; filename=${output}`);
    res.send(Buffer.from(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing video.');
  }
});

app.listen(3000, () => {
  console.log('FFmpeg WASM API running on port 3000');
});
