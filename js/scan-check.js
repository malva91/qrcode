// ===== VALIDATORE DI SCANSIONABILITÀ =====
class QRScanValidator {
    constructor() {
        this.lastValidation = null;
        console.log('📱 Validatore QR inizializzato');
    }
    
    // ===== VALIDAZIONE PRINCIPALE =====
    async validateQRCode(canvas, config) {
        try {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Tenta decodifica con jsQR
            const scanResult = jsQR(imageData.data, imageData.width, imageData.height);
            
            // Calcola metriche di qualità
            const qualityMetrics = this.calculateQualityMetrics(imageData, config);
            
            // Genera risultato
            const validation = {
                scannable: scanResult !== null,
                decodedText: scanResult ? scanResult.data : null,
                confidence: this.calculateConfidence(qualityMetrics, scanResult),
                metrics: qualityMetrics,
                suggestions: this.generateSuggestions(qualityMetrics, config),
                timestamp: Date.now()
            };
            
            this.lastValidation = validation;
            return validation;
            
        } catch (error) {
            console.error('❌ Errore validazione QR:', error);
            return this.createErrorValidation(error);
        }
    }
    
    // ===== CALCOLO METRICHE QUALITÀ =====
    calculateQualityMetrics(imageData, config) {
        const { data, width, height } = imageData;
        
        // Calcola contrasto medio
        const contrast = this.calculateAverageContrast(data, width, height);
        
        // Analizza quiet zone
        const quietZone = this.analyzeQuietZone(data, width, height, config.margin || 20);
        
        // Verifica nitidezza
        const sharpness = this.calculateSharpness(data, width, height);
        
        // Analizza distribuzione colori
        const colorDistribution = this.analyzeColorDistribution(data);
        
        return {
            contrast,
            quietZone,
            sharpness,
            colorDistribution,
            patternIntensity: config.patternIntensity || 0,
            logoScale: config.logoScale || 0
        };
    }
    
    // ===== CALCOLO CONTRASTO MEDIO =====
    calculateAverageContrast(data, width, height) {
        let totalContrast = 0;
        let samples = 0;
        const sampleRate = 10; // Campiona ogni 10 pixel
        
        for (let y = 0; y < height; y += sampleRate) {
            for (let x = 0; x < width; x += sampleRate) {
                const idx = (y * width + x) * 4;
                if (idx + 3 < data.length) {
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    
                    // Calcola luminanza
                    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                    totalContrast += luminance;
                    samples++;
                }
            }
        }
        
        return samples > 0 ? totalContrast / samples : 128;
    }
    
    // ===== ANALISI QUIET ZONE =====
    analyzeQuietZone(data, width, height, expectedMargin) {
        const marginPixels = Math.floor((width * expectedMargin) / 200); // Proporzionale
        let validMargin = true;
        
        // Controlla bordi
        const edges = [
            { x: 0, y: 0, w: width, h: marginPixels }, // Top
            { x: 0, y: height - marginPixels, w: width, h: marginPixels }, // Bottom
            { x: 0, y: 0, w: marginPixels, h: height }, // Left
            { x: width - marginPixels, y: 0, w: marginPixels, h: height } // Right
        ];
        
        for (const edge of edges) {
            for (let y = edge.y; y < edge.y + edge.h && y < height; y++) {
                for (let x = edge.x; x < edge.x + edge.w && x < width; x++) {
                    const idx = (y * width + x) * 4;
                    if (idx + 3 < data.length) {
                        const r = data[idx];
                        const g = data[idx + 1];
                        const b = data[idx + 2];
                        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                        
                        // Il margin dovrebbe essere relativamente uniforme
                        if (Math.abs(luminance - 240) > 50) { // Assumendo sfondo chiaro
                            validMargin = false;
                            break;
                        }
                    }
                }
                if (!validMargin) break;
            }
            if (!validMargin) break;
        }
        
        return {
            valid: validMargin,
            expectedPixels: marginPixels,
            score: validMargin ? 1.0 : 0.5
        };
    }
    
