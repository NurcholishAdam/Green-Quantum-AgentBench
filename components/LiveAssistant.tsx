
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { encodeAudio, decodeAudio, decodeAudioData } from '../services/geminiService';

const LiveAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [vibe, setVibe] = useState<'idle' | 'listening' | 'speaking'>('idle');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setVibe('idle');
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    // Use process.env.API_KEY directly as required by guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            setVibe('listening');
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encodeAudio(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + ' ' + message.serverContent?.outputTranscription?.text);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setVibe('speaking');
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decodeAudio(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setVibe('listening');
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) {
                s.stop();
                sourcesRef.current.delete(s);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => {
            console.error("Live session error", e);
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: 'You are the Green Supervisor for AgentBench. You help users understand sustainable AI metrics. You are concise, technical, and helpful.',
          outputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start Live session", err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-6 pointer-events-none">
       
       {isActive && (
         <div className="w-80 bg-[#0d0d0d]/90 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl pointer-events-auto animate-in slide-in-from-bottom-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Supervisor_Live</span>
              </div>
              <button onClick={stopSession} className="text-gray-500 hover:text-white transition-colors">
                 <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="flex justify-center py-8">
               <div className="relative flex items-center justify-center">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`absolute w-16 h-16 rounded-full border-2 border-emerald-500/20 transition-all duration-700 ${vibe === 'speaking' ? 'animate-ping' : vibe === 'listening' ? 'scale-110 opacity-40' : 'opacity-0'}`} 
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                  ))}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${vibe === 'speaking' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-white/5 text-emerald-500 border border-white/10'}`}>
                     <i className={`fa-solid ${vibe === 'speaking' ? 'fa-waveform-lines' : 'fa-microphone'}`}></i>
                  </div>
               </div>
            </div>

            <div className="mt-6 space-y-4">
               <div className="text-center text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  {vibe === 'listening' ? 'Listening to Core...' : vibe === 'speaking' ? 'Generating Response...' : 'Connecting...'}
               </div>
               <div className="max-h-24 overflow-y-auto custom-scrollbar text-[11px] text-gray-400 font-serif italic text-center leading-relaxed">
                  {transcription || "Awaiting audio input..."}
               </div>
            </div>
         </div>
       )}

       <button 
         onClick={isActive ? stopSession : startSession}
         disabled={isConnecting}
         className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all active:scale-90 pointer-events-auto ${isActive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-600 text-white shadow-emerald-500/20'}`}
       >
          {isConnecting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className={`fa-solid ${isActive ? 'fa-phone-slash' : 'fa-headset'}`}></i>}
       </button>
    </div>
  );
};

export default LiveAssistant;
