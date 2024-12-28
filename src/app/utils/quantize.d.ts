declare module '@lokesh.dhakar/quantize' {
    export function quantize(pixelArray: [number, number, number][], colorCount: number): {
      palette: () => [number, number, number][];
    } | null;
  }