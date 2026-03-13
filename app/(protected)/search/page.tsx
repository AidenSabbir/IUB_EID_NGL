"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function searchUsers() {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        setIsSearching(false);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      const supabase = createClient();
      
      const { data, error } = await supabase.rpc("search_users", {
        search_query: debouncedQuery,
      });

      if (!error && data) {
        setResults(data);
      } else {
        setResults([]);
      }
      
      setIsSearching(false);
      setHasSearched(true);
    }

    searchUsers();
  }, [debouncedQuery]);

  return (
    <div className="flex flex-col min-h-full bg-background p-4 max-w-2xl mx-auto w-full">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 pt-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 bg-card border-primary/20 focus-visible:ring-primary rounded-xl text-base shadow-sm"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 mt-4">
        {query.trim().length < 2 && !hasSearched && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Find Friends</h2>
            <p className="text-muted-foreground max-w-[250px]">
              Search for users to send Eid wishes
            </p>
          </div>
        )}

        {hasSearched && !isSearching && results.length === 0 && query.trim().length >= 2 && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
            <p className="text-muted-foreground text-lg">
              No users found for &apos;{debouncedQuery}&apos;
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="flex flex-col gap-3 pb-8">
            {results.map((user) => (
              <Link key={user.id} href={`/u/${user.username}`}>
                <Card className="hover:bg-accent/50 transition-colors border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-primary/20">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback className="bg-secondary text-primary">
                        {(user.full_name || user.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {user.full_name || user.username}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
