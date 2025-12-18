'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LogosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [lightLogo, setLightLogo] = useState<File | null>(null);
  const [darkLogo, setDarkLogo] = useState<File | null>(null);
  const [logoConfig, setLogoConfig] = useState<{
    lightLogoPath?: string;
    darkLogoPath?: string;
  }>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, router, session]);

  useEffect(() => {
    const fetchLogoConfig = async () => {
      try {
        const response = await fetch('/api/admin/logo');
        if (response.ok) {
          const data = await response.json();
          setLogoConfig(data);
        }
      } catch (error) {
        console.error('Error fetching logo config:', error);
        toast.error('Failed to load logo configuration');
      }
    };

    if (status === 'authenticated') {
      fetchLogoConfig();
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lightLogo && !darkLogo) {
      toast.warning('Please select at least one logo to upload');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    
    if (lightLogo) formData.append('lightLogo', lightLogo);
    if (darkLogo) formData.append('darkLogo', darkLogo);

    try {
      const response = await fetch('/api/admin/logo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setLogoConfig(data);
        setLightLogo(null);
        setDarkLogo(null);
        toast.success('Logos updated successfully');
      } else {
        throw new Error('Failed to update logos');
      }
    } catch (error) {
      console.error('Error updating logos:', error);
      toast.error('Failed to update logos');
    } finally {
      setIsLoading(false);
    }
  };

  if (status !== 'authenticated' || session?.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Logos</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload New Logos</CardTitle>
            <CardDescription>
              Upload logos for different backgrounds. Recommended size: 200x60px
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="light-logo">
                    Logo for Light Backgrounds
                  </label>
                  <input
                    id="light-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLightLogo(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-white
                      hover:file:bg-primary/90"
                  />
                  {lightLogo && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {lightLogo.name} ({(lightLogo.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="dark-logo">
                    Logo for Dark Backgrounds
                  </label>
                  <input
                    id="dark-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setDarkLogo(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-white
                      hover:file:bg-primary/90"
                  />
                  {darkLogo && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {darkLogo.name} ({(darkLogo.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Uploading...' : 'Upload Logos'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Light Logo</CardTitle>
              <CardDescription>Shown on dark backgrounds</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-6 bg-gray-100">
              {logoConfig.lightLogoPath ? (
                <img
                  src={logoConfig.lightLogoPath}
                  alt="Light Logo"
                  className="max-h-24 max-w-full object-contain"
                />
              ) : (
                <p className="text-gray-500">No light logo uploaded</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Dark Logo</CardTitle>
              <CardDescription>Shown on light backgrounds</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-6 bg-gray-800">
              {logoConfig.darkLogoPath ? (
                <img
                  src={logoConfig.darkLogoPath}
                  alt="Dark Logo"
                  className="max-h-24 max-w-full object-contain"
                />
              ) : (
                <p className="text-gray-400">No dark logo uploaded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
