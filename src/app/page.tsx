"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import {
  Bookmark,
  Search,
  Sparkles,
  Loader2,
  Cpu,
  Globe,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { handleSearch, handleIndex } from "./actions";
import type { AiPoweredBookmarkSearchOutput } from "@/ai/flows/ai-powered-bookmark-search";
import { useToast } from "@/hooks/use-toast";
import { dummyBookmarks, type Bookmark as BookmarkType } from "@/lib/bookmarks";

export default function Home() {
  const [isIndexing, startIndexingTransition] = useTransition();
  const [isSearching, startSearchTransition] = useTransition();
  const [searchResults, setSearchResults] =
    useState<AiPoweredBookmarkSearchOutput | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(dummyBookmarks);
  const [userBookmarksLoaded, setUserBookmarksLoaded] = useState(false);
  const [isExtension, setIsExtension] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (window.chrome && window.chrome.bookmarks) {
      setIsExtension(true);
      
      const flattenBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[]): BookmarkType[] => {
        let bookmarkList: BookmarkType[] = [];
        for (const node of nodes) {
          if (node.url) {
            bookmarkList.push({
              title: node.title,
              url: node.url,
              description: node.title,
            });
          }
          if (node.children) {
            bookmarkList = bookmarkList.concat(flattenBookmarks(node.children));
          }
        }
        return bookmarkList;
      };

      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        const allBookmarks = flattenBookmarks(bookmarkTreeNodes);
        setBookmarks(allBookmarks);
        setUserBookmarksLoaded(true);
        toast({
          title: "Bookmarks Loaded",
          description: `Successfully loaded ${allBookmarks.length} bookmarks from Chrome.`,
        });
      });
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");

        const h1 = doc.querySelector('h1');
        if (!h1 || !h1.textContent?.includes('Bookmarks')) {
            throw new Error("Invalid bookmarks file format. Please export your bookmarks from Chrome as an HTML file.");
        }

        const links = Array.from(doc.querySelectorAll("a"));
        const newBookmarks = links.map((link) => ({
          title: link.innerText,
          url: link.href,
          description: link.innerText,
        }));
        
        if (newBookmarks.length === 0) {
            toast({
                title: "No Bookmarks Found",
                description: "The selected file does not contain any bookmarks.",
                variant: "destructive"
            });
            return;
        }

        setBookmarks(newBookmarks);
        setUserBookmarksLoaded(true);
        toast({
          title: "Bookmarks Loaded",
          description: `Successfully loaded ${newBookmarks.length} bookmarks. You can now index and search them.`,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to parse the bookmarks file.";
        setError(message);
        toast({
          title: "Error Loading Bookmarks",
          description: message,
          variant: "destructive",
        })
      }
    };
    reader.onerror = () => {
        const message = "Failed to read the file.";
        setError(message);
        toast({
          title: "Error Reading File",
          description: message,
          variant: "destructive",
        })
    }
    reader.readAsText(file);
    if (event.target) {
      event.target.value = "";
    }
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onIndexClick = async () => {
    startIndexingTransition(async () => {
      setError(null);
      const result = await handleIndex(bookmarks);
      if (result.success) {
        toast({
          title: "Indexing Complete",
          description: result.message,
        });
      } else {
        setError(result.message);
      }
    });
  };

  const onSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery) return;

    startSearchTransition(async () => {
      setError(null);
      setSearchResults(null);
      try {
        const results = await handleSearch(searchQuery, bookmarks);
        setSearchResults(results);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      }
    });
  };

  const renderContent = () => {
    if (isSearching) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    if (searchResults) {
      return (
        <div className="space-y-4 animate-in fade-in-50 duration-500">
          {searchResults.summary && (
            <Card className="bg-primary/10 border-primary/20">
              <CardHeader className="pb-2">
                 <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80">{searchResults.summary}</p>
              </CardContent>
            </Card>
          )}
          {searchResults.results && searchResults.results.length > 0 ? (
            <div className="space-y-3">
              {searchResults.results.map((item, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="group">
                        <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                            <Globe className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            {item.title}
                        </CardTitle>
                    </a>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description || "No description available."}
                    </p>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary/80 hover:underline truncate block mt-2">
                        {item.url}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center py-10">
                <p className="text-muted-foreground">{searchResults.noResultsMessage || "No relevant bookmarks found."}</p>
              </div>
          )}
        </div>
      );
    }
    return (
        <div className="text-center py-10">
          <Sparkles className="mx-auto h-12 w-12 text-primary/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            {isExtension
                ? `Loaded ${bookmarks.length} bookmarks from your browser.`
                : userBookmarksLoaded
                ? `Loaded ${bookmarks.length} bookmarks.`
                : 'Upload your Chrome bookmarks or use the sample data.'}
          </p>
           <p className="mt-1 text-xs text-muted-foreground">
            Search your bookmarks with the power of AI.
          </p>
        </div>
    );
  };


  return (
    <main className="min-h-screen bg-background flex items-start justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="w-full shadow-2xl shadow-primary/10 border-none">
            <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center mb-6">
                  <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <Bookmark className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">FavFind AI</h1>
                  <p className="text-muted-foreground mt-1">
                    Your intelligent bookmark search assistant.
                  </p>
                </div>

                {!isExtension && (
                    <div className="flex items-center gap-2 mb-6">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".html"
                          className="hidden"
                        />
                        <Button 
                            onClick={onUploadClick} 
                            disabled={isIndexing || isSearching}
                            variant="outline"
                            className="flex-1"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {userBookmarksLoaded ? "Load Other Bookmarks" : "Load Chrome Bookmarks"}
                        </Button>
                        <Button 
                            onClick={onIndexClick} 
                            disabled={isIndexing || isSearching}
                            variant="outline"
                            className="flex-1"
                        >
                        {isIndexing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Cpu className="mr-2 h-4 w-4" />
                        )}
                        Index {userBookmarksLoaded ? `(${bookmarks.length})` : ''} Bookmarks
                        </Button>
                    </div>
                )}


                <form onSubmit={onSearchSubmit} className="mb-6">
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search your bookmarks..."
                        className="pl-10 h-12 text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isSearching}
                    />
                    <Button
                        type="submit"
                        disabled={isSearching || !searchQuery}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-9"
                    >
                        {isSearching ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                        <Sparkles className="h-5 w-5" />
                        )}
                        <span className="sr-only">Search</span>
                    </Button>
                    </div>
                </form>

                <div className="mt-6 min-h-[200px]">{renderContent()}</div>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
