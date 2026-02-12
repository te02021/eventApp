"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface GeocodingResult {
  id: number;
  name: string;
  admin1?: string; // Provincia/Estado
  country: string;
}

export function LocationInput({
  value,
  onChange,
  className,
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce para no llamar a la API en cada tecla (300ms de espera)
  // Si no tienes un hook useDebounce, te paso la lógica simple aquí:
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), 300);
    return () => clearTimeout(handler);
  }, [value]);

  // Buscar lugares cuando el usuario deja de escribir
  useEffect(() => {
    const fetchLocations = async () => {
      if (!debouncedValue || debouncedValue.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${debouncedValue}&count=5&language=es&format=json`,
        );
        const data = await res.json();
        if (data.results) {
          setSuggestions(data.results);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error buscando ubicación:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Solo buscamos si el valor actual NO coincide exactamente con lo seleccionado
    // (para evitar que busque de nuevo al hacer clic)
    fetchLocations();
  }, [debouncedValue]);

  // Cerrar lista al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        placeholder="Buscar ciudad (ej: Buenos Aires)"
        className={cn("pl-11", className)}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto py-1">
          {suggestions.map((place) => (
            <li
              key={place.id}
              className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
              onClick={() => {
                const fullName = `${place.name}, ${place.country}`;
                onChange(fullName);
                setIsOpen(false);
                setSuggestions([]);
              }}
            >
              <div className="font-medium text-foreground">{place.name}</div>
              <div className="text-xs text-muted-foreground">
                {[place.admin1, place.country].filter(Boolean).join(", ")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
