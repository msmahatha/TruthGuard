"use client";

import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import type { FactCheckResultItem } from './FactCheckResultDisplay';

interface FactCheckResultCardProps {
  item: FactCheckResultItem;
}

export default function FactCheckResultCard({ item }: FactCheckResultCardProps) {
  const score = item.confidenceScore !== undefined ? Math.round(item.confidenceScore * 100) : null;
  
  let scoreColorClass = "bg-primary"; // Default blue
  let statusIcon = <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  let statusText = "Uncertain";
  let statusVariant: "default" | "secondary" | "destructive" | "outline" | "accent" = "default";


  if (item.isTrue === true) {
    statusIcon = <CheckCircle2 className="h-5 w-5 text-accent" />;
    statusText = "Verified";
    statusVariant = "accent";
    if (score !== null && score >= 70) scoreColorClass = "bg-accent"; // Green for high confidence verified
    else if (score !== null && score >= 40) scoreColorClass = "bg-yellow-500"; // Yellow for medium
    else scoreColorClass = "bg-orange-500"; // Orange for low confidence verified
  } else if (item.isTrue === false) {
    statusIcon = <XCircle className="h-5 w-5 text-destructive" />;
    statusText = "Debunked";
    statusVariant = "destructive";
    if (score !== null && score >= 70) scoreColorClass = "bg-destructive"; // Red for high confidence debunked
    else if (score !== null && score >=40) scoreColorClass = "bg-orange-500"; // Orange for medium
    else scoreColorClass = "bg-yellow-500"; // Yellow for low
  } else {
    // Neutral or uncertain
    if (score !== null) {
        if (score >= 70) { scoreColorClass = "bg-sky-500"; statusText="Likely True"; statusVariant="default"; statusIcon = <CheckCircle2 className="h-5 w-5 text-sky-500" />;}
        else if (score >= 40) { scoreColorClass = "bg-yellow-500"; statusText="Uncertain"; statusVariant="secondary"; statusIcon = <AlertTriangle className="h-5 w-5 text-yellow-500" />;}
        else { scoreColorClass = "bg-orange-500"; statusText="Likely False"; statusVariant="outline"; statusIcon = <XCircle className="h-5 w-5 text-orange-500" />;}
    } else {
        scoreColorClass = "bg-muted";
    }
  }


  return (
    <AccordionItem value={item.claim} className="bg-card border border-border rounded-lg shadow-md overflow-hidden">
      <AccordionTrigger className="p-4 hover:bg-secondary/50 transition-colors text-left">
        <div className="flex items-center space-x-3 w-full">
          <span className="shrink-0">{statusIcon}</span>
          <span className="flex-1 font-medium text-card-foreground text-base">{item.claim}</span>
          <Badge variant={statusVariant} className="whitespace-nowrap ml-auto text-xs">{statusText}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0 border-t border-border bg-background/50">
        <div className="space-y-3 mt-3">
          {score !== null && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-muted-foreground">Confidence Score:</span>
                <span className={`text-sm font-semibold ${scoreColorClass.replace('bg-','text-')}`}>{score}%</span>
              </div>
              <Progress value={score} className={`h-2 ${scoreColorClass}`} />
            </div>
          )}

          {item.reason && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Reasoning:</h4>
              <p className="text-sm text-card-foreground bg-muted/30 p-2 rounded-md">{item.reason}</p>
            </div>
          )}

          {item.source && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Source:</h4>
              <a
                href={item.source.startsWith('http') ? item.source : `//${item.source}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center group"
              >
                {item.source}
                <ExternalLink className="ml-1 h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          )}
          
          {item.details && (
             <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Additional Details:</h4>
              <p className="text-sm text-card-foreground bg-muted/30 p-2 rounded-md">{item.details}</p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
