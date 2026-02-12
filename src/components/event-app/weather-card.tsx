"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  CloudDrizzle,
  Droplets,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherCardProps {
  locationName: string;
  className?: string;
  variant?: "dashboard" | "detail";
}

// === COLORES ===
const getWeatherGradient = (code: number) => {
  if (code === 0 || code === 1) return "from-sky-400 to-blue-500";
  if (code === 2 || code === 3) return "from-slate-400 to-slate-600";
  if (code >= 45 && code <= 48) return "from-stone-400 to-stone-600";
  if (code >= 51 && code <= 57) return "from-blue-400 to-cyan-600";
  if (code >= 61 && code <= 67) return "from-blue-600 to-slate-700";
  if (code >= 71 && code <= 77) return "from-cyan-500 to-blue-600";
  if (code >= 95) return "from-indigo-600 to-purple-800";
  return "from-sky-500 to-cyan-400";
};

// === ICONOS ===
const getWeatherIcon = (code: number) => {
  if (code === 0 || code === 1) return <Sun className="h-full w-full" />;
  if (code === 2 || code === 3) return <Cloud className="h-full w-full" />;
  if (code >= 45 && code <= 48) return <CloudFog className="h-full w-full" />;
  if (code >= 51 && code <= 57)
    return <CloudDrizzle className="h-full w-full" />;
  if (code >= 61 && code <= 67) return <CloudRain className="h-full w-full" />;
  if (code >= 71 && code <= 77) return <Snowflake className="h-full w-full" />;
  if (code >= 95) return <CloudLightning className="h-full w-full" />;
  return <Sun className="h-full w-full" />;
};

const getWeatherDescription = (code: number) => {
  const codes: Record<number, string> = {
    0: "Cielo despejado",
    1: "Mayormente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Niebla",
    51: "Llovizna",
    61: "Lluvia",
    71: "Nieve",
    95: "Tormenta eléctrica",
  };
  return codes[code] || "Clima variable";
};

export function WeatherCard({
  locationName,
  className,
  variant = "dashboard",
}: WeatherCardProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!locationName) return;
      setLoading(true);
      setError(false);

      try {
        const cleanCity = locationName.split(",")[0];
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${cleanCity}&count=1&language=es&format=json`,
        );
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0)
          throw new Error("404");

        const { latitude, longitude, name } = geoData.results[0];
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`,
        );
        const weatherData = await weatherRes.json();

        setWeather({
          temp: Math.round(weatherData.current.temperature_2m),
          humidity: weatherData.current.relative_humidity_2m,
          code: weatherData.current.weather_code,
          cityName: name,
        });
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [locationName]);

  // ==========================================
  //  SKELETONS (LOADING STATE) - PRO DESIGN
  // ==========================================
  if (loading) {
    if (variant === "dashboard") {
      return (
        <Card
          className={cn(
            "relative overflow-hidden border-0 shadow-lg bg-muted h-[140px]",
            className,
          )}
        >
          {/* Fondo sutil pulsante */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted animate-pulse" />

          <div className="relative z-10 flex items-center justify-between p-5 h-full">
            <div className="flex items-center gap-4">
              {/* Icono Skeleton */}
              <div className="h-14 w-14 rounded-2xl bg-muted-foreground/10 animate-pulse" />
              <div className="space-y-2">
                {/* Temp Skeleton */}
                <div className="h-8 w-16 bg-muted-foreground/10 rounded-md animate-pulse" />
                {/* City Skeleton */}
                <div className="h-4 w-24 bg-muted-foreground/10 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {/* Desc Skeleton */}
              <div className="h-4 w-20 bg-muted-foreground/10 rounded-md animate-pulse" />
              {/* Humedad Skeleton */}
              <div className="h-4 w-12 bg-muted-foreground/10 rounded-md animate-pulse" />
            </div>
          </div>
        </Card>
      );
    } else {
      // Skeleton Detail (Horizontal)
      return (
        <Card
          className={cn(
            "relative overflow-hidden border-0 shadow-md bg-muted h-[60px]", // Altura fija igual a la cargada
            className,
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-muted/50 to-muted animate-pulse" />

          <div className="relative z-10 flex items-center justify-between px-4 py-3 h-full">
            <div className="flex items-center gap-3">
              {/* Icono pequeño */}
              <div className="h-8 w-8 rounded-full bg-muted-foreground/10 animate-pulse" />
              <div className="space-y-1">
                {/* Ciudad y Label */}
                <div className="h-3 w-20 bg-muted-foreground/10 rounded animate-pulse" />
                <div className="h-2 w-10 bg-muted-foreground/10 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Descripcion (oculta en movil igual que la real) */}
              <div className="hidden sm:block h-3 w-24 bg-muted-foreground/10 rounded animate-pulse" />
              {/* Pildora de datos */}
              <div className="h-8 w-24 bg-muted-foreground/10 rounded-full animate-pulse" />
            </div>
          </div>
        </Card>
      );
    }
  }

  // ==========================================
  //  ERROR STATE
  // ==========================================
  if (error || !weather) {
    if (variant === "detail") return null; // En detalle mejor ocultar si falla
    return (
      <Card
        className={cn(
          "p-4 bg-muted/20 text-muted-foreground text-sm text-center border-0 h-[140px] flex items-center justify-center",
          className,
        )}
      >
        <p className="flex items-center justify-center gap-2">
          <CloudFog className="h-5 w-5" />
          <span>Clima no disponible</span>
        </p>
      </Card>
    );
  }

  const bgGradient = getWeatherGradient(weather.code);

  // ==========================================
  //  LOADED: DASHBOARD VARIANT
  // ==========================================
  if (variant === "dashboard") {
    return (
      <Card
        className={cn(
          "relative overflow-hidden border-0 text-white shadow-lg bg-gradient-to-br h-[140px]", // Misma altura que skeleton
          bgGradient,
          className,
        )}
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex items-center justify-between p-5 h-full">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center p-3 shadow-inner border border-white/20">
              {getWeatherIcon(weather.code)}
            </div>
            <div>
              <span className="text-3xl font-bold tracking-tighter leading-none">
                {weather.temp}°
              </span>
              <p className="text-sm font-medium text-white/90 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" /> {weather.cityName}
              </p>
            </div>
          </div>
          <div className="text-right flex flex-col justify-center">
            <p className="text-sm font-semibold capitalize">
              {getWeatherDescription(weather.code)}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-1 text-white/80">
              <Droplets className="h-3.5 w-3.5" />{" "}
              <span className="text-xs font-medium">{weather.humidity}%</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // ==========================================
  //  LOADED: DETAIL VARIANT
  // ==========================================
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 text-white shadow-md transition-all h-[60px]", // Altura fija para evitar saltos
        "bg-gradient-to-r",
        bgGradient,
        className,
      )}
    >
      <div className="absolute -left-4 -top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10 flex items-center justify-between px-4 h-full">
        {/* Izquierda */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 text-white drop-shadow-md">
            {getWeatherIcon(weather.code)}
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-bold text-sm leading-none drop-shadow-sm mb-0.5">
              {weather.cityName}
            </span>
            <span className="text-[10px] text-white/90 font-medium opacity-90 leading-none">
              Ahora
            </span>
          </div>
        </div>

        {/* Derecha */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-white/90 capitalize hidden sm:block shadow-sm">
            {getWeatherDescription(weather.code)}
          </span>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 backdrop-blur-md border border-white/10 shadow-sm h-8">
            <span className="font-bold text-sm">{weather.temp}°</span>
            <div className="h-3 w-px bg-white/30" />
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              <span className="text-xs font-medium">{weather.humidity}%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
