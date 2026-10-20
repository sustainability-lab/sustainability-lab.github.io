import { geoDistance, geoEqualEarth, geoInterpolate, geoOrthographic } from "d3-geo";
import india from "../../data/india.json";
import globeDots from "../../data/globe-dots.json";
import worldDots from "../../data/world-dots.json";

export type LonLat = [number, number];

/** Gandhinagar (IIT Gandhinagar campus, Palaj). */
export const GN: LonLat = [72.684, 23.211];

export const indiaRings = (india as { rings: number[][][] }).rings as unknown as LonLat[][];
export const globe = globeDots as unknown as [number, number, number][]; // lat, lon, isIndia
export const world = worldDots as unknown as [number, number][]; // lat, lon

/** Equirectangular map with a cos(lat0) aspect: straight lines, so raster layers map linearly. */
export type Flat = { lon0: number; lat0: number; k: number; cx: number; cy: number };
export const flat = (v: Flat) => {
  const c = Math.cos((v.lat0 * Math.PI) / 180);
  return (lon: number, lat: number): [number, number] => [v.cx + (lon - v.lon0) * c * v.k, v.cy - (lat - v.lat0) * v.k];
};

export const ringsPath = (rings: LonLat[][], proj: (lon: number, lat: number) => [number, number]) =>
  rings
    .map((r) =>
      r
        .map(([lon, lat], i) => {
          const [x, y] = proj(lon, lat);
          return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join("") + "Z",
    )
    .join("");

export const ortho = (rotLon: number, rotLat: number, r: number, cx: number, cy: number) =>
  geoOrthographic().rotate([-rotLon, -rotLat]).scale(r).translate([cx, cy]).clipAngle(90).precision(0.3);

export const isFront = (lon: number, lat: number, rotLon: number, rotLat: number) =>
  geoDistance([lon, lat], [rotLon, rotLat]) < Math.PI / 2 - 0.02;

export const equalEarth = (w: number, h: number, cx: number, cy: number, rotate = -10) =>
  geoEqualEarth()
    .rotate([rotate, 0])
    .scale(w / 5.4)
    .translate([cx, cy]);

export { geoInterpolate, geoDistance };
