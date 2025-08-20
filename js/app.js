import QRCodeStyling from 'qr-code-styling';

// ===== QR FORGE VICHINGO =====
class QRForgeVichingo {
    constructor() {
        this.config = {
            text: 'bridge.html',
            width: 400,
            height: 400,
            type: 'svg',
            errorCorrectionLevel: 'H', // Sempre H per logo-shaped
            dotsColor: '#2c3e50',
            backgroundColor: '#ffffff',
            dotsType: 'square',
            cornersSquareType: 'square',
            cornersDotType: 'square',
            logoImage: null,
            logoMode: 'center', // center, background, shaped
            logoScale: 0.25,
            logoMargin: 8,
            logoInfluence: 0.8, // Per logo-shaped
            contrastThreshold: 0.5 // Per logo-shaped
        };
        
        this.qrCode = null;
        this.logoImageData = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupImageUpload();
        this.generateQR();
        console.log('⚔️ QR Forge Vichingo inizializzato');
    }
    
    setupImageUpload() {
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
                this.config.logoImage = e.target.result;
                this.processLogoForShaping(e.target.result);
                this.updateLogoPreview(e.target.result);
                this.generateQR();
                this.showStatus('success', '🖼️ Logo caricato con successo!');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Errore caricamento logo:', error);
            this.showStatus('error', '❌ Errore nel caricamento del logo');
        }
    }
    
    async processLogoForShaping(imageSrc) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Dimensioni ottimali per il processing
                const size = 200;
                canvas.width = size;
                canvas.height = size;
                
                // Disegna l'immagine scalata
                ctx.drawImage(img, 0, 0, size, size);
                
                // Ottieni i dati dell'immagine
                const imageData = ctx.getImageData(0, 0, size, size);
                this.logoImageData = imageData;
                
                resolve(imageData);
            };
            img.src = imageSrc;
        });
    }
    
    updateLogoPreview(imageSrc) {
        const previewContainer = document.getElementById('logo-preview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <img src="${imageSrc}" alt="Logo Preview" style="max-width: 100%; max-height: 80px; object-fit: contain;">
                <button class="btn-secondary remove-logo-btn" onclick="qrApp.removeLogo()" style="margin-left: 10px; padding: 5px 10px; font-size: 0.8rem;">🗑️</button>
            `;
        }
    }
    
    removeLogo() {
        this.config.logoImage = null;
        this.logoImageData = null;
        const previewContainer = document.getElementById('logo-preview');
        if (previewContainer) {
            previewContainer.innerHTML = '<span class="no-logo-text">Nessun logo caricato</span>';
        }
        this.generateQR();
        this.showStatus('success', '🗑️ Logo rimosso');
    }
    
    setupEventListeners() {
        // Testo QR
        document.getElementById('qr-text').addEventListener('input', (e) => {
            this.config.text = e.target.value || 'bridge.html';
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
        
        // Colori
        document.getElementById('foreground-color').addEventListener('change', (e) => {
            this.config.dotsColor = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('background-color').addEventListener('change', (e) => {
            this.config.backgroundColor = e.target.value;
            this.generateQR();
        });
        
        // Stili
        document.getElementById('dots-style').addEventListener('change', (e) => {
            this.config.dotsType = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('corners-style').addEventListener('change', (e) => {
            this.config.cornersSquareType = e.target.value;
            this.config.cornersDotType = e.target.value;
            this.generateQR();
        });
        
        // Logo mode
        document.getElementById('logo-mode').addEventListener('change', (e) => {
            this.config.logoMode = e.target.value;
            this.toggleLogoShapedControls();
            this.generateQR();
        });
        
        // Logo settings
        document.getElementById('logo-scale').addEventListener('input', (e) => {
            this.config.logoScale = parseFloat(e.target.value);
            document.getElementById('logo-scale-value').textContent = Math.round(e.target.value * 100);
            this.generateQR();
        });
        
        document.getElementById('logo-margin').addEventListener('input', (e) => {
            this.config.logoMargin = parseInt(e.target.value);
            document.getElementById('logo-margin-value').textContent = e.target.value;
            this.generateQR();
        });
        
        // Logo-shaped controls
        document.getElementById('logo-influence').addEventListener('input', (e) => {
            this.config.logoInfluence = parseFloat(e.target.value) / 100;
            document.getElementById('logo-influence-value').textContent = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('contrast-threshold').addEventListener('input', (e) => {
            this.config.contrastThreshold = parseFloat(e.target.value) / 100;
            document.getElementById('contrast-threshold-value').textContent = e.target.value;
            this.generateQR();
        });
        
        // Template buttons
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.currentTarget.dataset.template;
                if (template) {
                    this.applyTemplate(template);
                }
            });
        });
        
        // Action buttons
        document.getElementById('upload-logo-btn').addEventListener('click', () => {
            document.getElementById('logo-upload').click();
        });
        
        document.getElementById('download-png').addEventListener('click', () => this.downloadPNG());
        document.getElementById('download-svg').addEventListener('click', () => this.downloadSVG());
        document.getElementById('test-scan').addEventListener('click', () => this.testScan());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
    }
    
    toggleLogoShapedControls() {
        const controls = document.getElementById('logo-shaped-controls');
        if (controls) {
            controls.style.display = this.config.logoMode === 'shaped' ? 'block' : 'none';
        }
    }
    
    applyTemplate(templateName) {
        // Update active button
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const targetBtn = document.querySelector(`[data-template="${templateName}"]`);
        if (targetBtn) targetBtn.classList.add('active');
        
        const templates = {
            classic: { 
                dotsColor: '#000000', 
                backgroundColor: '#ffffff',
                dotsType: 'square',
                cornersSquareType: 'square',
                cornersDotType: 'square',
                logoMode: 'center'
            },
            rounded: { 
                dotsColor: '#3b82f6', 
                backgroundColor: '#f1f5f9',
                dotsType: 'rounded',
                cornersSquareType: 'extra-rounded',
                cornersDotType: 'dot',
                logoMode: 'center'
            },
            dots: { 
                dotsColor: '#8b5cf6', 
                backgroundColor: '#faf5ff',
                dotsType: 'dots',
                cornersSquareType: 'dot',
                cornersDotType: 'dot',
                logoMode: 'center'
            },
            professional: { 
                dotsColor: '#f59e0b', 
                backgroundColor: '#1f2937',
                dotsType: 'extra-rounded',
                cornersSquareType: 'extra-rounded',
                cornersDotType: 'square',
                logoMode: 'background'
            },
            'logo-shaped': {
                dotsColor: '#d4af37',
                backgroundColor: '#1a1a2e',
                dotsType: 'diamond',
                cornersSquareType: 'extra-rounded',
                cornersDotType: 'dot',
                logoMode: 'shaped'
            }
        };
        
        const template = templates[templateName];
        if (template) {
            this.config.dotsColor = template.dotsColor;
            this.config.backgroundColor = template.backgroundColor;
            this.config.dotsType = template.dotsType;
            this.config.cornersSquareType = template.cornersSquareType;
            this.config.cornersDotType = template.cornersDotType;
            this.config.logoMode = template.logoMode;
            
            // Update UI
            document.getElementById('foreground-color').value = template.dotsColor;
            document.getElementById('background-color').value = template.backgroundColor;
            document.getElementById('dots-style').value = template.dotsType;
            document.getElementById('corners-style').value = template.cornersSquareType;
            document.getElementById('logo-mode').value = template.logoMode;
            
            this.toggleLogoShapedControls();
            this.generateQR();
        }
    }
    
    generateQR() {
        try {
            if (this.config.logoMode === 'shaped' && this.config.logoImage && this.logoImageData) {
                this.generateLogoShapedQR();
            } else {
                this.generateStandardQR();
            }
        } catch (error) {
            console.error('Errore generazione QR:', error);
            this.showStatus('error', '❌ Errore nella generazione del QR Code');
        }
    }
    
    generateStandardQR() {
        const qrOptions = {
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
        };
        
        // Add logo if present and in center mode
        if (this.config.logoImage && this.config.logoMode === 'center') {
            qrOptions.imageOptions = {
                hideBackgroundDots: true,
                imageSize: this.config.logoScale,
                margin: this.config.logoMargin,
                crossOrigin: "anonymous"
            };
            qrOptions.image = this.config.logoImage;
        }
        
        this.qrCode = new QRCodeStyling(qrOptions);
        
        const container = document.getElementById('qr-container');
        container.innerHTML = '';
        
        this.qrCode.append(container);
        
        // Apply background pattern if needed
        if (this.config.logoImage && this.config.logoMode === 'background') {
            setTimeout(() => this.applyBackgroundPattern(container), 200);
        }
        
        this.showStatus('success', '✅ QR Code generato correttamente');
    }
    
    generateLogoShapedQR() {
        if (!this.logoImageData) {
            this.generateStandardQR();
            return;
        }
        
        // Genera prima un QR standard per ottenere la matrice
        const tempQR = new QRCodeStyling({
            width: this.config.width,
            height: this.config.height,
            type: 'canvas',
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
                errorCorrectionLevel: 'H' // Sempre H per logo-shaped
            }
        });
        
        const tempContainer = document.createElement('div');
        tempQR.append(tempContainer);
        
        setTimeout(() => {
            const canvas = tempContainer.querySelector('canvas');
            if (canvas) {
                this.applyLogoShaping(canvas);
            }
        }, 100);
    }
    
    applyLogoShaping(sourceCanvas) {
        const container = document.getElementById('qr-container');
        container.innerHTML = '';
        
        // Crea un nuovo canvas per il risultato
        const resultCanvas = document.createElement('canvas');
        const ctx = resultCanvas.getContext('2d');
        resultCanvas.width = this.config.width;
        resultCanvas.height = this.config.height;
        
        // Disegna il QR base
        ctx.drawImage(sourceCanvas, 0, 0);
        
        // Ottieni i dati del QR
        const qrImageData = ctx.getImageData(0, 0, resultCanvas.width, resultCanvas.height);
        const qrData = qrImageData.data;
        
        // Scala i dati del logo alle dimensioni del QR
        const logoSize = this.logoImageData.width;
        const qrSize = resultCanvas.width;
        const scale = qrSize / logoSize;
        
        // Applica il logo shaping
        for (let y = 0; y < resultCanvas.height; y++) {
            for (let x = 0; x < resultCanvas.width; x++) {
                const qrIndex = (y * resultCanvas.width + x) * 4;
                
                // Calcola la posizione corrispondente nel logo
                const logoX = Math.floor(x / scale);
                const logoY = Math.floor(y / scale);
                
                if (logoX < logoSize && logoY < logoSize) {
                    const logoIndex = (logoY * logoSize + logoX) * 4;
                    
                    // Calcola la luminanza del logo
                    const logoR = this.logoImageData.data[logoIndex];
                    const logoG = this.logoImageData.data[logoIndex + 1];
                    const logoB = this.logoImageData.data[logoIndex + 2];
                    const logoA = this.logoImageData.data[logoIndex + 3];
                    
                    if (logoA > 0) { // Solo se il pixel del logo non è trasparente
                        const luminance = (0.299 * logoR + 0.587 * logoG + 0.114 * logoB) / 255;
                        
                        // Determina se il pixel dovrebbe essere scuro o chiaro
                        const shouldBeDark = luminance < this.config.contrastThreshold;
                        
                        // Applica l'influenza del logo
                        const influence = this.config.logoInfluence;
                        
                        if (shouldBeDark) {
                            // Rendi il pixel più scuro
                            qrData[qrIndex] = Math.floor(qrData[qrIndex] * (1 - influence) + logoR * influence);
                            qrData[qrIndex + 1] = Math.floor(qrData[qrIndex + 1] * (1 - influence) + logoG * influence);
                            qrData[qrIndex + 2] = Math.floor(qrData[qrIndex + 2] * (1 - influence) + logoB * influence);
                        } else {
                            // Mantieni o schiarisci il pixel
                            const bgR = parseInt(this.config.backgroundColor.slice(1, 3), 16);
                            const bgG = parseInt(this.config.backgroundColor.slice(3, 5), 16);
                            const bgB = parseInt(this.config.backgroundColor.slice(5, 7), 16);
                            
                            qrData[qrIndex] = Math.floor(qrData[qrIndex] * (1 - influence * 0.5) + bgR * influence * 0.5);
                            qrData[qrIndex + 1] = Math.floor(qrData[qrIndex + 1] * (1 - influence * 0.5) + bgG * influence * 0.5);
                            qrData[qrIndex + 2] = Math.floor(qrData[qrIndex + 2] * (1 - influence * 0.5) + bgB * influence * 0.5);
                        }
                    }
                }
            }
        }
        
        // Applica i dati modificati
        ctx.putImageData(qrImageData, 0, 0);
        
        // Aggiungi il canvas al container
        container.appendChild(resultCanvas);
        
        // Aggiorna il riferimento per i download
        this.qrCode = {
            download: (options) => {
                const link = document.createElement('a');
                link.download = options.name + '.' + options.extension;
                
                if (options.extension === 'png') {
                    link.href = resultCanvas.toDataURL('image/png');
                } else {
                    // Per SVG, convertiamo il canvas
                    link.href = resultCanvas.toDataURL('image/png');
                }
                
                link.click();
            }
        };
        
        this.showStatus('success', '✨ QR Logo-Shaped generato!');
    }
    
    applyBackgroundPattern(container) {
        if (!this.config.logoImage) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.config.width;
        canvas.height = this.config.height;
        
        // Riempi lo sfondo
        ctx.fillStyle = this.config.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Carica l'immagine del logo
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = () => {
            // Pattern più visibile
            const patternSize = 60;
            const logoSize = patternSize * 0.7;
            const logoOffset = (patternSize - logoSize) / 2;
            
            // Disegna il pattern del logo
            for (let x = 0; x < canvas.width; x += patternSize) {
                for (let y = 0; y < canvas.height; y += patternSize) {
                    ctx.save();
                    ctx.globalAlpha = 0.25; // Più visibile
                    ctx.drawImage(logoImg, x + logoOffset, y + logoOffset, logoSize, logoSize);
                    ctx.restore();
                }
            }
            
            // Combina con il QR esistente
            const existingQR = container.querySelector('canvas, svg');
            if (existingQR) {
                const finalCanvas = document.createElement('canvas');
                const finalCtx = finalCanvas.getContext('2d');
                finalCanvas.width = this.config.width;
                finalCanvas.height = this.config.height;
                
                // Prima il pattern
                finalCtx.drawImage(canvas, 0, 0);
                
                // Poi il QR con blend mode
                finalCtx.globalCompositeOperation = 'multiply';
                if (existingQR.tagName === 'CANVAS') {
                    finalCtx.drawImage(existingQR, 0, 0);
                }
                
                container.innerHTML = '';
                container.appendChild(finalCanvas);
                
                // Aggiorna il riferimento per i download
                this.qrCode = {
                    download: (options) => {
                        const link = document.createElement('a');
                        link.download = options.name + '.' + options.extension;
                        link.href = finalCanvas.toDataURL('image/png');
                        link.click();
                    }
                };
            }
        };
        logoImg.src = this.config.logoImage;
    }
    
    downloadPNG() {
        if (!this.qrCode) {
            this.showStatus('error', '❌ Nessun QR Code da scaricare');
            return;
        }
        
        try {
            this.qrCode.download({
                name: `qr-vichingo-${Date.now()}`,
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
                name: `qr-vichingo-${Date.now()}`,
                extension: 'svg'
            });
            
            this.showStatus('success', '🎨 SVG scaricato!');
        } catch (error) {
            console.error('Errore download SVG:', error);
            this.showStatus('error', '❌ Errore nel download SVG');
        }
    }
    
    async testScan() {
        this.showStatus('warning', '🔍 Test di scansionabilità in corso...');
        
        setTimeout(() => {
            const hasLogo = this.config.logoImage !== null;
            const logoMode = this.config.logoMode;
            const logoSize = this.config.logoScale;
            
            let successProbability = 0.95;
            
            if (hasLogo) {
                if (logoMode === 'shaped') {
                    successProbability = 0.85; // Logo-shaped è più complesso
                } else if (logoMode === 'background') {
                    successProbability = 0.9;
                } else {
                    successProbability -= (logoSize * 0.3);
                }
            }
            
            const isScannableSimulation = Math.random() < successProbability;
            
            if (isScannableSimulation) {
                this.showStatus('success', '✅ QR Code scansionabile!');
            } else {
                this.showStatus('warning', '⚠️ QR Code potrebbe avere problemi di scansione - prova a ridurre l\'influenza del logo');
            }
        }, 2000);
    }
    
    reset() {
        this.config = {
            text: 'bridge.html',
            width: 400,
            height: 400,
            type: 'svg',
            errorCorrectionLevel: 'H',
            dotsColor: '#2c3e50',
            backgroundColor: '#ffffff',
            dotsType: 'square',
            cornersSquareType: 'square',
            cornersDotType: 'square',
            logoImage: null,
            logoMode: 'center',
            logoScale: 0.25,
            logoMargin: 8,
            logoInfluence: 0.8,
            contrastThreshold: 0.5
        };
        
        // Reset UI
        document.getElementById('qr-text').value = this.config.text;
        document.getElementById('size').value = this.config.width;
        document.getElementById('size-value').textContent = this.config.width;
        document.getElementById('foreground-color').value = this.config.dotsColor;
        document.getElementById('background-color').value = this.config.backgroundColor;
        document.getElementById('dots-style').value = this.config.dotsType;
        document.getElementById('corners-style').value = this.config.cornersSquareType;
        document.getElementById('logo-mode').value = this.config.logoMode;
        document.getElementById('logo-scale').value = this.config.logoScale;
        document.getElementById('logo-scale-value').textContent = Math.round(this.config.logoScale * 100);
        document.getElementById('logo-margin').value = this.config.logoMargin;
        document.getElementById('logo-margin-value').textContent = this.config.logoMargin;
        document.getElementById('logo-influence').value = this.config.logoInfluence * 100;
        document.getElementById('logo-influence-value').textContent = Math.round(this.config.logoInfluence * 100);
        document.getElementById('contrast-threshold').value = this.config.contrastThreshold * 100;
        document.getElementById('contrast-threshold-value').textContent = Math.round(this.config.contrastThreshold * 100);
        
        this.removeLogo();
        this.toggleLogoShapedControls();
        this.applyTemplate('classic');
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

// ===== INIZIALIZZAZIONE =====
document.addEventListener('DOMContentLoaded', () => {
    window.qrApp = new QRForgeVichingo();
});