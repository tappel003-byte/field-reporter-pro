---
name: Voice memos
description: Mic button next to Quick Capture — tap to start/stop, saves native-format audio to IDB, exports to voice-memos/ folder
type: feature
---
Voice memos = stream-of-consciousness audio recordings (homeowner convos, drive-away debriefs). Pattern mirrors Quick Capture exactly:

- 🎙️ button in workspace toolbar next to 📸 Quick Capture; tap to start, tap again to stop
- Native browser format only — webm (Android/Chrome) or m4a (iOS Safari). Never transcode in-app.
- Blob stored in IndexedDB under key `vm_<id>`; metadata on `project.voiceMemos[] = {id, ts, duration, mime, ext, lat, lng}`
- Memos < 0.6s are discarded silently (accidental taps)
- Exported in ZIP as `voice-memos/memo-NN.{ext}` + `voice-memos.csv` (File, Timestamp, Lat, Lng, Duration)
- No transcription in-app — happens in user's external LLM after export (consistent with LLM export handoff rule)
- Internal AND external mode both get voice memos (unlike photos which are internal-only)
