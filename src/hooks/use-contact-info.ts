"use client";

import { useState, useEffect } from "react";

interface ContactInfo {
  phone: string;
  phone2: string;
  email: string;
  address: string;
  hours: string;
}

const defaultContactInfo: ContactInfo = {
  phone: "+233 302 810 990",
  phone2: "",
  email: "info@papayegroup.com",
  address: "Head Office: Plot 53A, Spintex Road, Opp. Stanbic Bank, Accra",
  hours: "7:00 AM - 11:00 PM",
};

export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const res = await fetch("/api/content/homepage");
        if (res.ok) {
          const data = await res.json();
          if (data.contact) {
            setContactInfo({
              phone: data.contact.phone || defaultContactInfo.phone,
              phone2: data.contact.phone2 || defaultContactInfo.phone2,
              email: data.contact.email || defaultContactInfo.email,
              address: data.contact.address || defaultContactInfo.address,
              hours: data.contact.hours || defaultContactInfo.hours,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContactInfo();
  }, []);

  return { contactInfo, isLoading };
}
