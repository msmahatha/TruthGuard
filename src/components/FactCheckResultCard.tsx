
"use client";

import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink, HelpCircleIcon } from 'lucide-react';
import type { FactCheckResultItem } from './FactCheckResultDisplay';

interface FactCheckResultCardProps {
  item: FactCheckResultItem;
}

export default function FactCheckResultCard({ item }: FactCheckResultCardProps) {
  const score = item.confidenceScore !== undefined ? Math.round(item.confidenceScore * 100) : null;
  
  let scoreColorClass = "bg-primary"; 
  let statusIcon = <HelpCircleIcon className="h-6 w-6 text-muted-foreground" />;
  let statusText = "Uncertain";
  let statusVariant: "default" | "secondary" | "destructive" | "outline" | "accent" = "secondary";

  if (item.isTrue === true) {
    statusIcon = <CheckCircle2 className="h-6 w-6 text-accent" />;
    statusText = "Verified";
    statusVariant = "accent";
    if (score !== null && score >= 70) scoreColorClass = "bg-accent"; 
    else if (score !== null && score >= 40) scoreColorClass = "bg-yellow-500"; 
    else scoreColorClass = "bg-orange-500";
  } else if (item.isTrue === false) {
    statusIcon = <XCircle className="h-6 w-6 text-destructive" />;
    statusText = "Debunked";
    statusVariant = "destructive";
    if (score !== null && score >= 70) scoreColorClass = "bg-destructive"; 
    else if (score !== null && score >=40) scoreColorClass = "bg-orange-500";
    else scoreColorClass = "bg-yellow-500"; 
  } else { // isTrue is undefined or null
    if (score !== null) { // Confidence score exists but truth value is uncertain
        if (score >= 70) { scoreColorClass = "bg-sky-500"; statusText="Likely True (Uncertain)"; statusVariant="default"; statusIcon = <CheckCircle2 className="h-6 w-6 text-sky-500" />;}
        else if (score >= 40) { scoreColorClass = "bg-yellow-500"; statusText="Uncertain"; statusVariant="secondary"; statusIcon = <AlertTriangle className="h-6 w-6 text-yellow-500" />;}
        else { scoreColorClass = "bg-orange-500"; statusText="Likely False (Uncertain)"; statusVariant="outline"; statusIcon = <XCircle className="h-6 w-6 text-orange-500" />;}
    } else { // No truth value, no score
        scoreColorClass = "bg-muted";
        statusText = "Not Assessed";
        statusVariant = "secondary";
        statusIcon = <HelpCircleIcon className="h-6 w-6 text-muted-foreground" />;
    }
  }


  return (
    <AccordionItem 
      value={item.claim} 
      className="bg-card border border-border rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
    >
      <AccordionTrigger className="p-5 hover:bg-secondary/70 transition-colors text-left group rounded-t-xl data-[state=open]:rounded-b-none data-[state=open]:border-b data-[state=open]:border-border">
        <div className="flex items-start space-x-4 w-full">
          <span className="shrink-0 pt-0.5">{statusIcon}</span>
          <span className="flex-1 font-semibold text-card-foreground text-md group-hover:text-primary transition-colors">{item.claim}</span>
          <Badge variant={statusVariant} className="whitespace-nowrap ml-auto text-xs py-1 px-2.5">{statusText}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-5 pt-4 bg-secondary/30 rounded-b-xl">
        <div className="space-y-4">
          {score !== null && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-muted-foreground">Confidence Score:</span>
                <span className={`text-sm font-bold ${scoreColorClass.replace('bg-','text-')}`}>{score}%</span>
              </div>
              <Progress value={score} className={`h-2.5 ${scoreColorClass}`} />
            </div>
          )}

          {item.reason && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Reasoning:</h4>
              <p className="text-sm text-card-foreground bg-card/70 p-3 rounded-md shadow-sm">{item.reason}</p>
            </div>
          )}

          {item.source && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Source Basis:</h4>
              {item.source.startsWith('http') || item.source.startsWith('www.') ? (
                <a
                  href={item.source.startsWith('http') ? item.source : `https://${item.source}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary/80 hover:underline font-medium flex items-center group/link"
                >
                  {item.source}
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-70 group-hover/link:opacity-100 transition-opacity" />
                </a>
              ) : (
                 <p className="text-sm text-card-foreground bg-card/70 p-3 rounded-md shadow-sm">{item.source}</p>
              )}
            </div>
          )}
          
          {item.details && (
             <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Additional Details:</h4>
              <p className="text-sm text-card-foreground bg-card/70 p-3 rounded-md shadow-sm">{item.details}</p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
