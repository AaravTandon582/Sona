"""Combine the screen recording with narration and generated pitch sequence."""
from pathlib import Path
import subprocess,json,wave
import imageio_ffmpeg
out=Path(__file__).resolve().parents[2]/'banana-sona-submission'
timeline=json.loads((out/'timeline.json').read_text());rate=48000
duration=max(c['start']+c['duration']+1.5 for c in timeline)
audio=bytearray(int(duration*rate)*2)
for cue in timeline:
 with wave.open(cue['audio'],'rb') as f:raw=f.readframes(f.getnframes())
 offset=int(cue['start']*rate)*2;audio[offset:offset+len(raw)]=raw
with wave.open(str(out/'narration.wav'),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(audio)
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
filters=['drawbox=x=0:y=ih-90:w=iw:h=90:color=0x211a31:t=fill']
for index,cue in enumerate(timeline):
 title_path=out/(cue['name']+'-title.txt');title_path.write_text(cue['title'])
 end=timeline[index+1]['start'] if index+1<len(timeline) else duration
 filters.append(f"drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:textfile={title_path}:fontcolor=white:fontsize=23:x=(w-text_w)/2:y=h-56:enable='between(t,{cue['start']},{end})'")
subprocess.run([ffmpeg,'-y','-loglevel','error','-i',str(out/'screen.webm'),'-i',str(out/'narration.wav'),'-vf',','.join(filters),'-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-shortest',str(out/'Sona-demo.mp4')],check=True)
print(json.dumps({'video':str(out/'Sona-demo.mp4'),'duration_seconds':duration}))
