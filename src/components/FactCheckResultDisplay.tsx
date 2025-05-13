"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import FactCheckResultCard from './FactCheckResultCard';
import type { FactCheckImageOutput, FactCheckImageInput } from '@/ai/flows/fact-check-image'; // FactCheckImageInput not used here
import type { SummarizeArticleOutput, SummarizeArticleInput } from '@/ai/flows/summarize-article'; // SummarizeArticleInput not used here

export interface FactCheckResultItem {
  claim: string;
  confidenceScore?: number;
  source?: string;
  isTrue?: boolean;
  reason?: string;
  details?: string; // Generic details if needed
}

export type FactCheckResultDisplayProps = 
  | { type: 'url'; data: SummarizeArticleOutput }
  | { type: 'image'; data: FactCheckImageOutput }
  | { type: 'text'; message: string };

export default function FactCheckResultDisplay(props: FactCheckResultDisplayProps) {
  if (props.type === 'text') {
    return (
      <Card className="mt-8 w-full shadow-lg bg-secondary/50">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Info className="h-7 w-7 text-primary" />
            <CardTitle className="text-xl">Text Analysis Result</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">{props.message}</p>
        </CardContent>
      </Card>
    );
  }
  
  const resultsToDisplay: FactCheckResultItem[] = [];
  let summary: string | undefined = undefined;
  let keyClaims: string[] | undefined = undefined;

  if (props.type === 'url' && props.data) {
    const urlData = props.data as SummarizeArticleOutput;
    summary = urlData.summary;
    keyClaims = urlData.keyClaims;
    urlData.factChecks?.forEach(fc => {
      resultsToDisplay.push({
        claim: fc.claim,
        confidenceScore: fc.confidenceScore,
        source: fc.source,
        isTrue: fc.isTrue,
        reason: fc.reason,
      });
    });
  } else if (props.type === 'image' && props.data) {
    const imageData = props.data as FactCheckImageOutput;
    imageData.results?.forEach(r => {
      resultsToDisplay.push({
        claim: r.claim,
        confidenceScore: r.confidenceScore,
        source: r.source,
      });
    });
  }

  if (resultsToDisplay.length === 0 && !summary && !keyClaims) {
    return (
      <Card className="mt-8 w-full shadow-lg">
        <CardHeader>
           <div className="flex items-center space-x-3">
            <AlertCircle className="h-7 w-7 text-muted-foreground" />
            <CardTitle className="text-xl">No Results</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">The analysis did not yield any specific claims or results to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 w-full shadow-xl">
      <CardHeader>
        <div className="flex items-center space-x-3">
          {props.type === 'url' && <CheckCircle2 className="h-8 w-8 text-accent" />}
          {props.type === 'image' && <CheckCircle2 className="h-8 w-8 text-accent" />}
          <CardTitle className="text-2xl">Analysis Results</CardTitle>
        </div>
        <CardDescription>Detailed breakdown of the fact-checking process.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {summary && (
          <div className="p-4 bg-secondary/30 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-primary mb-2">Summary</h3>
            <p className="text-foreground whitespace-pre-wrap">{summary}</p>
          </div>
        )}

        {keyClaims && keyClaims.length > 0 && (
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
                <FactCheckResultCard key={`factcheck-${index}`} item={item} />
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
