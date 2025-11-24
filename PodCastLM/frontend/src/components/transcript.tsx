import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Podcast } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useEffect, useRef } from "react";
import DialogueList from "./dialog-list";

interface TranscriptProps {
  isSummaryLoading: boolean;
  summaryError: string | null;
  summaryTextChunk: string[];
  isSummaryDone: boolean;
  transcriptTextChunks: string[];
  transcriptError: string | null;
  transcriptIsLoading: boolean;
  transcriptIsDone: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
export default function Transcript({
  isSummaryLoading,
  summaryError,
  summaryTextChunk,
  transcriptTextChunks,
  transcriptError,
  transcriptIsLoading,
  activeTab,
  setActiveTab
}: TranscriptProps) {
  const summaryContentRef = useRef<HTMLDivElement>(null);
  const transcriptContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (summaryContentRef.current) {
      summaryContentRef.current.scrollTop = summaryContentRef.current.scrollHeight;
    }
  }, [summaryTextChunk]);

  useEffect(() => {
    if (transcriptContentRef.current) {
      transcriptContentRef.current.scrollTop = transcriptContentRef.current.scrollHeight;
    }
  }, [transcriptTextChunks]);

  return (
    <div className="w-full p-2 md:px-12 md:py-6 overflow-hidden h-full ">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        <div className="flex justify-center mb-4">
          <TabsList className="inline-flex bg-gray-200 rounded-xl p-1">
            <TabsTrigger 
              value="summary" 
              className="data-[state=active]:bg-white rounded-[5px] m-1"
            >
              总结
            </TabsTrigger>
            <TabsTrigger 
              value="transcript" 
              className="data-[state=active]:bg-white rounded-[5px] m-1"
            >
              脚本
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent className="flex-1 h-1" value="summary">
          <Card  ref={summaryContentRef} className="p-2 h-full md:p-8 bg-[rgb(249,249,249)] overflow-y-auto">
            <CardContent  
            >
              {
                renderContent(
                  isSummaryLoading,
                  summaryError,
                  summaryTextChunk,
                )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent className="flex-1 h-1" value="transcript">
          <Card  ref={transcriptContentRef} className="p-2 h-full md:p-8 bg-[rgb(249,249,249)] overflow-y-auto" >
            <CardContent >
              <DialogueList
                textChunks={transcriptTextChunks}
                transcriptError={transcriptError}
                transcriptIsLoading={transcriptIsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function renderContent(isLoading: boolean, error: string | null, textChunks: string[]) {
  return (
    <>
      {isLoading ? (
        <div className="space-y-4 p-8">
          <Skeleton className="h-6 w-full rounded-xl" />
          <Skeleton className="h-6 w-3/4 rounded-xl" />
          <Skeleton className="h-6 w-5/6 rounded-xl" />
          <Skeleton className="h-6 w-2/3 rounded-xl" />
          <Skeleton className="h-6 w-2/3 rounded-xl" />
          <Skeleton className="h-6 w-2/3 rounded-xl" />
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="flex items-center space-x-4" key={index}>
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-[250px] rounded-xl" />
                </div>
              </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive" className="p-8 bg-red-100 text-red-700 flex items-center justify-center">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "An error occurred while loading the summary."}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="prose max-w-none h-full">
          {textChunks.length > 0 ? (
            <ReactMarkdown>{textChunks.join('')}</ReactMarkdown>
          ) : (
            <div className="relative flex flex-col items-center justify-center h-full text-center relative overflow-hidden">
              <div className="transform transition-all duration-500">
                <div className="group flex items-center justify-center">
                  <Podcast className="w-16 h-16 text-gray-400 transition-all duration-300  group-hover:rotate-12" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3 animate-fade-in-up">暂无总结</h3>
                <p className="text-gray-600 mb-6 max-w-md animate-fade-in-up animation-delay-150">
                   快来生成一个吧～
                </p>
              </div>
            </div>
          )}
        </div>
      )
    }
    </>
  )
}
