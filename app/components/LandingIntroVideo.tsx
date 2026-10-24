"use client";

import { useEffect, useRef, useState } from "react";
import { client, clientStorageKey } from "@/lib/client-config";

export default function LandingIntroVideo() {
  const [open, setOpen] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(true);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const replay = useRef<HTMLButtonElement>(null);
  const dismissedKey = clientStorageKey("intro-video-dismissed-v1");
  const source = client.introVideo;

  useEffect(() => {
    if (!source) return;
    try {
      if (sessionStorage.getItem(dismissedKey)) return;
    } catch { /* The intro still works when storage is unavailable. */ }
    setOpen(true);
  }, [source, dismissedKey]);

  useEffect(() => {
    if (!open) return;
    const modal = dialog.current;
    if (modal && !modal.open) modal.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      video.current?.pause();
      modal?.close();
      document.body.style.overflow = oldOverflow;
    };
  }, [open]);

  if (!source) return null;

  const close = () => {
    video.current?.pause();
    dialog.current?.close();
    try { sessionStorage.setItem(dismissedKey, "yes"); } catch { /* Optional preference. */ }
    setOpen(false);
    replay.current?.focus();
  };

  const show = () => {
    setNeedsPlay(true);
    setFailed(false);
    setMuted(false);
    setVolume(1);
    setOpen(true);
  };

  const playWithSound = () => {
    const player = video.current;
    if (!player) return;
    player.defaultMuted = false;
    player.muted = false;
    player.volume = 1;
    setMuted(false);
    setVolume(1);
    void player.play().catch(() => setNeedsPlay(true));
  };

  return <>
    <button ref={replay} type="button" className="landing-video-launch" onClick={show}>
      <span className="landing-video-launch-icon" aria-hidden="true">▶</span>
      <span>Watch our story <small>A one-minute introduction</small></span>
    </button>
    <dialog ref={dialog} className="landing-video-dialog" aria-labelledby="landing-video-title"
      aria-describedby="landing-video-description" onCancel={event => event.preventDefault()}>
      <header className="landing-video-header">
        <div><span className="landing-kicker">A LITTLE PRACTICE. A WORLD OF POSSIBILITY.</span>
          <h2 id="landing-video-title">The story behind {client.name}</h2></div>
        <button type="button" autoFocus className="landing-video-close" onClick={close} aria-label="Close introduction video">×</button>
      </header>
      {open && <div className="landing-video-screen">
        <video ref={video} controls playsInline preload="metadata"
          aria-label={`${client.name} introduction video`} onPlay={() => setNeedsPlay(false)}
          onPause={() => setNeedsPlay(true)} onEnded={() => setNeedsPlay(true)}
          onVolumeChange={event => { setMuted(event.currentTarget.muted); setVolume(event.currentTarget.volume); }}
          onError={() => setFailed(true)}>
          <source src={source} type="video/mp4"/>
          Your browser cannot play this video. <a href={source}>Open the introduction video</a>.
        </video>
        {needsPlay && !failed && <button type="button" className="landing-video-play"
          onClick={playWithSound}>
          <span aria-hidden="true">▶</span> Play our introduction
        </button>}
        {failed && <div className="landing-video-error" role="alert"><p>The video couldn’t load.</p>
          <button type="button" onClick={() => { setFailed(false); video.current?.load(); }}>Try again</button>
          <a href={source}>Open video directly</a></div>}
      </div>}
      <div className="landing-video-sound-controls">
        <button type="button" onClick={() => {
          if (needsPlay || muted || volume === 0) playWithSound();
          else if (video.current) video.current.muted = true;
        }}>{needsPlay ? "▶ Play our introduction" : muted || volume === 0 ? "Turn sound on" : "Mute sound"}</button>
        <label>Volume <input aria-label="Introduction video volume" type="range" min="0" max="1" step="0.05"
          value={muted ? 0 : volume} onChange={event => {
            if (!video.current) return;
            video.current.muted = false;
            video.current.volume = Number(event.target.value);
          }}/></label>
        <span role="status">{muted || volume === 0 ? "Sound off" : `Sound on · ${Math.round(volume * 100)}%`}</span>
        <a href={source} target="_blank" rel="noreferrer">Open video directly ↗</a>
      </div>
      <footer className="landing-video-footer"><p id="landing-video-description">A classroom today. A lifetime of possibility.</p>
        <span>Close with × to explore the classroom.</span></footer>
    </dialog>
  </>;
}
