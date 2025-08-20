import QRCode from 'qrcode';

// ===== VIKING QR FORGE - VERSIONE SEMPLIFICATA =====
class VikingQRApp {
    constructor() {
        this.config = {
            text: 'https://esempio.com',
            size: 256,
            errorCorrection: 'M',
            foregroundColor: '#000000',
            backgroundColor: '#FFFFFF'
        };
        
        this.presets = {
            classic: { fg: '#000000', bg: '#FFFFFF' },
            viking: { fg: '#8B4513', bg: '#F5F5DC' },
            ice: { fg: '#4682B4', bg: '#F0F8FF' },
            fire: { fg: '#8B0000', bg: '#FFFAF0' }
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
            
            document.getElementById('foreground-color').value = preset.fg;
            document.getElementById('background-color').value = preset.bg;
            
            this.generateQR();
        }
    }
    
    async generateQR() {
        try {
            const canvas = document.getElementById('qr-canvas');
            
            // Configurazione QRCode.js
            const options = {
                errorCorrectionLevel: this.config.errorCorrection,
                type: 'image/png',
                quality: 0.92,
                width: this.config.size,
                margin: 2,
                color: {
                    dark: this.config.foregroundColor,
                    light: this.config.backgroundColor
                }
            };
            
            // Genera QR usando la libreria ufficiale
            await QRCode.toCanvas(canvas, this.config.text, options);
            
            this.showStatus('success', '✅ QR Code generato correttamente');
            
        } catch (error) {
            console.error('Errore generazione QR:', error);
            this.showStatus('error', '❌ Errore nella generazione del QR Code');
        }
    }
    
    downloadPNG() {
        const canvas = document.getElementById('qr-canvas');
        const link = document.createElement('a');
        link.download = `viking-qr-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        this.showStatus('success', '📱 PNG scaricato!');
    }
    
    async downloadSVG() {
        try {
            const options = {
                errorCorrectionLevel: this.config.errorCorrection,
                type: 'svg',
                width: this.config.size,
                margin: 2,
                color: {
                    dark: this.config.foregroundColor,
                    light: this.config.backgroundColor
                }
            };
            
            const svgString = await QRCode.toString(this.config.text, options);
            
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
            backgroundColor: '#FFFFFF'
        };
        
        document.getElementById('qr-text').value = this.config.text;
        document.getElementById('size').value = this.config.size;
        document.getElementById('size-value').textContent = this.config.size;
        document.getElementById('error-correction').value = this.config.errorCorrection;
        document.getElementById('foreground-color').value = this.config.foregroundColor;
        document.getElementById('background-color').value = this.config.backgroundColor;
        
        this.applyPreset('classic');
        this.showStatus('success', '🔄 Impostazioni ripristinate');
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