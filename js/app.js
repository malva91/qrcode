import QRCodeStyling from 'qr-code-styling';

// ===== QR FORGE CON QR-CODE-STYLING =====
class VikingQRApp {
    constructor() {
        this.config = {
            text: 'https://esempio.com',
            width: 300,
            height: 300,
            type: 'svg',
            errorCorrectionLevel: 'M',
            dotsColor: '#000000',
            backgroundColor: '#FFFFFF',
            dotsType: 'square',
            cornersSquareType: 'square',
            cornersDotType: 'square'
        };
        
        this.qrCode = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateQR();
        console.log('🔧 Viking QR Generator inizializzato con qr-code-styling');
    }
    
    setupEventListeners() {
        // Input testo
        document.getElementById('qr-text').addEventListener('input', (e) => {
            this.config.text = e.target.value || 'https://esempio.com';
            this.generateQR();
        });
        
        // Dimensione
        document.getElementById('size').addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            this.config.width = size;
            this.config.height = size;
            document.getElementById('size-value').textContent = size;
            this.generateQR();
        });
        
        // Correzione errore
        document.getElementById('error-correction').addEventListener('change', (e) => {
            this.config.errorCorrectionLevel = e.target.value;
            this.generateQR();
        });
        
        // Colori
        document.getElementById('foreground-color').addEventListener('change', (e) => {
            this.config.dotsColor = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('background-color').addEventListener('change', (e) => {
            this.config.backgroundColor = e.target.value;
            this.generateQR();
        });
        
        // Stile dots
        document.getElementById('dots-style').addEventListener('change', (e) => {
            this.config.dotsType = e.target.value;
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
        
        const presets = {
            classic: { 
                dotsColor: '#000000', 
                backgroundColor: '#FFFFFF',
                dotsType: 'square'
            },
            rounded: { 
                dotsColor: '#2F4F4F', 
                backgroundColor: '#B0E0E6',
                dotsType: 'rounded'
            },
            dots: { 
                dotsColor: '#8B4513', 
                backgroundColor: '#F5F5DC',
                dotsType: 'dots'
            },
            extra_rounded: { 
                dotsColor: '#FFFFFF', 
                backgroundColor: '#1a1a1a',
                dotsType: 'extra-rounded'
            }
        };
        
        const preset = presets[presetName];
        if (preset) {
            this.config.dotsColor = preset.dotsColor;
            this.config.backgroundColor = preset.backgroundColor;
            this.config.dotsType = preset.dotsType;
            
            document.getElementById('foreground-color').value = preset.dotsColor;
            document.getElementById('background-color').value = preset.backgroundColor;
            document.getElementById('dots-style').value = preset.dotsType;
            
            this.generateQR();
        }
    }
    
    generateQR() {
        try {
            // Crea nuovo QR code con configurazione aggiornata
            this.qrCode = new QRCodeStyling({
                width: this.config.width,
                height: this.config.height,
                type: this.config.type,
                data: this.config.text,
                dotsOptions: {
                    color: this.config.dotsColor,
                    type: this.config.dotsType
                },
                backgroundOptions: {
                    color: this.config.backgroundColor
                },
                cornersSquareOptions: {
                    color: this.config.dotsColor,
                    type: this.config.cornersSquareType
                },
                cornersDotOptions: {
                    color: this.config.dotsColor,
                    type: this.config.cornersDotType
                },
                qrOptions: {
                    errorCorrectionLevel: this.config.errorCorrectionLevel
                }
            });
            
            // Pulisci il container precedente
            const container = document.getElementById('qr-container');
            container.innerHTML = '';
            
            // Aggiungi il nuovo QR
            this.qrCode.append(container);
            
            this.showStatus('success', '✅ QR Code generato correttamente');
            
        } catch (error) {
            console.error('Errore generazione QR:', error);
            this.showStatus('error', '❌ Errore nella generazione del QR Code');
        }
    }
    
    downloadPNG() {
        if (!this.qrCode) {
            this.showStatus('error', '❌ Nessun QR Code da scaricare');
            return;
        }
        
        try {
            this.qrCode.download({
                name: `viking-qr-${Date.now()}`,
                extension: 'png'
            });
            
            this.showStatus('success', '📱 PNG scaricato!');
        } catch (error) {
            console.error('Errore download PNG:', error);
            this.showStatus('error', '❌ Errore nel download PNG');
        }
    }
    
    downloadSVG() {
        if (!this.qrCode) {
            this.showStatus('error', '❌ Nessun QR Code da scaricare');
            return;
        }
        
        try {
            this.qrCode.download({
                name: `viking-qr-${Date.now()}`,
                extension: 'svg'
            });
            
            this.showStatus('success', '🎨 SVG scaricato!');
        } catch (error) {
            console.error('Errore download SVG:', error);
            this.showStatus('error', '❌ Errore nel download SVG');
        }
    }
    
    reset() {
        this.config = {
            text: 'https://esempio.com',
            width: 300,
            height: 300,
            type: 'svg',
            errorCorrectionLevel: 'M',
            dotsColor: '#000000',
            backgroundColor: '#FFFFFF',
            dotsType: 'square',
            cornersSquareType: 'square',
            cornersDotType: 'square'
        };
        
        document.getElementById('qr-text').value = this.config.text;
        document.getElementById('size').value = this.config.width;
        document.getElementById('size-value').textContent = this.config.width;
        document.getElementById('error-correction').value = this.config.errorCorrectionLevel;
        document.getElementById('foreground-color').value = this.config.dotsColor;
        document.getElementById('background-color').value = this.config.backgroundColor;
        document.getElementById('dots-style').value = this.config.dotsType;
        
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
    window.qrApp = new VikingQRApp();
});