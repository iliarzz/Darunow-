"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getCitiesByProvinceId, getProvinces, getProvinceName, getCityName } from "@/lib/location/iran";

type Props = {
  provinceId?: string;
  cityId?: string;
  onProvinceChange: (id: string) => void;
  onCityChange: (id: string) => void;
  error?: string;
};

export function ProvinceCityCombobox({ provinceId, cityId, onProvinceChange, onCityChange, error }: Props) {
  const provinces = useMemo(() => getProvinces(), []);
  const cities = useMemo(() => (provinceId ? getCitiesByProvinceId(provinceId) : []), [provinceId]);
  const [openProvince, setOpenProvince] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-text">استان</label>
        <Popover open={openProvince} onOpenChange={setOpenProvince}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openProvince}
              className={cn(
                "w-full justify-between rounded-xl border-border/70 bg-card/80",
                !provinceId && "text-muted",
              )}
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand" />
                {provinceId ? getProvinceName(provinceId) : "انتخاب استان"}
              </span>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full">
            <Command>
              <CommandInput placeholder="جستجوی استان..." />
              <CommandList>
                <CommandEmpty>یافت نشد</CommandEmpty>
                <CommandGroup>
                  {provinces.map((prov) => (
                    <CommandItem
                      key={prov.id}
                      value={prov.name}
                      onSelect={() => {
                        onProvinceChange(prov.id);
                        onCityChange("");
                        setOpenProvince(false);
                      }}
                    >
                      {prov.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-text">شهر</label>
        <Popover open={openCity} onOpenChange={setOpenCity}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCity}
              disabled={!provinceId}
              className={cn(
                "w-full justify-between rounded-xl border-border/70 bg-card/80",
                !cityId && "text-muted",
                !provinceId && "opacity-70",
              )}
            >
              <span>{cityId ? getCityName(cityId) : "انتخاب شهر"}</span>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full">
            <Command>
              <CommandInput placeholder="جستجوی شهر..." />
              <CommandList>
                <CommandEmpty>یافت نشد</CommandEmpty>
                <CommandGroup>
                  {cities.map((city) => (
                    <CommandItem
                      key={city.id}
                      value={city.name}
                      onSelect={() => {
                        onCityChange(city.id);
                        setOpenCity(false);
                      }}
                    >
                      {city.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
