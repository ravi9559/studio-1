
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface SiteSketchManagerProps {
    projectId: string;
}

export function SiteSketchManager({ projectId }: SiteSketchManagerProps) {
    const [sketchUrl, setSketchUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const storageKey = `site-sketch-${projectId}`;

    useEffect(() => {
        try {
            const savedSketch = localStorage.getItem(storageKey);
            if (savedSketch) {
                setSketchUrl(savedSketch);
            }
        } catch (e) {
            console.error("Could not load site sketch", e);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load site sketch from local storage.',
            });
        }
        setIsLoading(false);
    }, [storageKey, toast]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({
                variant: 'destructive',
                title: 'File Too Large',
                description: 'Please upload an image smaller than 5MB.',
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            try {
                localStorage.setItem(storageKey, dataUrl);
                setSketchUrl(dataUrl);
                toast({
                    title: 'Sketch Uploaded',
                    description: 'The new site sketch has been saved.',
                });
            } catch (error) {
                console.error("Failed to save sketch", error);
                toast({
                    variant: 'destructive',
                    title: 'Storage Error',
                    description: 'Could not save the sketch. Local storage may be full.',
                });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveSketch = () => {
        try {
            localStorage.removeItem(storageKey);
            setSketchUrl(null);
            toast({
                title: 'Sketch Removed',
                description: 'The site sketch has been deleted.',
            });
        } catch (e) {
            console.error("Could not remove sketch", e);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Site Sketch</CardTitle>
                <CardDescription>
                    Upload, view, or remove the master site sketch for this project.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : sketchUrl ? (
                    <div className="relative aspect-video w-full border rounded-lg overflow-hidden">
                        <Image
                            src={sketchUrl}
                            alt="Site Sketch"
                            layout="fill"
                            objectFit="contain"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg p-8 text-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Site Sketch Uploaded</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Upload an image to get started.
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <div className="relative">
                    <Button asChild>
                        <Label htmlFor="sketch-upload">
                            <UploadCloud className="mr-2 h-4 w-4" />
                            {sketchUrl ? 'Upload New' : 'Upload Sketch'}
                        </Label>
                    </Button>
                    <Input
                        id="sketch-upload"
                        type="file"
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                {sketchUrl && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Sketch
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the current site sketch.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={handleRemoveSketch}
                                >
                                    Yes, remove it
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardFooter>
        </Card>
    );
}