    // ===== CALCOLO NITIDEZZA =====
    calculateSharpness(data, width, height) {
        let totalVariance = 0;
        let samples = 0;
        
        for (let y = 1; y < height - 1; y += 5) {
            for (let x = 1; x < width - 1; x += 5) {
                const idx = (y * width + x) * 4;
                const current = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
                
                // Calcola gradiente con pixel adiacenti
                const right = 0.299 * data[idx + 4] + 0.587 * data[idx + 5] + 0.114 * data[idx + 6];
                const bottom = 0.299 * data[idx + width * 4] + 0.587 * data[idx + width * 4 + 1] + 0.114 * data[idx + width * 4 + 2];
                
                const gradientX = Math.abs(current - right);
                const gradientY = Math.abs(current - bottom);
                const gradient = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
                
                totalVariance += gradient;
                samples++;
            }
        }
        
        return samples > 0 ? totalVariance / samples : 0;
    }
    
    // ===== ANALISI DISTRIBUZIONE COLORI =====
    analyzeColorDistribution(data) {
        const histogram = { dark: 0, light: 0, mid: 0 };
        
        for (let i = 0; i < data.length; i += 16) { // Campiona ogni 4 pixel
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            
            if (luminance < 85) histogram.dark++;
            else if (luminance > 170) histogram.light++;
            else histogram.mid++;
        }
        
        const total = histogram.dark + histogram.light + histogram.mid;
        return {
            darkRatio: histogram.dark / total,
            lightRatio: histogram.light / total,
            midRatio: histogram.mid / total,
            balance: Math.abs(0.5 - (histogram.dark / total))
        };
    }
    
    // ===== CALCOLO CONFIDENZA =====
    calculateConfidence(metrics, scanResult) {
        let confidence = 0.5; // Base
        
        if (scanResult) confidence += 0.3; // Scansione riuscita
        
        // Fattori di qualità
        if (metrics.contrast > 100) confidence += 0.1;
        if (metrics.quietZone.valid) confidence += 0.1;
        if (metrics.sharpness > 10) confidence += 0.05;
        if (metrics.colorDistribution.balance < 0.2) confidence += 0.05;
        
        // Penalizzazioni
        if (metrics.patternIntensity > 20) confidence -= 0.1;
        if (metrics.logoScale > 40) confidence -= 0.05;
        
        return Math.max(0, Math.min(1, confidence));
    }
    
    // ===== GENERAZIONE SUGGERIMENTI =====
    generateSuggestions(metrics, config) {
        const suggestions = [];
        
        if (metrics.contrast < 80) {
            suggestions.push({
                type: 'warning',
                icon: '⚠️',
                text: 'Contrasto basso - usa colori più distinti',
                action: 'contrast'
            });
        }
        
        if (!metrics.quietZone.valid) {
            suggestions.push({
                type: 'error',
                icon: '📏',
                text: 'Margine insufficiente - aumenta quiet zone',
                action: 'margin'
            });
        }
        
        if (metrics.patternIntensity > 25) {
            suggestions.push({
                type: 'warning',
                icon: '🎨',
                text: 'Pattern troppo intenso - riduci opacità',
                action: 'pattern'
            });
        }
        
        if (metrics.logoScale > 35) {
            suggestions.push({
                type: 'warning',
                icon: '🖼️',
                text: 'Logo troppo grande - riduci dimensioni',
                action: 'logo'
            });
        }
        
        if (config.errorCorrection === 'L' && metrics.contrast < 100) {
            suggestions.push({
                type: 'info',
                icon: '🛡️',
                text: 'Usa correzione errore più alta (M/Q/H)',
                action: 'ecc'
            });
        }
        
        if (suggestions.length === 0) {
            suggestions.push({
                type: 'success',
                icon: '✅',
                text: 'QR Code ottimizzato per la scansione',
                action: null
            });
        }
        
        return suggestions;
    }
    
    // ===== VALIDAZIONE ERRORE =====
    createErrorValidation(error) {
        return {
            scannable: false,
            decodedText: null,
            confidence: 0,
            metrics: {},
            suggestions: [{
                type: 'error',
                icon: '❌',
                text: `Errore validazione: ${error.message}`,
                action: null
            }],
            timestamp: Date.now()
        };
    }
    
    // ===== METODI UTILITY =====
    getLastValidation() {
        return this.lastValidation;
    }
    
    isValidationFresh(maxAge = 5000) {
        if (!this.lastValidation) return false;
        return Date.now() - this.lastValidation.timestamp < maxAge;
    }
}

// ===== ESPORTAZIONE GLOBALE =====
window.QRScanValidator = QRScanValidator;