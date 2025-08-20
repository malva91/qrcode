import { VikingQR } from './qr-engine/viking-qr.js';

// ===== VIKING QR FORGE - VERSIONE SEMPLIFICATA =====
class VikingQRApp {
    constructor() {
        this.config = {
            text: 'https://esempio.com',
            size: 256,
            errorCorrection: 'M',
            foregroundColor: '#000000',
            backgroundColor: '#FFFFFF',
            style: 'classic',
            finderStyle: 'classic',
            borderStyle: 'none',
            runeDensity: 1.0
        };
        
        this.presets = {
            classic: { fg: '#000000', bg: '#FFFFFF', style: 'classic', finder: 'classic', border: 'none', name: 'Classico' },
            pure: { fg: '#000000', bg: '#FFFFFF', style: 'pure', finder: 'none', border: 'none', name: 'Puro' },
            viking: { fg: '#8B4513', bg: '#F5F5DC', style: 'runes-romb', finder: 'stone', border: 'viking', name: 'Vichingo' },
            ice: { fg: '#2F4F4F', bg: '#B0E0E6', style: 'runes-romb', finder: 'stone', border: 'none', name: 'Ghiaccio' },
            runes: { fg: '#CD853F', bg: '#1a1a1a', style: 'runes-strokes', finder: 'stone', border: 'runes', name: 'Rune Sacre' }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateQR();
        console.log('⚔️ Viking QR Forge inizializzato');
    }
    
    setupEventListeners() {
        // Input testo
        document.getElementById('qr-text').addEventListener('input', (e) => {
            this.config.text = e.target.value || 'https://esempio.com';
            this.generateQR();
        });
        
        // Dimensione
        document.getElementById('size').addEventListener('input', (e) => {
            this.config.size = parseInt(e.target.value);
            document.getElementById('size-value').textContent = this.config.size;
            this.generateQR();
        });
        
        // Correzione errore
        document.getElementById('error-correction').addEventListener('change', (e) => {
            this.config.errorCorrection = e.target.value;
            this.generateQR();
        });
        
        // Colori
        document.getElementById('foreground-color').addEventListener('change', (e) => {
            this.config.foregroundColor = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('background-color').addEventListener('change', (e) => {
            this.config.backgroundColor = e.target.value;
            this.generateQR();
        });
        
        // Nuovi controlli
        document.getElementById('qr-style').addEventListener('change', (e) => {
            this.config.style = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('finder-style').addEventListener('change', (e) => {
            this.config.finderStyle = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('border-style').addEventListener('change', (e) => {
            this.config.borderStyle = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('rune-density').addEventListener('input', (e) => {
            this.config.runeDensity = parseFloat(e.target.value);
            document.getElementById('density-value').textContent = Math.round(this.config.runeDensity * 100) + '%';
            this.generateQR();
        });
        
        // Preset
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.currentTarget.dataset.preset;
                this.applyPreset(preset);
            });
        });
        
        // Buttons
        document.getElementById('download-png').addEventListener('click', () => this.downloadPNG());
        document.getElementById('download-svg').addEventListener('click', () => this.downloadSVG());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        document.getElementById('validate-qr').addEventListener('click', () => this.validateQR());
    }
    
    applyPreset(presetName) {
        // Update active button
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-preset="${presetName}"]`).classList.add('active');
        
        // Apply colors
        const preset = this.presets[presetName];
        if (preset) {
            this.config.foregroundColor = preset.fg;
            this.config.backgroundColor = preset.bg;
            this.config.style = preset.style;
            this.config.finderStyle = preset.finder;
            this.config.borderStyle = preset.border;
            
            document.getElementById('foreground-color').value = preset.fg;
            document.getElementById('background-color').value = preset.bg;
            document.getElementById('qr-style').value = preset.style;
            document.getElementById('finder-style').value = preset.finder;
            document.getElementById('border-style').value = preset.border;
            
            this.generateQR();
        }
    }
    
    async generateQR() {
        try {
            // Configurazione VikingQR
            const vikingOptions = {
                errorCorrectionLevel: this.config.errorCorrection,
                moduleSize: Math.floor(this.config.size / 25), // Calcola dimensione modulo
                margin: 4,
                style: this.config.style,
                finderStyle: this.config.finderStyle,
                borderStyle: this.config.borderStyle,
                foregroundColor: this.config.foregroundColor,
                backgroundColor: this.config.backgroundColor,
                runeDensity: this.config.runeDensity,
                maskStrategy: 'optimize'
            };
            
            // Genera SVG
            const svgString = VikingQR.generateSVG(this.config.text, vikingOptions);
            
            // Mostra nel canvas
            await this.displaySVGInCanvas(svgString);
            
            this.showStatus('success', '✅ QR Code generato correttamente');
            
        } catch (error) {
            console.error('Errore generazione QR:', error);
            this.showStatus('error', '❌ Errore nella generazione del QR Code');
        }
    }
    
    async displaySVGInCanvas(svgString) {
        const canvas = document.getElementById('qr-canvas');
        const ctx = canvas.getContext('2d');
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                canvas.width = this.config.size;
                canvas.height = this.config.size;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve();
            };
            
            img.onerror = reject;
            
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
            img.src = URL.createObjectURL(svgBlob);
        });
    }
    
    // Mantieni le decorazioni legacy per compatibilità
    addVikingDecorations(ctx, size) {
        const margin = size * 0.08; // 8% margin
        
        // Salva il contesto
        ctx.save();
        // Decorazioni runiche e vichinghe
        // Bordo decorativo vichingo
        this.drawVikingBorder(ctx, size, margin);
        
        // Angoli decorativi
        this.drawVikingCorners(ctx, size, margin);
        this.drawRunicSymbols(ctx, size, margin);
        
        // Ripristina il contesto
        ctx.restore();
    }
    
    drawVikingBorder(ctx, size, margin) {
        const borderWidth = 3;
        const cornerSize = margin * 0.6;
        
        ctx.strokeStyle = this.config.foregroundColor;
        ctx.lineWidth = borderWidth;
        ctx.lineCap = 'square';
        
        // Bordo superiore
        ctx.beginPath();
        ctx.moveTo(cornerSize, margin/2);
        ctx.lineTo(size - cornerSize, margin/2);
        ctx.stroke();
        
        // Bordo destro
        ctx.beginPath();
        ctx.moveTo(size - margin/2, cornerSize);
        ctx.lineTo(size - margin/2, size - cornerSize);
        ctx.stroke();
        
        // Bordo inferiore
        ctx.beginPath();
        ctx.moveTo(size - cornerSize, size - margin/2);
        ctx.lineTo(cornerSize, size - margin/2);
        ctx.stroke();
        
        // Bordo sinistro
        ctx.beginPath();
        ctx.moveTo(margin/2, size - cornerSize);
        ctx.lineTo(margin/2, cornerSize);
        ctx.stroke();
    }
    
    drawVikingCorners(ctx, size, margin) {
        const cornerSize = margin * 0.4;
        
        ctx.fillStyle = this.config.foregroundColor;
        
        // Triangoli decorativi agli angoli
        const corners = [
            [margin/2, margin/2], // top-left
            [size - margin/2, margin/2], // top-right
            [size - margin/2, size - margin/2], // bottom-right
            [margin/2, size - margin/2] // bottom-left
        ];
        
        corners.forEach(([x, y], index) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((index * Math.PI) / 2);
            
            ctx.beginPath();
            ctx.moveTo(-cornerSize/2, -cornerSize/2);
            ctx.lineTo(cornerSize/2, 0);
            ctx.lineTo(-cornerSize/2, cornerSize/2);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    drawRunicSymbols(ctx, size, margin) {
        const runeSize = margin * 0.5;
        const runeColor = this.config.foregroundColor;
        
        ctx.strokeStyle = runeColor;
        ctx.fillStyle = runeColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        // Rune sui lati del QR code
        const runes = [
            // Runa Fehu (ricchezza) - lato superiore
            { x: size/2, y: margin/3, paths: [[[0,-8],[0,8]],[[0,-8],[6,-2]],[[0,2],[6,8]]] },
            // Runa Uruz (forza) - lato destro  
            { x: size - margin/3, y: size/2, paths: [[[8,0],[-8,0]],[[8,0],[2,-6]],[[8,0],[2,6]],[[-2,-6],[-2,6]]] },
            // Runa Thurisaz (protezione) - lato inferiore
            { x: size/2, y: size - margin/3, paths: [[[0,-8],[0,8]],[[0,-4],[6,0]],[[0,4],[6,0]]] },
            // Runa Ansuz (saggezza) - lato sinistro
            { x: margin/3, y: size/2, paths: [[[-8,0],[8,0]],[[-2,-6],[2,-2]],[[-2,6],[2,2]]] }
        ];
        
        runes.forEach(rune => {
            ctx.save();
            ctx.translate(rune.x, rune.y);
            
            rune.paths.forEach(path => {
                ctx.beginPath();
                ctx.moveTo(path[0][0], path[0][1]);
                for(let i = 1; i < path.length; i++) {
                    ctx.lineTo(path[i][0], path[i][1]);
                }
                ctx.stroke();
            });
            
            ctx.restore();
        });
        
        // Cerchio runico attorno al QR (opzionale per preset "runes")
        if (this.config.foregroundColor === '#CD853F') {
            this.drawRunicCircle(ctx, size);
        }
    }
    
    drawRunicCircle(ctx, size) {
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.45;
        
        ctx.strokeStyle = this.config.foregroundColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // Piccoli simboli runici sul cerchio
        const numSymbols = 8;
        for(let i = 0; i < numSymbols; i++) {
            const angle = (i * 2 * Math.PI) / numSymbols;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI/2);
            
            // Piccola runa
            ctx.beginPath();
            ctx.moveTo(0, -3);
            ctx.lineTo(0, 3);
            ctx.moveTo(-2, -1);
            ctx.lineTo(2, 1);
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    downloadPNG() {
        try {
            const vikingOptions = {
                ecLevel: this.config.errorCorrection,
                moduleSize: Math.floor(this.config.size / 25),
                margin: 4,
                style: this.config.style,
                finderStyle: this.config.finderStyle,
                borderStyle: this.config.borderStyle,
                foregroundColor: this.config.foregroundColor,
                backgroundColor: this.config.backgroundColor,
                runeDensity: this.config.runeDensity,
                maskStrategy: 'optimize'
            };
            
            VikingQR.generatePNG(this.config.text, vikingOptions).then(blob => {
                const link = document.createElement('a');
                link.download = `viking-qr-${Date.now()}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
                
                this.showStatus('success', '📱 PNG scaricato!');
            }).catch(error => {
                console.error('Errore PNG:', error);
                // Fallback al canvas esistente
                const canvas = document.getElementById('qr-canvas');
                const link = document.createElement('a');
                link.download = `viking-qr-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                this.showStatus('success', '📱 PNG scaricato!');
            });
        } catch (error) {
            console.error('Errore generazione PNG:', error);
            this.showStatus('error', '❌ Errore nella generazione PNG');
        }
    }
    
    async downloadSVG() {
        try {
            const vikingOptions = {
                ecLevel: this.config.errorCorrection,
                moduleSize: Math.floor(this.config.size / 25),
                margin: 4,
                style: this.config.style,
                finderStyle: this.config.finderStyle,
                borderStyle: this.config.borderStyle,
                foregroundColor: this.config.foregroundColor,
                backgroundColor: this.config.backgroundColor,
                runeDensity: this.config.runeDensity,
                maskStrategy: 'optimize'
            };
            
            const svgString = VikingQR.generateSVG(this.config.text, vikingOptions);
            
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const link = document.createElement('a');
            link.download = `viking-qr-${Date.now()}.svg`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
            
            this.showStatus('success', '🎨 SVG scaricato!');
            
        } catch (error) {
            console.error('Errore generazione SVG:', error);
            this.showStatus('error', '❌ Errore nella generazione SVG');
        }
    }
    
    reset() {
        this.config = {
            text: 'https://esempio.com',
            size: 256,
            errorCorrection: 'M',
            foregroundColor: '#000000',
            backgroundColor: '#FFFFFF',
            style: 'classic',
            finderStyle: 'classic',
            borderStyle: 'none',
            runeDensity: 1.0
        };
        
        document.getElementById('qr-text').value = this.config.text;
        document.getElementById('size').value = this.config.size;
        document.getElementById('size-value').textContent = this.config.size;
        document.getElementById('error-correction').value = this.config.errorCorrection;
        document.getElementById('foreground-color').value = this.config.foregroundColor;
        document.getElementById('background-color').value = this.config.backgroundColor;
        document.getElementById('qr-style').value = this.config.style;
        document.getElementById('finder-style').value = this.config.finderStyle;
        document.getElementById('border-style').value = this.config.borderStyle;
        document.getElementById('rune-density').value = this.config.runeDensity;
        
        this.applyPreset('classic');
        this.showStatus('success', '🔄 Impostazioni ripristinate');
    }
    
    async validateQR() {
        try {
            this.showStatus('warning', '🔍 Validazione in corso...');
            
            const vikingOptions = {
                ecLevel: this.config.errorCorrection,
                moduleSize: Math.floor(this.config.size / 25),
                margin: 4,
                style: this.config.style,
                finderStyle: this.config.finderStyle,
                borderStyle: this.config.borderStyle,
                foregroundColor: this.config.foregroundColor,
                backgroundColor: this.config.backgroundColor,
                runeDensity: this.config.runeDensity,
                maskStrategy: 'optimize'
            };
            
            const svgString = VikingQR.generateSVG(this.config.text, vikingOptions);
            const isValid = await VikingQR.validateQR(svgString);
            
            if (isValid) {
                this.showStatus('success', '✅ QR Code valido e scansionabile!');
            } else {
                this.showStatus('error', '❌ QR Code potrebbe non essere scansionabile');
            }
        } catch (error) {
            console.error('Errore validazione:', error);
            this.showStatus('error', '❌ Errore durante la validazione');
        }
    }
    
    showStatus(type, message) {
        const statusElement = document.getElementById('scan-status');
        
        let icon;
        switch(type) {
            case 'success': icon = '✅'; break;
            case 'error': icon = '❌'; break;
            case 'warning': icon = '⚠️'; break;
            default: icon = 'ℹ️';
        }
        
        statusElement.className = `scan-status ${type}`;
        statusElement.innerHTML = `
            <div class="status-icon">${icon}</div>
            <div class="status-text">${message}</div>
        `;
    }
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    window.vikingApp = new VikingQRApp();
});