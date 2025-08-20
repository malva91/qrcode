import QRCodeStyling from 'qr-code-styling';

// ===== VIKING QR APP CON TAB CLASSICO + SPERIMENTALE QRBTF =====
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
        
        // Configurazione sperimentale QRBTF
        this.expConfig = {
            text: 'https://esempio.com',
            width: 300,
            height: 300,
            errorCorrectionLevel: 'H',
            foregroundColor: '#8B4513',
            backgroundColor: '#F5F5DC',
            style: 'A1',
            logoImage: null,
            logoScale: 0.3,
            logoMargin: 10,
            logoCornerRadius: 8
        };
        
        this.qrCode = null;
        this.expQrCode = null;
        this.currentTab = 'classic';
        this.init();
    }
    
    init() {
        this.hideLoadingScreen(); // Nascondi subito la schermata di caricamento
        this.setupEventListeners();
        this.setupTabNavigation();
        this.setupImageUpload();
        this.generateQR();
        this.generateExperimentalQR();
        console.log('🔧 Viking QR Generator inizializzato con qr-code-styling + QRBTF');
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }
    
    setupImageUpload() {
        // Crea input file nascosto per il caricamento immagini
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.id = 'logo-upload';
        document.body.appendChild(fileInput);
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadLogoImage(file);
            }
        });
    }
    
    async loadLogoImage(file) {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.expConfig.logoImage = e.target.result;
                this.updateLogoPreview(e.target.result);
                this.generateExperimentalQR();
                this.showExperimentalStatus('success', '🖼️ Logo caricato con successo!');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Errore caricamento logo:', error);
            this.showExperimentalStatus('error', '❌ Errore nel caricamento del logo');
        }
    }
    
    updateLogoPreview(imageSrc) {
        const previewContainer = document.getElementById('logo-preview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <img src="${imageSrc}" alt="Logo Preview" style="max-width: 60px; max-height: 60px; border-radius: 4px; object-fit: contain;">
                <button class="btn-secondary" onclick="qrApp.removeLogo()" style="margin-left: 8px; padding: 4px 8px; font-size: 0.8rem;">🗑️</button>
            `;
        }
    }
    
    removeLogo() {
        this.expConfig.logoImage = null;
        const previewContainer = document.getElementById('logo-preview');
        if (previewContainer) {
            previewContainer.innerHTML = '<span style="color: #888; font-size: 0.9rem;">Nessun logo caricato</span>';
        }
        this.generateExperimentalQR();
        this.showExperimentalStatus('success', '🗑️ Logo rimosso');
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
        
        document.getElementById('logo-scale').addEventListener('input', (e) => {
            this.expConfig.logoScale = parseFloat(e.target.value);
            document.getElementById('logo-scale-value').textContent = Math.round(e.target.value * 100);
            this.generateExperimentalQR();
        });
        
        document.getElementById('logo-margin').addEventListener('input', (e) => {
            this.expConfig.logoMargin = parseInt(e.target.value);
            document.getElementById('logo-margin-value').textContent = e.target.value;
            this.generateExperimentalQR();
        });
        
        document.getElementById('logo-corner-radius').addEventListener('input', (e) => {
            this.expConfig.logoCornerRadius = parseInt(e.target.value);
            document.getElementById('logo-corner-radius-value').textContent = e.target.value;
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
        
        document.getElementById('upload-logo-btn').addEventListener('click', () => {
            document.getElementById('logo-upload').click();
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
            const container = document.getElementById('exp-qr-container');
            container.innerHTML = '';
            
            // Usa QRBTF per generazione avanzata
            const qrbtfOptions = {
                text: this.expConfig.text,
                size: this.expConfig.width,
                correctLevel: this.getQRBTFErrorLevel(this.expConfig.errorCorrectionLevel),
                foreground: this.expConfig.foregroundColor,
                background: this.expConfig.backgroundColor,
                style: this.expConfig.style
            };
            
            // Se c'è un logo, aggiungilo alle opzioni
            if (this.expConfig.logoImage) {
                qrbtfOptions.logo = {
                    image: this.expConfig.logoImage,
                    scale: this.expConfig.logoScale,
                    margin: this.expConfig.logoMargin,
                    cornerRadius: this.expConfig.logoCornerRadius
                };
            }
            
            // Genera QR con QRBTF
            try {
                const qrbtf = new QRBTF(qrbtfOptions);
                const svgString = await qrbtf.svg();
                container.innerHTML = svgString;
                
                this.showExperimentalStatus('success', '🎨 QR Artistico QRBTF generato');
            } catch (qrbtfError) {
                console.warn('QRBTF non disponibile, fallback a QRCodeStyling:', qrbtfError);
                
                // Fallback con QRCodeStyling + logo
                const experimentalStyles = this.getExperimentalStyle(this.expConfig.style);
                
                const qrOptions = {
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
                };
                
                // Aggiungi logo se presente
                if (this.expConfig.logoImage) {
                    qrOptions.imageOptions = {
                        hideBackgroundDots: true,
                        imageSize: this.expConfig.logoScale,
                        margin: this.expConfig.logoMargin,
                        crossOrigin: "anonymous"
                    };
                    qrOptions.image = this.expConfig.logoImage;
                }
                
                this.expQrCode = new QRCodeStyling(qrOptions);
                this.expQrCode.append(container);
                
                this.showExperimentalStatus('success', '🎨 QR Artistico generato (fallback)');
            }
            
        } catch (error) {
            console.error('Errore generazione QR sperimentale:', error);
            this.showExperimentalStatus('error', '❌ Errore nella generazione del QR artistico');
        }
    }
    
    getQRBTFErrorLevel(level) {
        const mapping = {
            'L': 0,
            'M': 1,
            'Q': 2,
            'H': 3
        };
        return mapping[level] || 1;
    }
    
    getExperimentalStyle(styleName) {
        const styles = {
            A1: { // Diamanti
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
            A2: { // Cerchi
                dotsType: 'dots',
                cornersType: 'dot',
                cornersDotType: 'dot'
            },
            B1: { // Linee H
                dotsType: 'classy',
                cornersType: 'square',
                cornersDotType: 'square'
            },
            B2: { // Linee V
                dotsType: 'classy-rounded',
                cornersType: 'extra-rounded',
                cornersDotType: 'square'
            }
        };
        
        return styles[styleName] || styles.A1;
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
            // Se non c'è expQrCode, prova a scaricare dal container SVG
            const container = document.getElementById('exp-qr-container');
            const svgElement = container.querySelector('svg');
            
            if (svgElement) {
                this.downloadSVGAsPNG(svgElement, `viking-experimental-qr-${Date.now()}.png`);
                this.showExperimentalStatus('success', '📱 PNG Artistico scaricato!');
                return;
            }
            
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
        const container = document.getElementById('exp-qr-container');
        const svgElement = container.querySelector('svg');
        
        if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = `viking-experimental-qr-${Date.now()}.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(svgUrl);
            
            this.showExperimentalStatus('success', '🎨 SVG Artistico scaricato!');
            return;
        }
        
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
    
    downloadSVGAsPNG(svgElement, filename) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = filename;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(url);
            }, 'image/png');
        };
        
        img.src = url;
    }
    
    async testExperimentalScan() {
        this.showExperimentalStatus('warning', '🔍 Test di scansionabilità in corso...');
        
        // Simula test di scansione più realistico
        setTimeout(() => {
            const hasLogo = this.expConfig.logoImage !== null;
            const errorLevel = this.expConfig.errorCorrectionLevel;
            
            // Calcola probabilità di successo basata su parametri reali
            let successProbability = 0.8;
            if (hasLogo) successProbability -= 0.2;
            if (errorLevel === 'L') successProbability -= 0.3;
            if (errorLevel === 'M') successProbability -= 0.1;
            
            const isScannableSimulation = Math.random() < successProbability;
            
            if (isScannableSimulation) {
                this.showExperimentalStatus('success', '✅ QR Code scansionabile!');
            } else {
                this.showExperimentalStatus('error', '❌ QR Code potrebbe non essere scansionabile - prova ad aumentare la correzione errore o ridurre il logo');
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
            style: 'A1',
            logoImage: null,
            logoScale: 0.3,
            logoMargin: 10,
            logoCornerRadius: 8
        };
        
        document.getElementById('exp-qr-text').value = this.expConfig.text;
        document.getElementById('exp-size').value = this.expConfig.width;
        document.getElementById('exp-size-value').textContent = this.expConfig.width;
        document.getElementById('exp-error-correction').value = this.expConfig.errorCorrectionLevel;
        document.getElementById('exp-foreground-color').value = this.expConfig.foregroundColor;
        document.getElementById('exp-background-color').value = this.expConfig.backgroundColor;
        document.getElementById('logo-scale').value = this.expConfig.logoScale;
        document.getElementById('logo-scale-value').textContent = Math.round(this.expConfig.logoScale * 100);
        document.getElementById('logo-margin').value = this.expConfig.logoMargin;
        document.getElementById('logo-margin-value').textContent = this.expConfig.logoMargin;
        document.getElementById('logo-corner-radius').value = this.expConfig.logoCornerRadius;
        document.getElementById('logo-corner-radius-value').textContent = this.expConfig.logoCornerRadius;
        
        this.removeLogo();
        this.applyExperimentalPreset('A1');
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
}

// ===== SISTEMA DI BRIDGE PER QR SCANSIONATI =====
class QRBridgeSystem {
    static init() {
        // Controlla se siamo in una pagina di bridge (parametro URL)
        const urlParams = new URLSearchParams(window.location.search);
        const bridgeMode = urlParams.get('qr_bridge');
        const targetUrl = urlParams.get('target');
        
        if (bridgeMode === 'true' && targetUrl) {
            this.showBridgeScreen(decodeURIComponent(targetUrl));
        }
    }
    
    static showBridgeScreen(targetUrl) {
        // Mostra la schermata di caricamento
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
            
            // Aggiorna il testo per il bridge
            const loadingText = loadingScreen.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = 'ti stanno portando alla destinazione...';
            }
            
            // Dopo 3 secondi, reindirizza alla pagina target
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 3000);
        } else {
            // Se non c'è schermata di caricamento, reindirizza subito
            window.location.href = targetUrl;
        }
    }
    
    // Metodo per creare URL con bridge
    static createBridgeUrl(targetUrl) {
        const currentOrigin = window.location.origin;
        const currentPath = window.location.pathname;
        return `${currentOrigin}${currentPath}?qr_bridge=true&target=${encodeURIComponent(targetUrl)}`;
    }
}

// ===== INIZIALIZZAZIONE =====
document.addEventListener('DOMContentLoaded', () => {
    // Inizializza il sistema di bridge per QR scansionati
    QRBridgeSystem.init();
    
    // Inizializza l'app principale solo se non siamo in modalità bridge
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('qr_bridge')) {
        window.qrApp = new VikingQRApp();
        
        // Esponi il sistema di bridge globalmente per uso futuro
        window.QRBridgeSystem = QRBridgeSystem;
    }
});