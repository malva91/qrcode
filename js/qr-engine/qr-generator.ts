import qrcode, { ErrorCorrectLevel } from 'qrcode-generator';
import { ECLevel, MaskStrategy, QRMatrix, VikingQROptions } from './types.js';

export class QRGenerator {
  private static EC_LEVEL_MAP = {
    'L': ErrorCorrectLevel.L,
    'M': ErrorCorrectLevel.M,
    'Q': ErrorCorrectLevel.Q,
    'H': ErrorCorrectLevel.H
  };

  static generate(text: string, options: VikingQROptions = {}): QRMatrix {
    const {
      ecLevel = 'H',
      maskStrategy = 'optimize'
    } = options;

    // Determina la versione ottimale
    const version = this.findOptimalVersion(text, ecLevel);
    
    // Genera il QR base
    const qr = qrcode(version, this.EC_LEVEL_MAP[ecLevel]);
    qr.addData(text);
    qr.make();

    const size = qr.getModuleCount();
    const modules: boolean[][] = [];

    // Estrai la matrice
    for (let row = 0; row < size; row++) {
      modules[row] = [];
      for (let col = 0; col < size; col++) {
        modules[row][col] = qr.isDark(row, col);
      }
    }

    let finalMask = 0;
    let finalModules = modules;

    // Ottimizzazione maschera
    if (maskStrategy === 'optimize') {
      const bestResult = this.optimizeMask(text, ecLevel, version);
      finalMask = bestResult.mask;
      finalModules = bestResult.modules;
    } else if (maskStrategy !== 'auto' && maskStrategy.match(/^[0-7]$/)) {
      // Forza maschera specifica
      const maskNum = parseInt(maskStrategy);
      const qrMasked = qrcode(version, this.EC_LEVEL_MAP[ecLevel]);
      qrMasked.addData(text);
      qrMasked.make();
      
      finalMask = maskNum;
      // Applica la maschera manualmente se necessario
    }

    return {
      modules: finalModules,
      size,
      version,
      ecLevel,
      mask: finalMask
    };
  }

  private static findOptimalVersion(text: string, ecLevel: ECLevel): number {
    for (let version = 1; version <= 40; version++) {
      try {
        const qr = qrcode(version, this.EC_LEVEL_MAP[ecLevel]);
        qr.addData(text);
        qr.make();
        return version;
      } catch (e) {
        continue;
      }
    }
    throw new Error('Testo troppo lungo per QR Code');
  }

  private static optimizeMask(text: string, ecLevel: ECLevel, version: number): { mask: number, modules: boolean[][] } {
    let bestScore = -1;
    let bestMask = 0;
    let bestModules: boolean[][] = [];

    // Testa tutte le maschere
    for (let mask = 0; mask < 8; mask++) {
      try {
        const qr = qrcode(version, this.EC_LEVEL_MAP[ecLevel]);
        qr.addData(text);
        qr.make();

        const size = qr.getModuleCount();
        const modules: boolean[][] = [];
        
        for (let row = 0; row < size; row++) {
          modules[row] = [];
          for (let col = 0; col < size; col++) {
            modules[row][col] = qr.isDark(row, col);
          }
        }

        const score = this.calculateRuneScore(modules);
        
        if (score > bestScore) {
          bestScore = score;
          bestMask = mask;
          bestModules = modules;
        }
      } catch (e) {
        continue;
      }
    }

    return { mask: bestMask, modules: bestModules };
  }

  private static calculateRuneScore(modules: boolean[][]): number {
    const size = modules.length;
    let score = 0;

    // Favorisce pattern diagonali e cluster a rombo
    for (let row = 1; row < size - 1; row++) {
      for (let col = 1; col < size - 1; col++) {
        // Pattern diagonale
        if (modules[row][col] === modules[row-1][col-1] && 
            modules[row][col] === modules[row+1][col+1]) {
          score += 2;
        }
        
        // Pattern a rombo
        if (modules[row][col] !== modules[row-1][col] &&
            modules[row][col] !== modules[row+1][col] &&
            modules[row][col] !== modules[row][col-1] &&
            modules[row][col] !== modules[row][col+1]) {
          score += 3;
        }

        // Penalizza run-length eccessivi
        let runLength = 1;
        for (let k = col + 1; k < size && modules[row][k] === modules[row][col]; k++) {
          runLength++;
        }
        if (runLength > 5) {
          score -= runLength * 2;
        }
      }
    }

    return score;
  }
}