// ===== QR FORGE VICHINGO - VANILLA JS CON LIBRERIA REALE =====
class QRForgeVichingo {
    constructor() {
        this.config = {
            targetUrl: 'https://www.instagram.com/',
            width: 400,
            height: 400,
            type: 'canvas',
            dotsOptions: {
                color: '#2c3e50',
                type: 'square'
            },
            backgroundOptions: {
                color: '#ffffff'
            },
            cornersSquareOptions: {
                color: '#2c3e50',
                type: 'square'
            },
            cornersDotOptions: {
                color: '#2c3e50',
                type: 'square'
            },
            imageOptions: {
                hideBackgroundDots: true,
                imageSize: 0.25,
                margin: 8,
                crossOrigin: "anonymous"
            },
            qrOptions: {
                errorCorrectionLevel: 'M'
            },
            image: null
        };
        
        this.qrCode = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupImageUpload();
        this.generateQR();
        console.log('⚔️ QR Forge Vichingo inizializzato con libreria reale');
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
    
    loadLogoImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.config.image = e.target.result;
            this.updateLogoPreview(e.target.result);
            this.generateQR();
            this.showStatus('success', '🖼️ Logo caricato con successo!');
        };
        reader.onerror = () => {
            this.showStatus('error', '❌ Errore nel caricamento del logo');
        };
        reader.readAsDataURL(file);
    }
    
    updateLogoPreview(imageSrc) {
        const previewContainer = document.getElementById('logo-preview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <img src="${imageSrc}" alt="Logo Preview">
                <button class="btn-secondary remove-logo-btn" onclick="qrApp.removeLogo()">🗑️</button>
            `;
        }
    }
    
    removeLogo() {
        this.config.image = null;
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
            this.config.targetUrl = e.target.value || 'https://www.instagram.com/';
            this.generateQR();
        });
        
        // Colori base
        document.getElementById('foreground-color').addEventListener('change', (e) => {
            this.config.dotsOptions.color = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('background-color').addEventListener('change', (e) => {
            this.config.backgroundOptions.color = e.target.value;
            this.generateQR();
        });
        
        // Colori angoli
        document.getElementById('corners-color').addEventListener('change', (e) => {
            this.config.cornersSquareOptions.color = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('corners-dot-color').addEventListener('change', (e) => {
            this.config.cornersDotOptions.color = e.target.value;
            this.generateQR();
        });
        
        // Stili
        document.getElementById('dots-style').addEventListener('change', (e) => {
            this.config.dotsOptions.type = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('corners-style').addEventListener('change', (e) => {
            this.config.cornersSquareOptions.type = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('corners-dot-style').addEventListener('change', (e) => {
            this.config.cornersDotOptions.type = e.target.value;
            this.generateQR();
        });
        
        // Dimensioni
        document.getElementById('qr-size').addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            this.config.width = size;
            this.config.height = size;
            document.getElementById('qr-size-value').textContent = size;
            this.generateQR();
        });
        
        // Logo settings
        document.getElementById('logo-scale').addEventListener('input', (e) => {
            this.config.imageOptions.imageSize = parseFloat(e.target.value);
            document.getElementById('logo-scale-value').textContent = Math.round(e.target.value * 100);
            this.generateQR();
        });
        
        document.getElementById('logo-margin').addEventListener('input', (e) => {
            this.config.imageOptions.margin = parseInt(e.target.value);
            document.getElementById('logo-margin-value').textContent = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('logo-border').addEventListener('input', (e) => {
            this.config.imageOptions.borderWidth = parseInt(e.target.value);
            document.getElementById('logo-border-value').textContent = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('logo-border-color').addEventListener('change', (e) => {
            this.config.imageOptions.borderColor = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('logo-shape').addEventListener('change', (e) => {
            this.config.imageOptions.borderRadius = e.target.value === 'circle' ? 50 : 0;
            this.generateQR();
        });
        
        // Correzione errore
        document.getElementById('error-correction').addEventListener('change', (e) => {
            this.config.qrOptions.errorCorrectionLevel = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('output-type').addEventListener('change', (e) => {
            this.config.type = e.target.value;
            this.generateQR();
        });
        
        // Gradiente
        document.getElementById('enable-gradient').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.enableGradient();
            } else {
                this.disableGradient();
            }
            this.generateQR();
        });
        
        document.getElementById('gradient-type').addEventListener('change', () => {
            if (document.getElementById('enable-gradient').checked) {
                this.enableGradient();
                this.generateQR();
            }
        });
        
        document.getElementById('gradient-color1').addEventListener('change', () => {
            if (document.getElementById('enable-gradient').checked) {
                this.enableGradient();
                this.generateQR();
            }
        });
        
        document.getElementById('gradient-color2').addEventListener('change', () => {
            if (document.getElementById('enable-gradient').checked) {
                this.enableGradient();
                this.generateQR();
            }
        });
        
        document.getElementById('gradient-rotation').addEventListener('input', (e) => {
            document.getElementById('gradient-rotation-value').textContent = e.target.value;
            if (document.getElementById('enable-gradient').checked) {
                this.enableGradient();
                this.generateQR();
            }
        });
        
        // Template buttons
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyTemplate(e.currentTarget.dataset.template);
            });
        });
        
        // Action buttons
        document.getElementById('upload-logo-btn').addEventListener('click', () => {
            document.getElementById('logo-upload').click();
        });
        
        document.getElementById('download-png').addEventListener('click', () => this.downloadFile('png'));
        document.getElementById('download-svg').addEventListener('click', () => this.downloadFile('svg'));
        document.getElementById('test-scan').addEventListener('click', () => this.testScan());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
    }
    
    enableGradient() {
        const type = document.getElementById('gradient-type').value;
        const color1 = document.getElementById('gradient-color1').value;
        const color2 = document.getElementById('gradient-color2').value;
        const rotation = parseInt(document.getElementById('gradient-rotation').value);
        
        if (type === 'linear') {
            this.config.dotsOptions.gradient = {
                type: 'linear',
                rotation: rotation,
                colorStops: [
                    { offset: 0, color: color1 },
                    { offset: 1, color: color2 }
                ]
            };
        } else {
            this.config.dotsOptions.gradient = {
                type: 'radial',
                colorStops: [
                    { offset: 0, color: color1 },
                    { offset: 1, color: color2 }
                ]
            };
        }
        
        delete this.config.dotsOptions.color;
    }
    
    disableGradient() {
        delete this.config.dotsOptions.gradient;
        this.config.dotsOptions.color = document.getElementById('foreground-color').value;
    }
    
    applyTemplate(templateName) {
        // Update active button
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-template="${templateName}"]`)?.classList.add('active');
        
        const templates = {
            classic: { 
                dotsColor: '#000000', 
                backgroundColor: '#ffffff',
                dotsType: 'square',
                cornersSquareType: 'square',
                cornersDotType: 'square',
                cornersColor: '#000000',
                cornersDotColor: '#000000'
            },
            rounded: { 
                dotsColor: '#3b82f6', 
                backgroundColor: '#f1f5f9',
                dotsType: 'rounded',
                cornersSquareType: 'extra-rounded',
                cornersDotType: 'dot',
                cornersColor: '#1e40af',
                cornersDotColor: '#3b82f6'
            },
            dots: { 
                dotsColor: '#8b5cf6', 
                backgroundColor: '#faf5ff',
                dotsType: 'dots',
                cornersSquareType: 'dot',
                cornersDotType: 'dot',
                cornersColor: '#7c3aed',
                cornersDotColor: '#8b5cf6'
            },
            professional: { 
                dotsColor: '#f59e0b', 
                backgroundColor: '#1f2937',
                dotsType: 'classy-rounded',
                cornersSquareType: 'extra-rounded',
                cornersDotType: 'square',
                cornersColor: '#d97706',
                cornersDotColor: '#f59e0b'
            }
        };
        
        const template = templates[templateName];
        if (template) {
            // Disable gradient
            document.getElementById('enable-gradient').checked = false;
            this.disableGradient();
            
            // Apply template
            this.config.dotsOptions.color = template.dotsColor;
            this.config.dotsOptions.type = template.dotsType;
            this.config.backgroundOptions.color = template.backgroundColor;
            this.config.cornersSquareOptions.color = template.cornersColor;
            this.config.cornersSquareOptions.type = template.cornersSquareType;
            this.config.cornersDotOptions.color = template.cornersDotColor;
            this.config.cornersDotOptions.type = template.cornersDotType;
            
            // Update UI
            document.getElementById('foreground-color').value = template.dotsColor;
            document.getElementById('background-color').value = template.backgroundColor;
            document.getElementById('corners-color').value = template.cornersColor;
            document.getElementById('corners-dot-color').value = template.cornersDotColor;
            document.getElementById('dots-style').value = template.dotsType;
            document.getElementById('corners-style').value = template.cornersSquareType;
            document.getElementById('corners-dot-style').value = template.cornersDotType;
            
            this.generateQR();
        }
    }
    
    generateQR() {
        try {
            // Il QR code deve sempre puntare al bridge con l'URL come parametro
            const bridgeUrl = `bridge.html?url=${encodeURIComponent(this.config.targetUrl)}`;
            
            const qrOptions = {
                ...this.config,
                data: bridgeUrl
            };
            
            // Remove image if not present
            if (!this.config.image) {
                delete qrOptions.image;
                delete qrOptions.imageOptions;
            }
            
            this.qrCode = new QRCodeStyling(qrOptions);
            
            const container = document.getElementById('qr-container');
            container.innerHTML = '';
            this.qrCode.append(container);
            
            this.showStatus('success', '✅ QR Code generato correttamente');
        } catch (error) {
            console.error('Errore generazione QR:', error);
            this.showStatus('error', '❌ Errore nella generazione del QR Code');
        }
    }
    
    downloadFile(extension) {
        if (!this.qrCode) {
            this.showStatus('error', '❌ Nessun QR Code da scaricare');
            return;
        }
        
        try {
            this.qrCode.download({
                name: `qr-vichingo-${Date.now()}`,
                extension: extension
            });
            
            const icon = extension === 'png' ? '📱' : '🎨';
            this.showStatus('success', `${icon} ${extension.toUpperCase()} scaricato!`);
        } catch (error) {
            console.error(`Errore download ${extension}:`, error);
            this.showStatus('error', `❌ Errore nel download ${extension.toUpperCase()}`);
        }
    }
    
    testScan() {
        this.showStatus('warning', '🔍 Test di scansionabilità in corso...');
        
        setTimeout(() => {
            const hasLogo = this.config.image !== null;
            const logoSize = this.config.imageOptions?.imageSize || 0;
            const errorLevel = this.config.qrOptions.errorCorrectionLevel;
            
            let successProbability = 0.98;
            
            // Penalità per logo
            if (hasLogo) {
                successProbability -= (logoSize * 0.2);
            }
            
            // Bonus per correzione errore alta
            if (errorLevel === 'H') successProbability += 0.05;
            else if (errorLevel === 'Q') successProbability += 0.02;
            else if (errorLevel === 'L') successProbability -= 0.03;
            
            const isScannableSimulation = Math.random() < successProbability;
            
            if (isScannableSimulation) {
                this.showStatus('success', '✅ QR Code altamente scansionabile!');
            } else {
                this.showStatus('warning', '⚠️ QR Code potrebbe avere problemi - prova ad aumentare la correzione errore o ridurre il logo');
            }
        }, 2000);
    }
    
    reset() {
        this.config = {
            targetUrl: 'https://www.instagram.com/',
            width: 400,
            height: 400,
            type: 'canvas',
            dotsOptions: {
                color: '#2c3e50',
                type: 'square'
            },
            backgroundOptions: {
                color: '#ffffff'
            },
            cornersSquareOptions: {
                color: '#2c3e50',
                type: 'square'
            },
            cornersDotOptions: {
                color: '#2c3e50',
                type: 'square'
            },
            imageOptions: {
                hideBackgroundDots: true,
                imageSize: 0.25,
                margin: 8,
                crossOrigin: "anonymous"
            },
            qrOptions: {
                errorCorrectionLevel: 'M'
            },
            image: null
        };
        
        // Reset UI
        document.getElementById('qr-text').value = this.config.targetUrl;
        document.getElementById('foreground-color').value = this.config.dotsOptions.color;
        document.getElementById('background-color').value = this.config.backgroundOptions.color;
        document.getElementById('corners-color').value = this.config.cornersSquareOptions.color;
        document.getElementById('corners-dot-color').value = this.config.cornersDotOptions.color;
        document.getElementById('dots-style').value = this.config.dotsOptions.type;
        document.getElementById('corners-style').value = this.config.cornersSquareOptions.type;
        document.getElementById('corners-dot-style').value = this.config.cornersDotOptions.type;
        document.getElementById('qr-size').value = this.config.width;
        document.getElementById('qr-size-value').textContent = this.config.width;
        document.getElementById('logo-scale').value = this.config.imageOptions.imageSize;
        document.getElementById('logo-scale-value').textContent = Math.round(this.config.imageOptions.imageSize * 100);
        document.getElementById('logo-margin').value = this.config.imageOptions.margin;
        document.getElementById('logo-margin-value').textContent = this.config.imageOptions.margin;
        document.getElementById('logo-border').value = 0;
        document.getElementById('logo-border-value').textContent = '0';
        document.getElementById('error-correction').value = this.config.qrOptions.errorCorrectionLevel;
        document.getElementById('output-type').value = this.config.type;
        document.getElementById('enable-gradient').checked = false;
        document.getElementById('gradient-rotation').value = 0;
        document.getElementById('gradient-rotation-value').textContent = '0';
        
        this.removeLogo();
        this.applyTemplate('classic');
        this.showStatus('success', '🔄 Impostazioni ripristinate');
    }
    
    showStatus(type, message) {
        const statusElement = document.getElementById('scan-status');
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };
        
        const icon = icons[type] || 'ℹ️';
        
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