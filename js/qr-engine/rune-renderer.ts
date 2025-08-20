import { QRMatrix, VikingQROptions, ModuleInfo } from './types.js';

export class RuneRenderer {
  private static RUNE_PATHS = {
    fehu: 'M 0.2 0.1 L 0.2 0.9 M 0.2 0.2 L 0.7 0.35 M 0.2 0.5 L 0.6 0.65',
    uruz: 'M 0.2 0.9 L 0.2 0.1 L 0.6 0.1 Q 0.8 0.1 0.8 0.35 Q 0.8 0.6 0.6 0.6 L 0.2 0.6',
    thurisaz: 'M 0.2 0.1 L 0.2 0.9 M 0.2 0.3 L 0.7 0.5 L 0.2 0.7',
    ansuz: 'M 0.2 0.1 L 0.2 0.9 M 0.2 0.25 L 0.6 0.4 M 0.2 0.6 L 0.6 0.75',
    raidho: 'M 0.2 0.1 L 0.2 0.9 M 0.2 0.1 L 0.6 0.1 Q 0.8 0.1 0.8 0.3 Q 0.8 0.5 0.6 0.5 L 0.2 0.5 L 0.8 0.9',
    kenaz: 'M 0.2 0.1 L 0.2 0.9 M 0.2 0.3 L 0.7 0.1 M 0.2 0.5 L 0.7 0.7'
  };

  static generateSVG(matrix: QRMatrix, options: VikingQROptions = {}): string {
    const {
      moduleSize = 8,
      margin = 4,
      style = 'runes-romb',
      finderStyle = 'stone',
      borderStyle = 'none',
      foregroundColor = '#111111',
      backgroundColor = '#ffffff',
      runeDensity = 1.0,
      seed = 42
    } = options;

    const totalSize = (matrix.size + 2 * margin) * moduleSize;
    const random = this.createSeededRandom(seed);

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}">`;
    
    // Sfondo
    svg += `<rect width="${totalSize}" height="${totalSize}" fill="${backgroundColor}"/>`;

    // Analizza i moduli
    const moduleInfos = this.analyzeModules(matrix);

    // Renderizza i moduli
    for (let row = 0; row < matrix.size; row++) {
      for (let col = 0; col < matrix.size; col++) {
        if (!matrix.modules[row][col]) continue;

        const x = (col + margin) * moduleSize;
        const y = (row + margin) * moduleSize;
        const moduleInfo = moduleInfos[row][col];

        svg += this.renderModule(x, y, moduleSize, moduleInfo, style, finderStyle, foregroundColor, random, runeDensity);
      }
    }

    // Aggiungi bordo vichingo se richiesto
    if (borderStyle !== 'none') {
      svg += this.renderBorder(totalSize, borderStyle, foregroundColor, moduleSize);
    }

