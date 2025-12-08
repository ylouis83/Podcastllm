import { useState } from "react";
import Content from "./components/content";
import Menu from "./components/menu";
import { useJsonData } from "./hooks/useJsonData";
import { useStreamText } from "./hooks/useStreamText";
import { BASE_URL } from "./lib/constant";
import MobileMenu from "./components/mobile-menu";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [activeTab, setActiveTab] = useState("summary");

  const {
    textChunks: summaryTextChunks,
    finalResult: summaryFinalResult,
    error: summaryError,
    isLoading: isSummaryLoading,
    isDone: isSummaryDone,
    fetchStreamText: fetchSummaryText
  } = useStreamText();

  const {
    data: podInfoData,
    error: podInfoError,
    isLoading: isPodInfoLoading,
    fetchJsonData: fetchPodInfo,
  } = useJsonData();

  const cloneFormData = (source: FormData) => {
    const target = new FormData();
    for (const [key, value] of source.entries()) {
      if (value instanceof File) {
        target.append(key, value, value.name);
        continue;
      }
      if (value && typeof value === "object" && "size" in value && "type" in value) {
        const blob = value as Blob & { name?: string };
        const name = "name" in blob && blob.name ? blob.name : "file";
        target.append(key, blob, name);
        continue;
      }
      target.append(key, String(value));
    }
    return target;
  };

  const handleGenerate = async (formData: FormData) => {
    setIsGenerating(true);
    const preservedForm = cloneFormData(formData);
    setFormData(preservedForm);
    setActiveTab("summary");

    const podInfoForm = cloneFormData(preservedForm);
    const summaryForm = cloneFormData(preservedForm);

    fetchPodInfo(`${BASE_URL}/pod_info`, podInfoForm);
    fetchSummaryText(`${BASE_URL}/summarize`, summaryForm);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toaster />
      <main className="flex-grow flex bg-[rgb(245,245,245)] h-full">
        <Menu
          className="hidden md:flex"
          handleGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
        <Content
          summaryTextChunks={summaryTextChunks}
          summaryFinalResult={summaryFinalResult}
          isSummaryLoading={isSummaryLoading}
          summaryError={summaryError}
          isSummaryDone={isSummaryDone}
          isPodInfoLoading={isPodInfoLoading}
          podInfoError={podInfoError}
          // @ts-ignore
          podInfoData={podInfoData?.content}
          setIsGenerating={setIsGenerating}
          formData={formData!}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenu={
            <MobileMenu
              handleGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          }
        />
      </main>
    </div>
  );
}

export default App;

