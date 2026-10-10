"""Optional macOS demo narration preparation. Requires say and imageio-ffmpeg."""
from pathlib import Path
import json, subprocess, wave, math, struct
import imageio_ffmpeg
out=Path(__file__).resolve().parents[2]/'banana-sona-submission'
out.mkdir(exist_ok=True)
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
scenes=[
 ('intro','Give every chart a voice.','A chart copied into a worksheet becomes a flat picture. Its numbers are locked inside pixels. Sona opens them up again, for students and educators who need another way to explore the data.'),
 ('analyze','01 / Real pixels. Real local inference.','We start with an image, not a spreadsheet. Sona finds the bars with computer vision, reads text with a neural O C R model, and matches the labels and values by position. Select a bar, and the original image shows exactly where it came from.'),
 ('listen','02 / Hear the shape of the data.','Now listen. Each recovered value becomes a note. Higher values produce higher pitches.'),
 ('axis','03 / No printed values? Reconstruct the scale.','This solar chart has no printed values above the bars. Sona reads the axis ticks, fits a scale, and recovers values from the geometry. The data table calls these axis estimates. If calibration fails, the entire chart switches to clearly labeled relative sizes.'),
 ('review','04 / Review it. Correct it. Reuse it.','You can review and correct any label or value. Every edit updates the chart, audio, and exports. An educator can download an accessible report with a described graphic and a semantic data table. It works outside Sona, so access travels with the data.'),
 ('close','From a flat picture to a shared understanding.','The prototype supports single series, nonnegative bar charts. Our tests run the actual model and check keyboard interaction, exports, and automated accessibility rules. User studies are next. Sona processes images locally, without an A P I key. Every chart has a story. More people should be able to explore it.')
]
cues=[]
for name,title,text in scenes:
 txt=out/(name+'.txt');txt.write_text(text)
 subprocess.run(['say','-v','Samantha','-r','170','-f',str(txt),'-o',str(out/(name+'.aiff'))],check=True)
 wav=out/(name+'.wav')
 subprocess.run([ffmpeg,'-y','-loglevel','error','-i',str(out/(name+'.aiff')),'-ar','48000','-ac','1',str(wav)],check=True)
 with wave.open(str(wav),'rb') as f: raw=f.readframes(f.getnframes());rate=f.getframerate();duration=f.getnframes()/rate
 speech_duration=duration
 if name=='listen':
  raw+=b'\0\0'*int(rate*.6)
  for v in [24,42,35,68,83,61]:
   freq=220*4**(v/83)
   for i in range(int(rate*.72)):
    t=i/rate;gain=min(t/.03,1)*max(0,1-t/.55)**2 if t<.55 else 0
    raw+=struct.pack('<h',int(32767*.16*gain*math.sin(2*math.pi*freq*t)))
  with wave.open(str(wav),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(raw)
  duration=len(raw)/(2*rate)
 cues.append({'name':name,'title':title,'text':text,'duration':duration,'speechDuration':speech_duration,'audio':str(wav)})
(out/'cues.json').write_text(json.dumps(cues,indent=2))
print(json.dumps({'directory':str(out),'narratedSeconds':sum(c['duration'] for c in cues)}))
