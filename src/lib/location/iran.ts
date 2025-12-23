// iran-city is CommonJS; require to avoid type issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const iranCity = require("iran-city") as {
  allProvinces: () => { id: number; name: string; slug: string }[];
  allCities: () => { id: number; name: string; slug: string; province_id: number }[];
  citiesOfProvince: (id: number) => { id: number; name: string; slug: string; province_id: number }[];
};

type Province = { id: number; name: string; slug: string };
type City = { id: number; name: string; slug: string; province_id: number };

const provinces: Province[] = iranCity.allProvinces();

export const getProvinces = () => provinces.map((p) => ({ id: String(p.id), name: p.name }));

export const getCitiesByProvinceId = (
  provinceId: string,
): { id: string; name: string; provinceId: string }[] =>
  iranCity
    .citiesOfProvince(Number(provinceId) || 0)
    .map((c: City) => ({ id: String(c.id), name: c.name, provinceId: String(c.province_id) }));

export const getProvinceName = (provinceId?: string) =>
  provinces.find((p) => String(p.id) === String(provinceId))?.name ?? "";

export const getCityName = (cityId?: string) =>
  iranCity.allCities().find((c: City) => String(c.id) === String(cityId))?.name ?? "";
