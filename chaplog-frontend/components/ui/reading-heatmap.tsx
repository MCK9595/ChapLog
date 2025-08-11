"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DailyReadingData {
  date: string;
  pagesRead: number;
  entriesCount: number;
  bookTitles: string[];
  hasReading: boolean;
}

interface ReadingHeatmapProps {
  year: number;
  month: number;
  monthName: string;
  dailyData: DailyReadingData[];
  totalPagesMonth: number;
  totalEntriesMonth: number;
  averagePagesPerDay: number;
  maxPagesDay: number;
  daysWithReading: number;
  onMonthChange: (year: number, month: number) => void;
}

export function ReadingHeatmap({
  year,
  month,
  monthName,
  dailyData,
  totalPagesMonth,
  totalEntriesMonth,
  averagePagesPerDay,
  maxPagesDay,
  daysWithReading,
  onMonthChange
}: ReadingHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DailyReadingData | null>(null);

  const getIntensityClass = (pagesRead: number): string => {
    if (pagesRead === 0) return "bg-slate-100 dark:bg-slate-800";
    if (pagesRead <= 10) return "bg-green-100 dark:bg-green-900";
    if (pagesRead <= 30) return "bg-green-200 dark:bg-green-800";
    if (pagesRead <= 50) return "bg-green-300 dark:bg-green-700";
    return "bg-green-400 dark:bg-green-600";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  const formatDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    return dayNames[date.getDay()];
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  // Create calendar grid (7 columns for days of week)
  const firstDayOfMonth = dailyData[0] ? new Date(dailyData[0].date) : new Date(year, month - 1, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  
  // Add empty cells for days before month starts
  const calendarCells: (DailyReadingData | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  
  // Add all days of the month
  dailyData.forEach(day => {
    calendarCells.push(day);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              読書ヒートマップ
              <span className="text-lg font-normal text-muted-foreground">
                {year}年{monthName}
              </span>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Month summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">総ページ数: </span>
            <span className="font-medium">{totalPagesMonth}</span>
          </div>
          <div>
            <span className="text-muted-foreground">記録日数: </span>
            <span className="font-medium">{daysWithReading}日</span>
          </div>
          <div>
            <span className="text-muted-foreground">平均/日: </span>
            <span className="font-medium">{averagePagesPerDay}ページ</span>
          </div>
          <div>
            <span className="text-muted-foreground">最高/日: </span>
            <span className="font-medium">{maxPagesDay}ページ</span>
          </div>
          <div>
            <span className="text-muted-foreground">記録回数: </span>
            <span className="font-medium">{totalEntriesMonth}回</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
            <div key={day} className="text-xs text-center text-muted-foreground p-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((day, index) => (
            <div key={index} className="relative">
              {day !== null ? (
                <div
                  className={`
                    aspect-square rounded-sm border cursor-pointer transition-all
                    ${getIntensityClass(day.pagesRead)}
                    hover:ring-2 hover:ring-blue-500 hover:ring-offset-1
                    ${hoveredDay?.date === day.date ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                  `}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div className="flex items-center justify-center h-full text-xs font-medium">
                    {new Date(day.date).getDate()}
                  </div>
                </div>
              ) : (
                <div className="aspect-square"></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Color legend */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-foreground">少ない</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800 border"></div>
            <div className="w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900 border"></div>
            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800 border"></div>
            <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700 border"></div>
            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600 border"></div>
          </div>
          <span className="text-xs text-muted-foreground">多い</span>
        </div>
        
        {/* Hover tooltip */}
        {hoveredDay && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="font-medium">
              {formatDate(hoveredDay.date)} ({formatDayOfWeek(hoveredDay.date)})
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {hoveredDay.pagesRead > 0 ? (
                <>
                  <div>{hoveredDay.pagesRead}ページ読書</div>
                  <div>{hoveredDay.entriesCount}回記録</div>
                  {hoveredDay.bookTitles.length > 0 && (
                    <div className="mt-1">
                      読んだ本: {hoveredDay.bookTitles.join(', ')}
                    </div>
                  )}
                </>
              ) : (
                <div>読書記録なし</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}