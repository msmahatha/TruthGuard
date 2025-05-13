
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { AlertCircle, CheckCircle2, FileText as FileTextIcon, Link as LinkIcon, Image as ImageIconLucide, HelpCircle } from 'lucide-react';
import FactCheckResultCard from './FactCheckResultCard';
import type { FactCheckImageOutput } from '@/ai/flows/fact-check-image';
import type { SummarizeArticleOutput } from '@/ai/flows/summarize-article';
import type { FactCheckTextOutput } from '@/ai/flows/fact-check-text';
import type { ClaimFactCheckResult } from '@/ai/schemas/claim-fact-check-schema';

export interface FactCheckResultItem extends ClaimFactCheckResult {
  details?: string; 
}

export type FactCheckResultDisplayProps = 
  | { type: 'url'; data: SummarizeArticleOutput }
  | { type: 'image'; data: FactCheckImageOutput }
  | { type: 'text'; data: FactCheckTextOutput };

export default function FactCheckResultDisplay(props: FactCheckResultDisplayProps) {
  const resultsToDisplay: FactCheckResultItem[] = [];
  let summary: string | undefined = undefined;
  let keyClaims: string[] | undefined = undefined;
  let analysisTitle = "Analysis Results";
  let iconToDisplay : React.ReactNode = <CheckCircle2 className="h-10 w-10 text-primary" />;

  if (props.type === 'url' && props.data) {
    const urlData = props.data;
    summary = urlData.summary;
    keyClaims = urlData.keyClaims;
    urlData.factChecks?.forEach(fc => {
      resultsToDisplay.push(fc);
    });
    analysisTitle = "URL Analysis";
    iconToDisplay = <LinkIcon className="h-10 w-10 text-primary" />;
  } else if (props.type === 'image' && props.data) {
    const imageData = props.data;
    imageData.results?.forEach(r => {
      resultsToDisplay.push(r);
    });
    analysisTitle = "Image Analysis";
    iconToDisplay = <ImageIconLucide className="h-10 w-10 text-primary" />;
  } else if (props.type === 'text' && props.data) {
    const textData = props.data;
    textData.results?.forEach(r => {
      resultsToDisplay.push(r);
    });
    analysisTitle = "Text Analysis";
    iconToDisplay = <FileTextIcon className="h-10 w-10 text-primary" />;
  }

  const noData = !props.data || (props.data as any).results?.length === 0 && props.type !== 'url';
  const noUrlData = props.type === 'url' && (!props.data || (!props.data.summary && (!props.data.keyClaims || props.data.keyClaims.length === 0) && (!props.data.factChecks || props.data.factChecks.length === 0)));


  if (noData || noUrlData) {
    let noResultsMessage = "The analysis did not yield any specific claims or results to display.";
    if (props.type === 'text' && props.data && (props.data as FactCheckTextOutput).results.length === 0) {
        noResultsMessage = "No verifiable claims were identified in the provided text, or the text was too ambiguous for analysis."
    } else if (props.type === 'image' && props.data && (props.data as FactCheckImageOutput).results.length === 0) {
        noResultsMessage = "No verifiable claims were identified in the provided image, or the text within was too ambiguous for analysis."
    } else if (props.type === 'url' && noUrlData) {
        noResultsMessage = "Could not analyze the URL. Please ensure it's a valid and accessible article. Sometimes, websites may block automated access.";
    }


    return (
      <Card className="mt-8 w-full shadow-lg rounded-xl bg-card">
        <CardHeader className="p-5">
           <div className="flex items-center space-x-3">
            <AlertCircle className="h-7 w-7 text-muted-foreground" />
            <CardTitle className="text-xl text-foreground">No Results Found</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <p className="text-muted-foreground">{noResultsMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 w-full shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl">
      <CardHeader className="p-6">
        <div className="flex items-center space-x-4">
          {iconToDisplay}
          <CardTitle className="text-3xl font-semibold text-primary">{analysisTitle}</CardTitle>
        </div>
        <CardDescription className="text-md text-muted-foreground mt-1">Detailed breakdown of the fact-checking process.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6">
        {props.type === 'url' && summary && summary.trim() && (
          <div className="bg-secondary/40 p-5 rounded-lg shadow-inner space-y-2">
            <h3 className="text-xl font-semibold text-primary mb-2">Article Summary</h3>
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{summary}</p>
          </div>
        )}

        {props.type === 'url' && keyClaims && keyClaims.length > 0 && (
          <div className="bg-secondary/40 p-5 rounded-lg shadow-inner space-y-2">
            <h3 className="text-xl font-semibold text-primary mb-2">Key Claims Extracted</h3>
            <ul className="list-disc list-inside space-y-1.5 text-foreground pl-2">
              {keyClaims.map((claim, index) => (
                <li key={`keyclaim-${index}`} className="leading-relaxed">{claim}</li>
              ))}
            </ul>
          </div>
        )}
        
        {(resultsToDisplay.length > 0 || (props.type === 'url' && (props.data.summary || props.data.keyClaims?.length > 0))) && resultsToDisplay.length === 0 && (
             <div className="bg-secondary/40 p-5 rounded-lg shadow-inner space-y-2">
                <div className="flex items-center space-x-2">
                    <HelpCircle className="h-5 w-5 text-muted-foreground"/>
                    <h3 className="text-lg font-medium text-muted-foreground">No Specific Claims Fact-Checked</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                    While a summary or key points might be available, no specific claims were identified for individual fact-checking in this analysis, or they could not be processed.
                </p>
             </div>
        )}


        {resultsToDisplay.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold text-primary mb-4 mt-6">Fact-Checked Claims</h3>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {resultsToDisplay.map((item, index) => (
                <FactCheckResultCard key={`factcheck-${index}-${item.claim.substring(0, 30)}`} item={item} />
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-6 py-4 border-t">
        <p className="text-xs text-muted-foreground">
          TruthGuard provides AI-driven analysis. Always cross-verify critical information with multiple trusted sources. AI responses can sometimes be inaccurate.
        </p>
      </CardFooter>
    </Card>
  );
}
