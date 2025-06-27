'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Lightbulb, X } from 'lucide-react';
import { suggestLineage, type SuggestLineageOutput } from '@/ai/flows/lineage-suggestion';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface LineageSuggestionProps {
    existingData: string;
}

export function LineageSuggestion({ existingData }: LineageSuggestionProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestLineageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim()) {
      setError('Please enter a query.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const result = await suggestLineage({ existingData, query });
      setSuggestions(result);
    } catch (e) {
      setError('Failed to get suggestions. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
            <Card className="w-96 mb-2 shadow-lg animate-in fade-in-50 slide-in-from-bottom-10 duration-300">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div className="space-y-1.5">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="text-primary" />
                            AI Lineage Assistant
                        </CardTitle>
                        <CardDescription>
                            Ask about potential lineage connections.
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 -mt-1 -mr-2" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Textarea
                            placeholder="e.g., 'Are there any missing heirs for Ramasamy Gounder?'"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Lightbulb className="mr-2 h-4 w-4" />
                    )}
                    Suggest Connections
                    </Button>

                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {suggestions && suggestions.suggestions.length > 0 && (
                        <div className="space-y-3 pt-4">
                            <h4 className="font-semibold">Suggestions:</h4>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                {suggestions.suggestions.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {suggestions && suggestions.suggestions.length === 0 && (
                        <Alert>
                            <AlertTitle>No Suggestions Found</AlertTitle>
                            <AlertDescription>The AI could not find any specific suggestions based on your query.</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        )}
        <Button onClick={() => setIsOpen(!isOpen)} size="lg" className="rounded-full shadow-lg">
            <Sparkles className="mr-2 h-5 w-5" />
            AI Assistant
        </Button>
    </div>
  );
}
