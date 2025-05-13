"use client";

import React, { useState, useTransition } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Link2, Image as ImageIcon, FileText, AlertTriangle } from 'lucide-react';
import { factCheckImageUrlAction, factCheckTextAction, summarizeArticleUrlAction } from '@/app/actions';
import type { FactCheckImageOutput } from '@/ai/flows/fact-check-image';
import type { SummarizeArticleOutput } from '@/ai/flows/summarize-article';
import type { FactCheckTextOutput } from '@/ai/flows/fact-check-text';
import FactCheckResultDisplay, { type FactCheckResultDisplayProps } from '@/components/FactCheckResultDisplay';
import { useToast } from "@/hooks/use-toast";

type AppState = {
  isLoading: boolean;
  resultData: FactCheckResultDisplayProps | null;
  error: string | null;
};

export default function TruthGuardApp() {
  const [activeTab, setActiveTab] = useState<string>("url");
  const [urlInput, setUrlInput] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [appState, setAppState] = useState<AppState>({
    isLoading: false,
    resultData: null,
    error: null,
  });

  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Error",
          description: "Image file size should not exceed 5MB.",
          variant: "destructive",
        });
        event.target.value = ""; // Reset file input
        setImageFile(null);
        setImagePreview(null);
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async () => {
    setAppState({ isLoading: true, resultData: null, error: null });

    startTransition(async () => {
      try {
        if (activeTab === "url") {
          if (!urlInput.trim()) {
            setAppState({ isLoading: false, resultData: null, error: "URL input cannot be empty." });
            toast({ title: "Error", description: "URL input cannot be empty.", variant: "destructive" });
            return;
          }
          try {
            new URL(urlInput);
          } catch (_) {
            setAppState({ isLoading: false, resultData: null, error: "Invalid URL format." });
            toast({ title: "Error", description: "Invalid URL format.", variant: "destructive" });
            return;
          }
          const result = await summarizeArticleUrlAction(urlInput);
          if (result.error) {
            setAppState({ isLoading: false, resultData: null, error: result.error });
          } else {
            setAppState({ isLoading: false, resultData: { type: 'url', data: result.data as SummarizeArticleOutput }, error: null });
          }
        } else if (activeTab === "image") {
          if (!imageFile || !imagePreview) {
            setAppState({ isLoading: false, resultData: null, error: "Please select an image file." });
            toast({ title: "Error", description: "Please select an image file.", variant: "destructive" });
            return;
          }
          const result = await factCheckImageUrlAction(imagePreview);
           if (result.error) {
            setAppState({ isLoading: false, resultData: null, error: result.error });
          } else {
            setAppState({ isLoading: false, resultData: { type: 'image', data: result.data as FactCheckImageOutput }, error: null });
          }
        } else if (activeTab === "text") {
          if (!textInput.trim()) {
            setAppState({ isLoading: false, resultData: null, error: "Text input cannot be empty."});
            toast({ title: "Error", description: "Text input cannot be empty.", variant: "destructive" });
            return;
          }
          const result = await factCheckTextAction(textInput);
           if (result.error) {
            setAppState({ isLoading: false, resultData: null, error: result.error });
          } else {
            setAppState({ isLoading: false, resultData: { type: 'text', data: result.data as FactCheckTextOutput }, error: null });
          }
        }
      } catch (e: any) {
        console.error("Submission error:", e);
        const errorMessage = e.message || "An unexpected error occurred.";
        setAppState({ isLoading: false, resultData: null, error: errorMessage });
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      }
    });
  };


  return (
    <div className="w-full max-w-3xl">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Fact-Check Content</CardTitle>
          <CardDescription className="text-center">
            Submit a URL, upload an image, or paste text to verify its claims.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(newTab) => { setActiveTab(newTab); setAppState({isLoading: false, resultData: null, error: null }); }} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="url" className="text-base py-2.5">
                <Link2 className="mr-2 h-5 w-5" /> URL
              </TabsTrigger>
              <TabsTrigger value="image" className="text-base py-2.5">
                <ImageIcon className="mr-2 h-5 w-5" /> Image
              </TabsTrigger>
              <TabsTrigger value="text" className="text-base py-2.5">
                <FileText className="mr-2 h-5 w-5" /> Text
              </TabsTrigger>
            </TabsList>
            <TabsContent value="url">
              <div className="space-y-4">
                <Input
                  type="url"
                  placeholder="Enter article URL (e.g., https://example.com/news)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="text-base p-3"
                  aria-label="Article URL"
                />
              </div>
            </TabsContent>
            <TabsContent value="image">
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleImageChange}
                  className="text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  aria-label="Upload image"
                />
                {imagePreview && (
                  <div className="mt-4 border border-dashed border-border rounded-md p-4 flex justify-center">
                    <img src={imagePreview} alt="Selected preview" className="max-h-60 rounded-md object-contain" data-ai-hint="user uploaded image" />
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="text">
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste text or a claim here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={6}
                  className="text-base p-3"
                  aria-label="Text input for fact-checking"
                />
              </div>
            </TabsContent>
          </Tabs>
          <Button
            onClick={handleSubmit}
            disabled={appState.isLoading || isPending}
            className="w-full mt-8 text-lg py-6 rounded-lg transition-all duration-150 ease-in-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            {(appState.isLoading || isPending) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Verify
          </Button>
        </CardContent>
      </Card>

      {(appState.isLoading || isPending) && (
        <div className="mt-8 text-center flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-3" />
          <p className="text-lg text-muted-foreground">Analyzing content, please wait...</p>
        </div>
      )}

      {appState.error && !appState.isLoading && (
         <Card className="mt-8 w-full bg-destructive/10 border-destructive">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <CardTitle className="text-destructive">Analysis Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{appState.error}</p>
          </CardContent>
        </Card>
      )}

      {appState.resultData && !appState.isLoading && !appState.error && (
        <FactCheckResultDisplay {...appState.resultData} />
      )}
    </div>
  );
}
