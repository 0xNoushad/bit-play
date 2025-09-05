"use client";

import React from "react";
import { useConsoleStore } from "../../app/store/consoleStore";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { ChevronDown, ChevronUp, Trash2, Copy } from "lucide-react";

export const ConsolePanel: React.FC = () => {
  const { entries, isVisible, toggleVisibility, clearEntries } =
    useConsoleStore();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const formatJson = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const getMethodColor = (method: string): string => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "POST":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "PUT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            API Console
            {entries.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {entries.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearEntries}
                className="h-8"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVisibility}
              className="h-8"
            >
              {isVisible ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isVisible && (
        <CardContent className="pt-0">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No API calls logged yet. Make a request to see logs here.
            </div>
          ) : (
            <ScrollArea className="h-64 sm:h-96 w-full">
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`border rounded-lg p-3 ${
                      entry.error
                        ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getMethodColor(entry.method)}>
                          {entry.method.toUpperCase()}
                        </Badge>
                        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {entry.endpoint}
                        </code>
                        {entry.duration && (
                          <Badge variant="outline" className="text-xs">
                            {entry.duration}ms
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {entry.timestamp}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(formatJson(entry.response))
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {entry.request && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold text-muted-foreground mb-1">
                          Request:
                        </div>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                          {formatJson(entry.request)}
                        </pre>
                      </div>
                    )}

                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-1">
                        Response:
                      </div>
                      <pre
                        className={`text-xs p-2 rounded overflow-x-auto ${
                          entry.error
                            ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        {formatJson(entry.response)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      )}
    </Card>
  );
};
