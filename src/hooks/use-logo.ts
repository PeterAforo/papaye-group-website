import { useState, useEffect } from 'react';

type LogoType = 'light' | 'dark';

export function useLogo(type: LogoType) {
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch('/api/admin/logo');
        if (response.ok) {
          const data = await response.json();
          const path = type === 'light' ? data.lightLogoPath : data.darkLogoPath;
          setLogoPath(path || getDefaultLogoPath(type));
        } else {
          setLogoPath(getDefaultLogoPath(type));
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
        setLogoPath(getDefaultLogoPath(type));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
  }, [type]);

  return { logoPath, isLoading };
}

function getDefaultLogoPath(type: LogoType): string {
  // Return a default logo path if none is set
  // light = red logo (for light/white backgrounds when scrolled)
  // dark = white logo (for dark backgrounds at top)
  return type === 'light' 
    ? '/images/logo-red.png' 
    : '/images/logo-white.png';
}
