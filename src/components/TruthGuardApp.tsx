
"use client";

import React, { useState, useTransition } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Link2, Image as ImageIcon, FileText, AlertTriangle, UploadCloud } from 'lucide-react';
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
          title: "Error: File Too Large",
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
            toast({ title: "Input Error", description: "URL input cannot be empty.", variant: "destructive" });
            return;
          }
          try {
            new URL(urlInput);
          } catch (_) {
            setAppState({ isLoading: false, resultData: null, error: "Invalid URL format. Please include http(s)://" });
            toast({ title: "Input Error", description: "Invalid URL format. Please include http(s)://", variant: "destructive" });
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
            toast({ title: "Input Error", description: "Please select an image file.", variant: "destructive" });
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
            toast({ title: "Input Error", description: "Text input cannot be empty.", variant: "destructive" });
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
        const errorMessage = e.message || "An unexpected error occurred during analysis.";
        setAppState({ isLoading: false, resultData: null, error: errorMessage });
        toast({ title: "Analysis Error", description: errorMessage, variant: "destructive" });
      }
    });
  };


  return (
    <div className="w-full max-w-3xl">
      <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center font-semibold text-primary">Fact-Check Content</CardTitle>
          <CardDescription className="text-center text-muted-foreground text-md">
            Submit a URL, upload an image, or paste text to verify its claims.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(newTab) => { setActiveTab(newTab); setAppState({isLoading: false, resultData: null, error: null }); }} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/60 p-1.5 rounded-lg">
              <TabsTrigger value="url" className="text-base py-2.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-md font-medium">
                <Link2 className="mr-2 h-5 w-5" /> URL
              </TabsTrigger>
              <TabsTrigger value="image" className="text-base py-2.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-md font-medium">
                <ImageIcon className="mr-2 h-5 w-5" /> Image
              </TabsTrigger>
              <TabsTrigger value="text" className="text-base py-2.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-md font-medium">
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
                  className="text-base p-3 h-12 rounded-lg focus:ring-primary/80 focus:border-primary"
                  aria-label="Article URL"
                />
              </div>
            </TabsContent>
            <TabsContent value="image">
              <div className="space-y-4">
                <label htmlFor="image-upload" className="block w-full cursor-pointer">
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-primary/70 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors min-h-[120px]">
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {imageFile ? imageFile.name : "Click to upload or drag and drop"}
                    </span>
                    <span className="text-xs text-muted-foreground/80">PNG, JPG, WEBP, GIF up to 5MB</span>
                  </div>
                </label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleImageChange}
                  className="sr-only" // Hidden, triggered by label
                  aria-label="Upload image"
                />
                {imagePreview && (
                  <div className="mt-4 border-2 border-dashed border-border rounded-lg p-2 flex justify-center items-center bg-secondary/20 min-h-[150px]">
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
                  className="text-base p-3 rounded-lg focus:ring-primary/80 focus:border-primary"
                  aria-label="Text input for fact-checking"
                />
              </div>
            </TabsContent>
          </Tabs>
          <Button
            onClick={handleSubmit}
            disabled={appState.isLoading || isPending}
            className="w-full mt-8 text-lg py-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary/50"
            size="lg"
          >
            {(appState.isLoading || isPending) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Verify
          </Button>
        </CardContent>
      </Card>

      {(appState.isLoading || isPending) && (
        <div className="mt-10 text-center flex flex-col items-center p-6 bg-card rounded-xl shadow-lg">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground font-medium">Analyzing content, please wait...</p>
          <p className="text-sm text-muted-foreground/80 mt-1">This may take a few moments.</p>
        </div>
      )}

      {appState.error && !appState.isLoading && (
         <Card className="mt-8 w-full bg-destructive/10 border-destructive shadow-md rounded-xl">
          <CardHeader className="flex flex-row items-center gap-3 p-5">
            <AlertTriangle className="h-7 w-7 text-destructive" />
            <CardTitle className="text-xl text-destructive">Analysis Error</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-destructive">{appState.error}</p>
          </CardContent>
        </Card>
      )}

      {appState.resultData && !appState.isLoading && !appState.error && (
        <FactCheckResultDisplay {...appState.resultData} />
      )}
    </div>
  );
}
