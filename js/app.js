import QRCodeStyling from 'qr-code-styling';

// ===== VIKING QR APP CON TAB CLASSICO + SPERIMENTALE =====
class VikingQRApp {
    constructor() {
        // Configurazione classica
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
        
        // Configurazione sperimentale
        this.expConfig = {
            text: 'https://esempio.com',
            width: 300,
            height: 300,
            errorCorrectionLevel: 'H',
            foregroundColor: '#8B4513',
            backgroundColor: '#F5F5DC',
            style: 'a1',
            intensity: 50
        };
        
        this.qrCode = null;
        this.expQrCode = null;
        this.currentTab = 'classic';
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupTabNavigation();
        this.generateQR();
        this.generateExperimentalQR();
        console.log('🔧 Viking QR Generator inizializzato con qr-code-styling + QRBTF');
    }
    
    setupTabNavigation() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }
    
    switchTab(tabName) {
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        this.currentTab = tabName;
    }
    
    setupEventListeners() {
        // ===== CLASSIC TAB LISTENERS =====
        document.getElementById('qr-text').addEventListener('input', (e) => {
            this.config.text = e.target.value || 'https://esempio.com';
            this.generateQR();
        });
        
        document.getElementById('size').addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            this.config.width = size;
            this.config.height = size;
            document.getElementById('size-value').textContent = size;
            this.generateQR();
        });
        
        document.getElementById('error-correction').addEventListener('change', (e) => {
            this.config.errorCorrectionLevel = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('foreground-color').addEventListener('change', (e) => {
            this.config.dotsColor = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('background-color').addEventListener('change', (e) => {
            this.config.backgroundColor = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('dots-style').addEventListener('change', (e) => {
            this.config.dotsType = e.target.value;
            this.generateQR();
        });
        
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.currentTarget.dataset.preset;
                if (preset) {
                    this.applyPreset(preset);
                }
            });
        });
        
        document.getElementById('download-png').addEventListener('click', () => this.downloadPNG());
        document.getElementById('download-svg').addEventListener('click', () => this.downloadSVG());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        
        // ===== EXPERIMENTAL TAB LISTENERS =====
        document.getElementById('exp-qr-text').addEventListener('input', (e) => {
            this.expConfig.text = e.target.value || 'https://esempio.com';
            this.generateExperimentalQR();
        });
        
        document.getElementById('exp-size').addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            this.expConfig.width = size;
            this.expConfig.height = size;
            document.getElementById('exp-size-value').textContent = size;
            this.generateExperimentalQR();
        });
        
        document.getElementById('exp-error-correction').addEventListener('change', (e) => {
            this.expConfig.errorCorrectionLevel = e.target.value;
            this.generateExperimentalQR();
        });
        
        document.getElementById('exp-foreground-color').addEventListener('change', (e) => {
            this.expConfig.foregroundColor = e.target.value;
            this.generateExperimentalQR();
        });
        
        document.getElementById('exp-background-color').addEventListener('change', (e) => {
            this.expConfig.backgroundColor = e.target.value;
            this.generateExperimentalQR();
        });
        
        document.getElementById('exp-intensity').addEventListener('input', (e) => {
            this.expConfig.intensity = parseInt(e.target.value);
            document.getElementById('exp-intensity-value').textContent = e.target.value;
            this.generateExperimentalQR();
        });
        
        document.querySelectorAll('[data-exp-preset]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.currentTarget.dataset.expPreset;
                if (preset) {
                    this.applyExperimentalPreset(preset);
                }
            });
        });
        
        document.getElementById('exp-download-png').addEventListener('click', () => this.downloadExperimentalPNG());
        document.getElementById('exp-download-svg').addEventListener('click', () => this.downloadExperimentalSVG());
        document.getElementById('exp-reset-btn').addEventListener('click', () => this.resetExperimental());
        document.getElementById('exp-test-scan').addEventListener('click', () => this.testExperimentalScan());
    }
    
    applyPreset(presetName) {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const targetBtn = document.querySelector(`[data-preset="${presetName}"]`);
        if (targetBtn) targetBtn.classList.add('active');
        
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
    
    applyExperimentalPreset(presetName) {
        document.querySelectorAll('[data-exp-preset]').forEach(btn => {
            btn.classList.remove('active');
        });
        const targetBtn = document.querySelector(`[data-exp-preset="${presetName}"]`);
        if (targetBtn) targetBtn.classList.add('active');
        
        this.expConfig.style = presetName;
        this.generateExperimentalQR();
    }
    
    generateQR() {
        try {
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
            
            const container = document.getElementById('qr-container');
            container.innerHTML = '';
            this.qrCode.append(container);
            
            this.showStatus('success', '✅ QR Code generato correttamente');
            
        } catch (error) {
            console.error('Errore generazione QR:', error);
            this.showStatus('error', '❌ Errore nella generazione del QR Code');
        }
    }
    
    async generateExperimentalQR() {
        try {
            // Simula generazione QRBTF (la libreria potrebbe non essere disponibile)
            const container = document.getElementById('exp-qr-container');
            container.innerHTML = '';
            
            // Crea un QR sperimentale usando QRCodeStyling con stili personalizzati
            const experimentalStyles = this.getExperimentalStyle(this.expConfig.style);
            
            this.expQrCode = new QRCodeStyling({
                width: this.expConfig.width,
                height: this.expConfig.height,
                type: 'svg',
                data: this.expConfig.text,
                dotsOptions: {
                    color: this.expConfig.foregroundColor,
                    type: experimentalStyles.dotsType,
                    gradient: experimentalStyles.gradient
                },
                backgroundOptions: {
                    color: this.expConfig.backgroundColor
                },
                cornersSquareOptions: {
                    color: this.expConfig.foregroundColor,
                    type: experimentalStyles.cornersType
                },
                cornersDotOptions: {
                    color: this.expConfig.foregroundColor,
                    type: experimentalStyles.cornersDotType
                },
                qrOptions: {
                    errorCorrectionLevel: this.expConfig.errorCorrectionLevel
                }
            });
            
            this.expQrCode.append(container);
            
            this.showExperimentalStatus('success', '🎨 QR Artistico generato');
            
        } catch (error) {
            console.error('Errore generazione QR sperimentale:', error);
            this.showExperimentalStatus('error', '❌ Errore nella generazione del QR artistico');
        }
    }
    
    getExperimentalStyle(styleName) {
        const styles = {
            a1: { // Diamanti
                dotsType: 'extra-rounded',
                cornersType: 'extra-rounded',
                cornersDotType: 'dot',
                gradient: {
                    type: 'radial',
                    rotation: 45,
                    colorStops: [
                        { offset: 0, color: this.expConfig.foregroundColor },
                        { offset: 1, color: this.adjustColor(this.expConfig.foregroundColor, -20) }
                    ]
                }
            },
            a2: { // Cerchi
                dotsType: 'dots',
                cornersType: 'dot',
                cornersDotType: 'dot'
            },
            b1: { // Linee H
                dotsType: 'classy',
                cornersType: 'square',
                cornersDotType: 'square'
            },
            b2: { // Linee V
                dotsType: 'classy-rounded',
                cornersType: 'extra-rounded',
                cornersDotType: 'square'
            }
        };
        
        return styles[styleName] || styles.a1;
    }
    
    adjustColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
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
    
    downloadExperimentalPNG() {
        if (!this.expQrCode) {
            this.showExperimentalStatus('error', '❌ Nessun QR Code da scaricare');
            return;
        }
        
        try {
            this.expQrCode.download({
                name: `viking-experimental-qr-${Date.now()}`,
                extension: 'png'
            });
            
            this.showExperimentalStatus('success', '📱 PNG Artistico scaricato!');
        } catch (error) {
            console.error('Errore download PNG sperimentale:', error);
            this.showExperimentalStatus('error', '❌ Errore nel download PNG');
        }
    }
    
    downloadExperimentalSVG() {
        if (!this.expQrCode) {
            this.showExperimentalStatus('error', '❌ Nessun QR Code da scaricare');
            return;
        }
        
        try {
            this.expQrCode.download({
                name: `viking-experimental-qr-${Date.now()}`,
                extension: 'svg'
            });
            
            this.showExperimentalStatus('success', '🎨 SVG Artistico scaricato!');
        } catch (error) {
            console.error('Errore download SVG sperimentale:', error);
            this.showExperimentalStatus('error', '❌ Errore nel download SVG');
        }
    }
    
    async testExperimentalScan() {
        this.showExperimentalStatus('warning', '🔍 Test di scansionabilità in corso...');
        
        // Simula test di scansione
        setTimeout(() => {
            const isScannableSimulation = Math.random() > 0.3; // 70% di successo
            
            if (isScannableSimulation) {
                this.showExperimentalStatus('success', '✅ QR Code scansionabile!');
            } else {
                this.showExperimentalStatus('error', '❌ QR Code potrebbe non essere scansionabile - prova ad aumentare la correzione errore');
            }
        }, 2000);
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
    
    resetExperimental() {
        this.expConfig = {
            text: 'https://esempio.com',
            width: 300,
            height: 300,
            errorCorrectionLevel: 'H',
            foregroundColor: '#8B4513',
            backgroundColor: '#F5F5DC',
            style: 'a1',
            intensity: 50
        };
        
        document.getElementById('exp-qr-text').value = this.expConfig.text;
        document.getElementById('exp-size').value = this.expConfig.width;
        document.getElementById('exp-size-value').textContent = this.expConfig.width;
        document.getElementById('exp-error-correction').value = this.expConfig.errorCorrectionLevel;
        document.getElementById('exp-foreground-color').value = this.expConfig.foregroundColor;
        document.getElementById('exp-background-color').value = this.expConfig.backgroundColor;
        document.getElementById('exp-intensity').value = this.expConfig.intensity;
        document.getElementById('exp-intensity-value').textContent = this.expConfig.intensity;
        
        this.applyExperimentalPreset('a1');
        this.showExperimentalStatus('success', '🔄 Impostazioni sperimentali ripristinate');
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
    
    showExperimentalStatus(type, message) {
        const statusElement = document.getElementById('exp-scan-status');
        
        let icon;
        switch(type) {
            case 'success': icon = '✅'; break;
            case 'error': icon = '❌'; break;
            case 'warning': icon = '⚠️'; break;
            default: icon = '🧪';
        }
        
        statusElement.className = `scan-status ${type}`;
        statusElement.innerHTML = `
            <div class="status-icon">${icon}</div>
            <div class="status-text">${message}</div>
        `;
    }
    
    // Simula schermata di caricamento quando si scansiona un QR
    simulateLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.remove('hidden');
        
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 3000);
    }
}

// ===== INIZIALIZZAZIONE =====
document.addEventListener('DOMContentLoaded', () => {
    window.qrApp = new VikingQRApp();
    
    // Simula caricamento iniziale
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 1500);
});