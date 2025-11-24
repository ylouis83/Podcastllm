import Episode from "./episode";
import Audio from "./audio";
import Transcript from "./transcript";
import React, { useEffect } from "react";
import { BASE_URL } from "@/lib/constant";
import { useStreamText } from "@/hooks/useStreamText";
import { useAudioGeneration } from "@/hooks/useTaskData";

interface ContentProps {
  summaryTextChunks: string[];
  isSummaryLoading: boolean;
  summaryError: string | null;
  isSummaryDone: boolean;
  podInfoData: {
    title: string;
    host_name: string;
  };
  isPodInfoLoading: boolean;
  podInfoError: string | null;
  isPodInfoDone: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  formData: FormData
  activeTab: string;
  setActiveTab: (activeTab: string) => void;
  mobileMenu?:React.ReactNode;
}
export default function Content({
  formData,
  podInfoData,
  isPodInfoLoading,
  podInfoError,
  summaryTextChunks,
  isSummaryLoading,
  summaryError,
  isSummaryDone,
  setIsGenerating,
  activeTab,
  setActiveTab,
  mobileMenu
}:ContentProps ) {
  const {
    error: audioError,
    isLoading: isAudioLoading,
    generateAudio,
    audioUrl: audioData
  } = useAudioGeneration();

  const {
    textChunks: transcriptTextChunks,
    finalResult: transcriptFinalResult,
    error: transcriptError,
    isLoading: transcriptIsLoading,
    isDone: transcriptIsDone,
    fetchStreamText: transcriptFetchStreamText
  } = useStreamText();

  useEffect(() => {
    if (isSummaryDone && !summaryError) {
      transcriptFetchStreamText(`${BASE_URL}/generate_transcript`, formData);
      setActiveTab("transcript");
    }
  }, [isSummaryDone]);
  

  useEffect(() => {
    (async () => {
      if (transcriptFinalResult) {
        const audioFormData = new FormData();
        audioFormData.append('text', transcriptFinalResult.content);
        audioFormData.append('language', formData.get('language') as string);
        audioFormData.append('host_voice', formData.get('hostVoice') as string);
        audioFormData.append('guest_voice', formData.get('guestVoice') as string);
        audioFormData.append('provider', formData.get('provider') as string);

        generateAudio(audioFormData)
      }
    })()
  }, [transcriptFinalResult])

  useEffect(() => {
    if ((audioData)
        || audioError
        || summaryError
        || podInfoError
        || transcriptError
      ) {
      setIsGenerating(false);
    }
  }, [audioData, audioError, summaryError, podInfoError, transcriptError]);

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="flex-shrink-0 flex-basis-auto">
        <Episode
          isPodInfoLoading={isPodInfoLoading}
          podInfoError={podInfoError}
          podInfoData={podInfoData}
          mobileMenu={mobileMenu}
        />
      </div>
      <div className="flex-1 overflow-hidden h-1">
        <Transcript
          isSummaryLoading={isSummaryLoading}
          summaryError={summaryError}
          summaryTextChunk={summaryTextChunks}
          isSummaryDone={isSummaryDone}
          transcriptTextChunks={transcriptTextChunks}
          transcriptError={transcriptError}
          transcriptIsLoading={transcriptIsLoading}
          transcriptIsDone={transcriptIsDone}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      <div className="flex-shrink-0 flex-basis-auto">
        <Audio
          audioError={audioError}
          audioUrl={audioData}
          isAudioLoading={isAudioLoading}
        />
      </div>
    </div>
  );
}
