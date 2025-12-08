import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Link, FileText, Mic, Clock, Globe, Sparkles, AudioLines, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useSpeeker } from "@/hooks/useSpeeker";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "@/hooks/use-toast"
import { BASE_URL } from "@/lib/constant";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 5MB in bytes
const DEMO_PDF_URL = "/demo.pdf"; // 替换为你的演示 PDF 文件的实际路径

export default function Menu({ handleGenerate, className, isGenerating }: { className?: string, handleGenerate: (formData: FormData) => void, isGenerating: boolean }) {
  const { toast } = useToast()

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [tone, setTone] = useState("neutral");
  const [duration, setDuration] = useState("short");
  const [language, setLanguage] = useState("Chinese");
  const [hostVoice, setHostVoice] = useState("zh-CN-YunxiNeural");
  const [guestVoice, setGuestVoice] = useState("zh-CN-YunzeNeural");
  const [provider, setProvider] = useState("azure");
  const [fileError, setFileError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [mode,setMode] = useState<"pdf"|"url">("pdf");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const speekerReq = useSpeeker()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError("File size exceeds 5MB limit.");
        setPdfFile(null);
      } else {
        setFileError(null);
        setPdfFile(file);
      }
    }
  };

  const handleDemoPdfClick = async () => {
    try {
      const response = await fetch(DEMO_PDF_URL);
      const blob = await response.blob();
      const file = new File([blob], "demo.pdf", { type: "application/pdf" });
      setPdfFile(file);
      setFileError(null);
    } catch (error) {
      console.error("Error loading demo PDF:", error);
      setFileError("Failed to load demo PDF.");
    }
  };

  const toWhisperLanguage = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (normalized.startsWith("chinese")) {
      return "zh";
    }
    if (normalized.startsWith("english")) {
      return "en";
    }
    return value;
  };

  const handleAudioFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("language", toWhisperLanguage(language));

    setIsTranscribing(true);
    setTranscribeError(null);
    setTranscribedText(null);
    try {
      const response = await fetch(`${BASE_URL}/transcribe_audio`, {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.detail || "音频转写失败";
        throw new Error(message);
      }

      const transcript = (payload?.text as string | undefined)?.trim();
      if (!transcript) {
        throw new Error("未获取到转写结果");
      }
      setTextInput(prev => prev ? `${prev}
${transcript}` : transcript);
      setTranscribedText(transcript);
      toast({
        title: "转写成功",
        description: "音频内容已写入问题输入框。",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "音频转写失败";
      setTranscribeError(message);
      toast({
        title: "音频转写失败",
        variant: "destructive",
        description: message,
      });
    } finally {
      setIsTranscribing(false);
      if (audioInputRef.current) audioInputRef.current.value = "";
    }
  };

  const handleVideoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("language", toWhisperLanguage(language));

    setIsTranscribing(true);
    setTranscribeError(null);
    setTranscribedText(null);
    try {
      const response = await fetch(`${BASE_URL}/transcribe_video`, {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.detail || "视频转写失败";
        throw new Error(message);
      }

      const transcript = (payload?.text as string | undefined)?.trim();
      if (!transcript) {
        throw new Error("未获取到转写结果");
      }
      setTextInput(prev => prev ? `${prev}
${transcript}` : transcript);
      setTranscribedText(transcript);
      toast({
        title: "转写成功",
        description: "视频内容已提取并写入问题输入框。",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "视频转写失败";
      setTranscribeError(message);
      toast({
        title: "视频转写失败",
        variant: "destructive",
        description: message,
      });
    } finally {
      setIsTranscribing(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };


  const handleSubmit = () => {
    const formData = new FormData();
    if (mode === "pdf") {
      if (pdfFile) {
        formData.append("pdfFile", pdfFile);
      }
    } else {
      formData.append("url", url);
    }
    formData.append("textInput", textInput);
    formData.append("tone", tone);
    formData.append("duration", duration);
    formData.append("language", language);
    formData.append("mode", mode);
    formData.append("host_voice", hostVoice);
    formData.append("guest_voice", guestVoice);
    formData.append("provider", provider);

    handleGenerate(formData);
  };

  return (
    <div className={`w-80 h-full flex flex-col p-6 overflow-y-auto ${className} bg-[rgb(249,250,251)] border-r border-[rgb(229,231,235)] custom-scrollbar`}>
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 flex items-center">
        <Sparkles className="w-6 h-6 mr-2 text-blue-500" />
        PodCastLM
      </h1>

      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center"><FileText className="mr-2 text-gray-600" size={20} /> 输入源</h2>
          <Tabs defaultValue="pdf" className="w-full" onValueChange={(val)=>setMode(val as "pdf"|"url")}>
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gray-200 p-1">
              <TabsTrigger value="pdf" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 transition-all">PDF文档</TabsTrigger>
              <TabsTrigger value="url" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 transition-all">URL链接</TabsTrigger>
            </TabsList>
            <TabsContent value="pdf" className="mt-3">
              <div
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-300 ease-in-out
                  ${pdfFile ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
                `}
                onClick={() => document.getElementById("pdf-upload")?.click()}
              >
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className={`mx-auto h-10 w-10 mb-2 ${pdfFile ? "text-blue-500" : "text-gray-400"}`} />
                <p className="text-xs text-gray-500">
                  {pdfFile ? pdfFile.name : "点击或拖拽上传 PDF"}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">支持最大 5MB</p>
              </div>
              {fileError && <p className="text-xs text-red-500 mt-1 text-center">{fileError}</p>}
               <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDemoPdfClick();
                }}
              >
                使用演示 PDF
              </Button>
            </TabsContent>
            <TabsContent value="url" className="mt-3">
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="url"
                  placeholder="输入文章链接..."
                  className="pl-9 bg-white border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center"><Mic className="mr-2 text-gray-600" size={20} /> 补充问题 (可选)</h2>
          <Textarea
            placeholder="输入你想问的问题，或者通过语音/视频转写..."
            className="min-h-[80px] bg-white border-gray-200 resize-none rounded-xl focus:ring-blue-500 focus:border-blue-500"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleAudioFileChange}
          />
           <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoFileChange}
          />
          <div className="flex items-center justify-between mt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isTranscribing}
              onClick={() => audioInputRef.current?.click()}
              className="rounded-lg flex-1"
            >
              <AudioLines className="w-4 h-4 mr-2" />
              {isTranscribing ? "语音转写..." : "导入语音"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isTranscribing}
              onClick={() => videoInputRef.current?.click()}
              className="rounded-lg flex-1"
            >
              <Video className="w-4 h-4 mr-2" />
              {isTranscribing ? "视频转写..." : "导入视频"}
            </Button>
          </div>
          {isTranscribing && (
              <p className="text-xs text-gray-500 mt-2 text-center">正在使用本地 Whisper 模型处理媒体文件...</p>
            )}
          {transcribeError && <p className="text-xs text-red-500 mt-1">{transcribeError}</p>}
          {transcribedText && (
            <Card className="mt-4 border-gray-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">最新转写内容</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-800 space-y-2">
                <p className="text-xs text-gray-500">
                  已自动写入问题输入框，你也可以在此检查与复制。
                </p>
                <div className="max-h-36 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3 whitespace-pre-wrap">
                  {transcribedText}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center"><Mic className="mr-2 text-gray-600" size={20} /> 语气</h2>
          <Select onValueChange={setTone}>
            <SelectTrigger className="w-full bg-white border-gray-200 text-gray-800 rounded-xl">
              <SelectValue placeholder="中立" defaultValue={tone} />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 rounded-xl" >
              <SelectItem value="neutral" className="cursor-pointer hover:bg-gray-100">中立</SelectItem>
              <SelectItem value="happy" className="cursor-pointer hover:bg-gray-100">开心</SelectItem>
              <SelectItem value="sad" className="cursor-pointer hover:bg-gray-100">难过</SelectItem>
              <SelectItem value="excited" className="cursor-pointer hover:bg-gray-100">兴奋</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center"><Clock className="mr-2 text-gray-600" size={20} /> 时长</h2>
          <Select onValueChange={setDuration}>
            <SelectTrigger className="w-full bg-white border-gray-200 text-gray-800 rounded-xl">
              <SelectValue placeholder="短对话 (1-2分钟)" defaultValue={duration} />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 rounded-xl">
              <SelectItem value="short" className="cursor-pointer  hover:bg-gray-100">短对话 (1-2分钟)</SelectItem>
              <SelectItem value="medium" className="cursor-pointer hover:bg-gray-100">中对话 (3-5分钟)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center"><Globe className="mr-2 text-gray-600" size={20} /> 语言</h2>
          <Select onValueChange={setLanguage}>
            <SelectTrigger className="w-full bg-white border-gray-200 text-gray-800 rounded-xl">
              <SelectValue placeholder="中文" defaultValue={language} />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 rounded-xl">
              <SelectItem value="English" className="cursor-pointer transition-colors duration-150 ease-in-out hover:bg-gray-100">英文</SelectItem>
              <SelectItem value="Chinese" className="cursor-pointer transition-colors duration-150 ease-in-out hover:bg-gray-100">中文</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {speekerReq.data && <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center"><Globe className="mr-2 text-gray-600" size={20} /> 声音</h2>
          <Card >
            <CardContent className="p-3">
              <h2 className="text-sm font-semibold mb-3 flex items-center">Provider</h2>
              <Select value={provider} onValueChange={newProvider => {
                setProvider(newProvider)
                const voices = speekerReq.data?.[newProvider];
                if (voices) {
                  setHostVoice(voices[0].id)
                  setGuestVoice(voices[1].id)
                }
              }}>
                <SelectTrigger className="w-full bg-white border-gray-200 text-gray-800 rounded-xl">
                  <SelectValue placeholder="Host" defaultValue={provider} />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-xl mt-3">
                  {
                    Object.keys(speekerReq.data ?? {}).map(item => <SelectItem
                      key={item}
                      value={item}
                      className="cursor-pointer transition-colors duration-150 ease-in-out hover:bg-gray-100">{item}</SelectItem>)
                  }
                </SelectContent>
              </Select>
              <h2 className="text-sm font-semibold mb-3 flex items-center">Host</h2>
              <Select value={hostVoice} onValueChange={setHostVoice}>
                <SelectTrigger className="w-full bg-white border-gray-200 text-gray-800 rounded-xl">
                  <SelectValue placeholder="Host" defaultValue={hostVoice} />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-xl">
                  {
                    speekerReq.data?.[provider].map(item => <SelectItem
                      key={item.id}
                      value={item.id}
                      className="cursor-pointer transition-colors duration-150 ease-in-out hover:bg-gray-100">{item.name}</SelectItem>)
                  }
                </SelectContent>
              </Select>
              <h2 className="text-sm font-semibold mb-3 flex items-center">Guest</h2>
              <Select value={guestVoice} onValueChange={setGuestVoice}>
                <SelectTrigger className="w-full bg-white border-gray-200 text-gray-800 rounded-xl">
                  <SelectValue placeholder="Guest" defaultValue={guestVoice} />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-xl">
                  {

                    speekerReq.data?.[provider].map(item => <SelectItem
                      key={item.id}
                      value={item.id}
                      className="cursor-pointer transition-colors duration-150 ease-in-out hover:bg-gray-100">{item.name}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>}
      </div>

      <div className="mt-6">
        <Button
          disabled={isGenerating}
          className={`
            w-full rounded-xl transition-all duration-300 transform hover:scale-105
            flex items-center justify-center space-x-2
            ${isGenerating
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"}
            text-white font-semibold py-3 px-6 shadow-lg hover:shadow-xl
          `}
          onClick={handleSubmit}
        >
          {!isGenerating && <Sparkles className="w-5 h-5" />}
          <span>{isGenerating ? "生成中..." : "生成播客"}</span>
        </Button>
      </div>
    </div>
  );
}

