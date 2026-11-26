import { getInputProps, getRemotionEnvironment } from "remotion";

/**
 * A render switch passed as `--props` (`{"music": false}`, `{"sfx": false}`); on by default.
 * In a <Player> (the live lab talk in _talk/) the film plays silent, so both are off there.
 * Call it while rendering, not at module load: outside the studio and the renderer,
 * getInputProps() throws until a Player has mounted.
 */
export const flag = (name: "music" | "sfx"): boolean => {
  if (getRemotionEnvironment().isPlayer) return false;
  try {
    return (getInputProps() as Record<string, unknown>)[name] !== false;
  } catch {
    return false;
  }
};
