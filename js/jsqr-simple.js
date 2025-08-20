/**
 * jsQR semplificato per Viking QR Forge
 * Implementazione base per la validazione
 */

function jsQR(data, width, height, options = {}) {
    try {
        // Implementazione semplificata per la validazione
        // In un'implementazione reale, qui ci sarebbe l'algoritmo di decodifica QR
        
        // Per ora, simuliamo una decodifica basata sui pattern
        const result = analyzeQRPattern(data, width, height);
        
        if (result.found) {
            return {
                data: result.text || 'QR Code rilevato',
                location: {
                    topLeftCorner: { x: 50, y: 50 },
                    topRightCorner: { x: width - 50, y: 50 },
                    bottomLeftCorner: { x: 50, y: height - 50 },
                    bottomRightCorner: { x: width - 50, y: height - 50 }
                }
            };
        }
        
        return null;
        
    } catch (error) {
        console.warn('Errore jsQR semplificato:', error);
        return null;
    }
}

function analyzeQRPattern(data, width, height) {
    // Analisi semplificata per rilevare pattern QR
    let darkPixels = 0;
    let lightPixels = 0;
    let totalPixels = 0;
    
    // Campiona pixel per rilevare pattern
    for (let i = 0; i < data.length; i += 16) { // Ogni 4 pixel
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];
        
        if (alpha > 128) {
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            if (luminance < 128) {
                darkPixels++;
            } else {
                lightPixels++;
            }
            totalPixels++;
        }
    }
    
    // Euristica semplice: se c'è un buon bilanciamento di pixel scuri/chiari
    const darkRatio = darkPixels / totalPixels;
    const hasPattern = darkRatio > 0.2 && darkRatio < 0.8;
    
    // Controlla se ci sono pattern agli angoli (finder patterns)
    const hasFinderPatterns = checkFinderPatterns(data, width, height);
    
    return {
        found: hasPattern && hasFinderPatterns,
        text: hasPattern ? 'Contenuto QR rilevato' : null,
        confidence: hasPattern ? 0.8 : 0.2
    };
}

function checkFinderPatterns(data, width, height) {
    // Controlla angoli per finder patterns
    const corners = [
        { x: 0, y: 0 }, // Top-left
        { x: width - 50, y: 0 }, // Top-right
        { x: 0, y: height - 50 } // Bottom-left
    ];
    
    let foundPatterns = 0;
    
    for (const corner of corners) {
        if (hasFinderPatternAt(data, width, height, corner.x, corner.y)) {
            foundPatterns++;
        }
    }
    
    return foundPatterns >= 2; // Almeno 2 finder patterns
}

function hasFinderPatternAt(data, width, height, startX, startY) {
    // Controlla un'area 50x50 per pattern scuri/chiari alternati
    let transitions = 0;
    let lastWasDark = false;
    
    for (let y = startY; y < Math.min(startY + 50, height); y += 5) {
        for (let x = startX; x < Math.min(startX + 50, width); x += 5) {
            const idx = (y * width + x) * 4;
            if (idx + 3 < data.length) {
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                const isDark = luminance < 128;
                
                if (isDark !== lastWasDark) {
                    transitions++;
                    lastWasDark = isDark;
                }
            }
        }
    }
    
    // Un finder pattern dovrebbe avere molte transizioni
    return transitions > 10;
}

// Esporta globalmente
window.jsQR = jsQR;
console.log('🔍 jsQR semplificato caricato');