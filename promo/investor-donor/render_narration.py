"""Render the approved script with macOS's installed Samantha voice."""
from pathlib import Path
import audioop
import json
import subprocess
import wave

root = Path(__file__).resolve().parent
subprocess.run([
    '/usr/bin/say', '-v', 'Samantha', '-r', '132',
    '-f', str(root / 'narration.txt'), '-o', str(root / 'narration-source.aiff'),
], check=True)
subprocess.run([
    '/usr/bin/afconvert', '-f', 'WAVE', '-d', 'LEI16@44100',
    str(root / 'narration-source.aiff'), str(root / 'narration-source.wav'),
], check=True)
with wave.open(str(root / 'narration-source.wav'), 'rb') as source:
    rate, channels, width = source.getframerate(), source.getnchannels(), source.getsampwidth()
    frames = source.readframes(source.getnframes())
frame_size = channels * width
speech_seconds = len(frames) / frame_size / rate
if not frames or audioop.rms(frames, width) < 10:
    raise RuntimeError('Speech generation returned empty or silent audio')
lead_frames = round(0.4 * rate)
total_frames = 60 * rate
tail_frames = total_frames - lead_frames - len(frames) // frame_size
if tail_frames < 0:
    raise RuntimeError('Narration exceeds 60 seconds; no speech was truncated')
peak = audioop.max(frames, width)
frames = audioop.mul(frames, width, min(3.0, (32767 * 10 ** (-1 / 20)) / peak))
output = root / 'endowal-promo-narration-60s.wav'
with wave.open(str(output), 'wb') as dest:
    dest.setnchannels(channels)
    dest.setsampwidth(width)
    dest.setframerate(rate)
    dest.writeframes(bytes(lead_frames * frame_size) + frames + bytes(tail_frames * frame_size))
subprocess.run([
    '/usr/bin/afconvert', '-f', 'm4af', '-d', 'aac', '-b', '192000',
    str(output), str(root / 'endowal-promo-narration-60s.m4a'),
], check=True)
report = {
    'voice': 'macOS Samantha (synthetic)', 'words_per_minute_setting': 132,
    'duration_seconds': 60, 'speech_duration_seconds': round(speech_seconds, 3),
    'lead_in_seconds': 0.4, 'closing_silence_seconds': round(tail_frames / rate, 3),
    'sample_rate': rate, 'channels': channels,
    'speech_truncated': False, 'music_included': False,
}
(root / 'narration-audio-info.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
