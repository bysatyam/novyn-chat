// WebRTC Service for Novyn Chat Call Management

// ── ICE / STUN / TURN configuration ──────────────────────────────────────────
// STUN-only works for ~80% of users. The TURN relays below handle the remaining
// ~20% who are behind symmetric NAT (corporate networks, some mobile carriers).
// Using Metered's free open relay as a fallback — no key needed for the open tier.
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    // Google STUN (fast, public)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // Metered open STUN
    { urls: 'stun:stun.relay.metered.ca:80' },
    // Metered open TURN relays — required for symmetric NAT / corporate firewalls
    {
      urls: 'turn:global.relay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:global.relay.metered.ca:80?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:global.relay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turns:global.relay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};

import {
  playIncomingRingtone,
  playOutgoingCallRing,
  stopAllCallAudio,
} from './audioManager';

export const playRingtone = playIncomingRingtone;
export const playCallRing = playOutgoingCallRing;
export const stopRingtone = stopAllCallAudio;

export function playCallEndSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(() => ctx.close(), 350);
  } catch {}
}

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream = new MediaStream();
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onLocalStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onSignalCallback: ((signal: any) => void) | null = null;
  private onScreenShareEndedCallback: (() => void) | null = null;
  private isVideoCall = false;

  constructor(
    onRemoteStream: (stream: MediaStream) => void,
    onSignal: (signal: any) => void,
    onLocalStream?: (stream: MediaStream) => void,
    onScreenShareEnded?: () => void
  ) {
    this.onRemoteStreamCallback = onRemoteStream;
    this.onSignalCallback = onSignal;
    this.onLocalStreamCallback = onLocalStream || null;
    this.onScreenShareEndedCallback = onScreenShareEnded || null;
  }

  public async initLocalMedia(isVideo: boolean): Promise<MediaStream> {
    this.stopLocalMedia();
    this.isVideoCall = isVideo;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: isVideo
          ? {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              facingMode: 'user',
              frameRate: { ideal: 30 },
            }
          : false,
      });
      this.localStream = stream;
      if (this.onLocalStreamCallback) {
        this.onLocalStreamCallback(stream);
      }
      return stream;
    } catch (err) {
      console.warn('Could not get video, falling back to audio only:', err);
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.localStream = audioStream;
      if (this.onLocalStreamCallback) {
        this.onLocalStreamCallback(audioStream);
      }
      return audioStream;
    }
  }

  public createPeerConnection(): RTCPeerConnection {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    this.remoteStream = new MediaStream();
    this.pendingCandidates = [];

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.pc = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && this.onSignalCallback) {
        this.onSignalCallback({ type: 'candidate', candidate: event.candidate.toJSON() });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE Connection State:', pc.iceConnectionState);
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] Track received:', event.track.kind, event.streams);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
      } else if (event.track) {
        // Ensure track is in our persistent remote stream
        if (!this.remoteStream.getTracks().some((t) => t.id === event.track.id)) {
          this.remoteStream.addTrack(event.track);
        }
      }

      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    return pc;
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) this.createPeerConnection();
    const offer = await this.pc!.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await this.pc!.setLocalDescription(offer);
    return offer;
  }

  public async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) this.createPeerConnection();
    await this.pc!.setRemoteDescription(new RTCSessionDescription(offer));
    await this.drainPendingCandidates();

    const answer = await this.pc!.createAnswer();
    await this.pc!.setLocalDescription(answer);
    return answer;
  }

  public async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (this.pc) {
      await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
      await this.drainPendingCandidates();
    }
  }

  public async handleCandidate(candidate: RTCIceCandidateInit) {
    if (!candidate) return;

    if (this.pc && this.pc.remoteDescription && this.pc.remoteDescription.type) {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('Error adding ICE candidate directly:', err);
      }
    } else {
      // Queue candidate until setRemoteDescription completes
      this.pendingCandidates.push(candidate);
    }
  }

  private async drainPendingCandidates() {
    if (!this.pc || !this.pc.remoteDescription) return;
    while (this.pendingCandidates.length > 0) {
      const candidate = this.pendingCandidates.shift();
      if (candidate) {
        try {
          await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn('Error adding queued ICE candidate:', err);
        }
      }
    }
  }

  public setAudioEnabled(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  public setVideoEnabled(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  public async toggleScreenShare(isSharing: boolean): Promise<boolean> {
    if (!this.pc || !this.localStream) return false;

    if (isSharing) {
      try {
        const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: true,
          audio: false,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        if (!screenTrack) return false;

        const senders = this.pc.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');

        if (videoSender) {
          await videoSender.replaceTrack(screenTrack);
        } else {
          this.pc.addTrack(screenTrack, this.localStream);
        }

        // Update local stream with screen track for local preview
        const oldVideoTracks = this.localStream.getVideoTracks();
        oldVideoTracks.forEach((t) => this.localStream!.removeTrack(t));
        this.localStream.addTrack(screenTrack);

        if (this.onLocalStreamCallback) {
          this.onLocalStreamCallback(this.localStream);
        }

        screenTrack.onended = () => {
          this.toggleScreenShare(false);
          if (this.onScreenShareEndedCallback) {
            this.onScreenShareEndedCallback();
          }
        };

        return true;
      } catch (err) {
        console.warn('Screen sharing cancelled or failed:', err);
        return false;
      }
    } else {
      try {
        // Restore camera track
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: 'user',
          },
        });
        const cameraTrack = cameraStream.getVideoTracks()[0];

        const senders = this.pc.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(cameraTrack);
        }

        if (this.localStream) {
          const oldVideoTracks = this.localStream.getVideoTracks();
          oldVideoTracks.forEach((t) => {
            t.stop();
            this.localStream!.removeTrack(t);
          });
          this.localStream.addTrack(cameraTrack);
          if (this.onLocalStreamCallback) {
            this.onLocalStreamCallback(this.localStream);
          }
        }
      } catch (err) {
        console.warn('Could not restore camera after screen share:', err);
      }
      return false;
    }
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getRemoteStream(): MediaStream {
    return this.remoteStream;
  }

  public stopLocalMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.localStream = null;
    }
  }

  public cleanup() {
    this.stopLocalMedia();
    this.pendingCandidates = [];
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.remoteStream = new MediaStream();
  }
}