    svg += '</svg>';
    return svg;
  }

  private static analyzeModules(matrix: QRMatrix): ModuleInfo[][] {
    const size = matrix.size;
    const infos: ModuleInfo[][] = [];

    for (let row = 0; row < size; row++) {
      infos[row] = [];
      for (let col = 0; col < size; col++) {
        infos[row][col] = {
          x: col,
          y: row,
          isDark: matrix.modules[row][col],
          type: this.getModuleType(row, col, size)
        };
      }
    }

    return infos;
  }

  private static getModuleType(row: number, col: number, size: number): ModuleInfo['type'] {
    // Finder patterns (angoli)
    if ((row < 9 && col < 9) || 
        (row < 9 && col >= size - 8) || 
        (row >= size - 8 && col < 9)) {
      return 'finder';
    }

    // Timing patterns
    if (row === 6 || col === 6) {
      return 'timing';
    }

    // Alignment patterns (versioni > 1)
    if (size > 21) {
      const alignmentPositions = this.getAlignmentPositions(size);
      for (const pos of alignmentPositions) {
        if (Math.abs(row - pos) <= 2 && Math.abs(col - pos) <= 2) {
          return 'alignment';
        }
      }
    }

    return 'data';
  }

  private static getAlignmentPositions(size: number): number[] {
    // Semplificazione - posizioni alignment per versioni comuni
    const positions: { [key: number]: number[] } = {
      25: [6, 18],
      29: [6, 22],
      33: [6, 26],
      37: [6, 30],
      41: [6, 34],
      45: [6, 22, 38],
      49: [6, 24, 42],
      53: [6, 26, 46],
      57: [6, 28, 50]
    };
    return positions[size] || [];
  }

  private static renderModule(
    x: number, 
    y: number, 
    size: number, 
    info: ModuleInfo, 
    style: string, 
    finderStyle: string,
    color: string,
    random: () => number,
    runeDensity: number
  ): string {
    const cx = x + size / 2;
    const cy = y + size / 2;

    // Finder patterns
    if (info.type === 'finder') {
      if (finderStyle === 'stone') {
        return this.renderStoneModule(x, y, size, color, random);
      } else if (finderStyle === 'none') {
        return '';
      }
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}"/>`;
    }

    // Timing e alignment sempre classici per compatibilità
    if (info.type === 'timing' || info.type === 'alignment') {
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}"/>`;
    }

    // Moduli dati
    if (style === 'pure' || style === 'classic') {
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}"/>`;
    }

    // Stile runico
    if (random() > runeDensity) {
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}"/>`;
    }

    if (style === 'runes-romb') {
      return this.renderRomb(cx, cy, size * 0.45, color);
    }

    if (style === 'runes-strokes') {
      return this.renderRuneStroke(x, y, size, color, random);
    }

    return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}"/>`;
  }

  private static renderRomb(cx: number, cy: number, radius: number, color: string): string {
    return `<path d="M ${cx} ${cy - radius} L ${cx + radius} ${cy} L ${cx} ${cy + radius} L ${cx - radius} ${cy} Z" fill="${color}"/>`;
  }

  private static renderRuneStroke(x: number, y: number, size: number, color: string, random: () => number): string {
    const runeNames = Object.keys(this.RUNE_PATHS);
    const selectedRune = runeNames[Math.floor(random() * runeNames.length)];
    const runePath = this.RUNE_PATHS[selectedRune as keyof typeof this.RUNE_PATHS];

    // Scala il path della runa
    const scaledPath = runePath.replace(/[\d.]+/g, (match) => {
      const num = parseFloat(match);
      return (x + num * size).toString();
    });

    return `<path d="${scaledPath}" stroke="${color}" stroke-width="${size * 0.15}" fill="none" stroke-linecap="round"/>`;
  }

  private static renderStoneModule(x: number, y: number, size: number, color: string, random: () => number): string {
    // Effetto pietra spaccata
    const jitter = size * 0.1;
    const x1 = x + (random() - 0.5) * jitter;
    const y1 = y + (random() - 0.5) * jitter;
    const x2 = x + size + (random() - 0.5) * jitter;
    const y2 = y + size + (random() - 0.5) * jitter;

    return `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" fill="${color}" rx="${size * 0.1}"/>`;
  }

  private static renderBorder(totalSize: number, borderStyle: string, color: string, moduleSize: number): string {
    const margin = moduleSize * 2;
    const innerSize = totalSize - margin * 2;

    if (borderStyle === 'viking') {
      return this.renderVikingBorder(margin, innerSize, color, moduleSize);
    }

    if (borderStyle === 'runes') {
      return this.renderRunicBorder(margin, totalSize, color, moduleSize);
    }

    return '';
  }

  private static renderVikingBorder(margin: number, innerSize: number, color: string, moduleSize: number): string {
    const borderWidth = moduleSize * 0.3;
    const cornerSize = moduleSize * 1.5;

    let border = `<g stroke="${color}" stroke-width="${borderWidth}" fill="none">`;
    
    // Bordi con angoli decorativi
    border += `<path d="M ${margin + cornerSize} ${margin} L ${margin + innerSize - cornerSize} ${margin}"/>`;
    border += `<path d="M ${margin + innerSize} ${margin + cornerSize} L ${margin + innerSize} ${margin + innerSize - cornerSize}"/>`;
    border += `<path d="M ${margin + innerSize - cornerSize} ${margin + innerSize} L ${margin + cornerSize} ${margin + innerSize}"/>`;
    border += `<path d="M ${margin} ${margin + innerSize - cornerSize} L ${margin} ${margin + cornerSize}"/>`;

    // Angoli decorativi
    const corners = [
      [margin, margin],
      [margin + innerSize, margin],
      [margin + innerSize, margin + innerSize],
      [margin, margin + innerSize]
    ];

    corners.forEach(([x, y], index) => {
      const angle = index * 90;
      border += `<g transform="translate(${x},${y}) rotate(${angle})">`;
      border += `<path d="M 0 0 L ${cornerSize * 0.7} ${cornerSize * 0.3} L 0 ${cornerSize} Z" fill="${color}"/>`;
      border += `</g>`;
    });

    border += '</g>';
    return border;
  }

  private static renderRunicBorder(margin: number, totalSize: number, color: string, moduleSize: number): string {
    let border = `<g stroke="${color}" stroke-width="${moduleSize * 0.2}" fill="none">`;
    
    // Cerchio runico esterno
    const centerX = totalSize / 2;
    const centerY = totalSize / 2;
    const radius = totalSize * 0.45;

    border += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" stroke-dasharray="3,3"/>`;

    // Rune sui punti cardinali
    const runePositions = [
      { angle: 0, rune: 'fehu' },
      { angle: Math.PI / 2, rune: 'uruz' },
      { angle: Math.PI, rune: 'thurisaz' },
      { angle: 3 * Math.PI / 2, rune: 'ansuz' }
    ];

    runePositions.forEach(({ angle, rune }) => {
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const size = moduleSize * 1.5;
      
      border += `<g transform="translate(${x - size/2},${y - size/2})">`;
      border += this.renderRuneStroke(0, 0, size, color, () => 0.5);
      border += `</g>`;
    });

    border += '</g>';
    return border;
  }

  private static createSeededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }
}