declare module '@lokesh.dhakar/quantize' {
    function quantize(pixelArray: [number, number, number][], colorCount: number): {
      palette: () => [number, number, number][];
    } | null;
  
    export default quantize;
  }