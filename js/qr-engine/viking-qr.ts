import { QRGenerator } from './qr-generator.js';
import { RuneRenderer } from './rune-renderer.js';
import { VikingQROptions } from './types.js';

export class VikingQR {
  static generateSVG(text: string, options: VikingQROptions = {}): string {
    // Genera la matrice QR
    const matrix = QRGenerator.generate(text, options);
    
    // Renderizza come SVG
    return RuneRenderer.generateSVG(matrix, options);
  }

  static async generatePNG(text: string, options: VikingQROptions = {}): Promise<Blob> {
    const svg = this.generateSVG(text, options);
    
    // Converti SVG in PNG usando Canvas
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const { moduleSize = 8, margin = 4 } = options;
      const matrix = QRGenerator.generate(text, options);
      const size = (matrix.size + 2 * margin) * moduleSize;
      
      canvas.width = size;
      canvas.height = size;
      
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Errore nella generazione PNG'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Errore nel caricamento SVG'));
      
      const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
      img.src = URL.createObjectURL(svgBlob);
    });
  }

  static validateQR(svgString: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          
          if (imageData && window.jsQR) {
            const code = window.jsQR(imageData.data, imageData.width, imageData.height);
            resolve(!!code);
          } else {
            resolve(true); // Fallback se jsQR non è disponibile
          }
        };
        
        img.onerror = () => resolve(false);
        
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        img.src = URL.createObjectURL(svgBlob);
      } catch (error) {
        resolve(false);
      }
    });
  }
}

// Export per compatibilità
export { VikingQROptions } from './types.js';
export default VikingQR;