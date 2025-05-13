"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { AlertCircle, CheckCircle2, FileText as FileTextIcon, Link as LinkIcon, Image as ImageIconLucide } from 'lucide-react';
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
  let iconToDisplay : React.ReactNode = <CheckCircle2 className="h-8 w-8 text-accent" />;

  if (props.type === 'url' && props.data) {
    const urlData = props.data;
    summary = urlData.summary;
    keyClaims = urlData.keyClaims;
    urlData.factChecks?.forEach(fc => {
      resultsToDisplay.push(fc);
    });
    analysisTitle = "URL Analysis";
    iconToDisplay = <LinkIcon className="h-8 w-8 text-accent" />;
  } else if (props.type === 'image' && props.data) {
    const imageData = props.data;
    imageData.results?.forEach(r => {
      resultsToDisplay.push(r);
    });
    analysisTitle = "Image Analysis";
    iconToDisplay = <ImageIconLucide className="h-8 w-8 text-accent" />;
  } else if (props.type === 'text' && props.data) {
    const textData = props.data;
    textData.results?.forEach(r => {
      resultsToDisplay.push(r);
    });
    analysisTitle = "Text Analysis";
    iconToDisplay = <FileTextIcon className="h-8 w-8 text-accent" />;
  }

  const noData = !props.data || (props.data as any).results?.length === 0 && props.type !== 'url';
  const noUrlData = props.type === 'url' && (!props.data || (props.data.factChecks.length === 0 && props.data.keyClaims.length === 0 && !props.data.summary));


  if (noData || noUrlData) {
    let noResultsMessage = "The analysis did not yield any specific claims or results to display.";
    if (props.type === 'text' && props.data && props.data.results.length === 0) {
        noResultsMessage = "No verifiable claims were identified in the provided text, or the text was too ambiguous for analysis."
    } else if (props.type === 'image' && props.data && props.data.results.length === 0) {
        noResultsMessage = "No verifiable claims were identified in the provided image, or the text within was too ambiguous for analysis."
    } else if (props.type === 'url' && noUrlData) {
        noResultsMessage = "Could not analyze the URL. Please ensure it's a valid and accessible article.";
    }


    return (
      <Card className="mt-8 w-full shadow-lg">
        <CardHeader>
           <div className="flex items-center space-x-3">
            <AlertCircle className="h-7 w-7 text-muted-foreground" />
            <CardTitle className="text-xl">No Results</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{noResultsMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 w-full shadow-xl">
      <CardHeader>
        <div className="flex items-center space-x-3">
          {iconToDisplay}
          <CardTitle className="text-2xl">{analysisTitle}</CardTitle>
        </div>
        <CardDescription>Detailed breakdown of the fact-checking process.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {props.type === 'url' && summary && (
          <div className="p-4 bg-secondary/30 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-primary mb-2">Summary</h3>
            <p className="text-foreground whitespace-pre-wrap">{summary}</p>
          </div>
        )}

        {props.type === 'url' && keyClaims && keyClaims.length > 0 && (
          <div className="p-4 bg-secondary/30 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-primary mb-2">Key Claims Extracted</h3>
            <ul className="list-disc list-inside space-y-1 text-foreground">
              {keyClaims.map((claim, index) => (
                <li key={`keyclaim-${index}`}>{claim}</li>
              ))}
            </ul>
          </div>
        )}
        
        {resultsToDisplay.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-4">Fact-Checked Claims</h3>
            <Accordion type="single" collapsible className="w-full space-y-3">
              {resultsToDisplay.map((item, index) => (
                <FactCheckResultCard key={`factcheck-${index}-${item.claim.substring(0, 20)}`} item={item} />
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          TruthGuard provides AI-driven analysis. Always cross-verify critical information with multiple trusted sources.
        </p>
      </CardFooter>
    </Card>
  );
}
