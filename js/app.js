import { SimpleQR } from './qr-engine/simple-qr.js';

// ===== QR FORGE SEMPLIFICATO =====
class SimpleQRApp {
    constructor() {
        this.config = {
            text: 'https://esempio.com',
            size: 256,
            errorCorrection: 'M',
            foregroundColor: '#000000',
            backgroundColor: '#FFFFFF'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateQR();
        console.log('🔧 QR Generator semplificato inizializzato');
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
        
        // Preset semplificati
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
        
        // Preset colori semplificati
        const presets = {
            classic: { fg: '#000000', bg: '#FFFFFF' },
            blue: { fg: '#2F4F4F', bg: '#B0E0E6' },
            brown: { fg: '#8B4513', bg: '#F5F5DC' },
            dark: { fg: '#FFFFFF', bg: '#1a1a1a' }
        };
        
        const preset = presets[presetName];
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
            // Genera SVG
            const svgString = SimpleQR.generateSVG(this.config.text, {
                size: this.config.size,
                errorCorrection: this.config.errorCorrection,
                foregroundColor: this.config.foregroundColor,
                backgroundColor: this.config.backgroundColor
            });
            
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
    
    downloadPNG() {
        try {
            SimpleQR.generatePNG(this.config.text, {
                size: this.config.size,
                errorCorrection: this.config.errorCorrection,
                foregroundColor: this.config.foregroundColor,
                backgroundColor: this.config.backgroundColor
            }).then(blob => {
                const link = document.createElement('a');
                link.download = `qr-code-${Date.now()}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
                
                this.showStatus('success', '📱 PNG scaricato!');
            }).catch(error => {
                console.error('Errore PNG:', error);
                this.showStatus('error', '❌ Errore nella generazione PNG');
            });
        } catch (error) {
            console.error('Errore generazione PNG:', error);
            this.showStatus('error', '❌ Errore nella generazione PNG');
        }
    }
    
    async downloadSVG() {
        try {
            const svgString = SimpleQR.generateSVG(this.config.text, {
                size: this.config.size,
                errorCorrection: this.config.errorCorrection,
                foregroundColor: this.config.foregroundColor,
                backgroundColor: this.config.backgroundColor
            });
            
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const link = document.createElement('a');
            link.download = `qr-code-${Date.now()}.svg`;
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
    window.qrApp = new SimpleQRApp();
});