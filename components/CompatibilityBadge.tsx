"use client";


import { useState } from "react";


export interface ScoreBreakdown {
  age: number;
  religion: number;
  casteGotra: number;
  location: number;
  education: number;
  income: number;
  diet: number;
  lifestyle: number;
  familyType: number;
  hobbies: number;
  motherTongue: number;
}


interface CompatibilityBadgeProps {
  score: number;
  breakdown?: ScoreBreakdown;
  size?: "sm" | "md" | "lg";
}


function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-gray-400";
}


function getScoreTextColor(score: number): string {
  if (score >= 80) return "text-green-700";
  if (score >= 60) return "text-amber-700";
  return "text-gray-600";
}


function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-50 border-green-200";
  if (score >= 60) return "bg-amber-50 border-amber-200";
  return "bg-gray-50 border-gray-200";
}


const DIMENSION_LABELS: Record<keyof ScoreBreakdown, string> = {
  age: "Age",
  religion: "Religion",
  casteGotra: "Caste & Gotra",
  location: "Location",
  education: "Education",
  income: "Income",
  diet: "Diet",
  lifestyle: "Lifestyle",
  familyType: "Family Type",
  hobbies: "Hobbies",
  motherTongue: "Language",
};


export default function CompatibilityBadge({ score, breakdown, size = "md" }: CompatibilityBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);


  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };


  return (
    <div className="relative inline-block">
      <button
        type="button"
        className={`${sizeClasses[size]} ${getScoreBgColor(score)} border rounded-full font-bold ${getScoreTextColor(score)} cursor-pointer transition-all hover:scale-105`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {score}% Match
      </button>


      {showTooltip && breakdown && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-3 text-left">
          <p className="text-xs font-bold text-gray-800 mb-2">Compatibility Breakdown</p>
          <div className="space-y-1.5">
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-20 truncate">
                  {DIMENSION_LABELS[key as keyof ScoreBreakdown]}
                </span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${getScoreColor(value as number)}`} style={{ width: `${value}%` }} />
                </div>
                <span className="text-[10px] font-bold text-gray-600 w-7 text-right">{value as number}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

