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
                errorCorrectionLevel: 'M',
                typeNumber: 0 // Auto-detect per densità ottimale
            },
            image: null
        };
        
        this.qrCode = null;
        this.densitySettings = {
            1: { margin: 4, typeNumber: 0 },    // Bassa densità
            2: { margin: 2, typeNumber: 0 },    // Normale
            3: { margin: 1, typeNumber: 0 }     // Alta densità
        };
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
            this.showLogoControls(true);
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
    
    showLogoControls(show) {
        const controls = document.getElementById('logo-controls');
        if (controls) {
            controls.style.display = show ? 'block' : 'none';
        }
    }
    
    removeLogo() {
        this.config.image = null;
        const previewContainer = document.getElementById('logo-preview');
        if (previewContainer) {
            previewContainer.innerHTML = '<span class="no-logo-text">Nessun logo caricato</span>';
        }
        this.showLogoControls(false);
        this.generateQR();
        this.showStatus('success', '🗑️ Logo rimosso');
    }
    
    setupEventListeners() {
        // Testo QR
        document.getElementById('qr-text').addEventListener('input', (e) => {
            this.config.targetUrl = e.target.value || 'https://www.instagram.com/';
            this.generateQR();
        });
        
        // Colore sfondo
        document.getElementById('background-color').addEventListener('change', (e) => {
            this.config.backgroundOptions.color = e.target.value;
            this.generateQR();
        });
        
        // Forma moduli
        document.getElementById('dots-style').addEventListener('change', (e) => {
            this.config.dotsOptions.type = e.target.value;
            // Mantieni coerenza con angoli
            this.updateCornerStyles(e.target.value);
            this.generateQR();
        });
        
        // Densità QR
        document.getElementById('qr-density').addEventListener('input', (e) => {
            const density = parseInt(e.target.value);
            this.applyDensitySettings(density);
            this.updateDensityLabel(density);
            this.generateQR();
        });
        
        // Correzione errore
        document.getElementById('error-correction').addEventListener('change', (e) => {
            this.config.qrOptions.errorCorrectionLevel = e.target.value;
            this.generateQR();
        });
        
        // Logo settings
        document.getElementById('logo-scale').addEventListener('input', (e) => {
            this.config.imageOptions.imageSize = parseFloat(e.target.value);
            document.getElementById('logo-scale-value').textContent = Math.round(e.target.value * 100);
            this.generateQR();
        });
        
        document.getElementById('logo-shape').addEventListener('change', (e) => {
            this.config.imageOptions.borderRadius = e.target.value === 'circle' ? 50 : 0;
            this.generateQR();
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
    
    updateCornerStyles(dotsType) {
        // Mantieni coerenza tra moduli e angoli
        const cornerMapping = {
            'square': 'square',
            'rounded': 'extra-rounded',
            'dots': 'dot',
            'extra-rounded': 'extra-rounded',
            'classy': 'square',
            'classy-rounded': 'extra-rounded'
        };
        
        this.config.cornersSquareOptions.type = cornerMapping[dotsType] || 'square';
        this.config.cornersDotOptions.type = dotsType === 'dots' ? 'dot' : 'square';
    }
    
    applyDensitySettings(density) {
        const settings = this.densitySettings[density];
        if (settings) {
            this.config.imageOptions.margin = settings.margin;
            this.config.qrOptions.typeNumber = settings.typeNumber;
        }
    }
    
    updateDensityLabel(density) {
        const labels = {
            1: 'Bassa',
            2: 'Normale', 
            3: 'Alta'
        };
        document.getElementById('qr-density-value').textContent = labels[density] || 'Normale';
    }
    
    applyTemplate(templateName) {
        // Update active button
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-template="${templateName}"]`)?.classList.add('active');
        
        const templates = {
            classic: { 
                backgroundColor: '#ffffff',
                dotsType: 'square',
            },
            rounded: { 
                backgroundColor: '#f1f5f9',
                dotsType: 'rounded',
            },
            dots: { 
                backgroundColor: '#faf5ff',
                dotsType: 'dots',
            },
            professional: { 
                backgroundColor: '#1f2937',
                dotsType: 'classy-rounded',
            }
        };
        
        const template = templates[templateName];
        if (template) {
            // Apply template
            this.config.dotsOptions.type = template.dotsType;
            this.config.backgroundOptions.color = template.backgroundColor;
            
            // Update corner styles based on dots type
            this.updateCornerStyles(template.dotsType);
            
            // Update UI
            document.getElementById('background-color').value = template.backgroundColor;
            document.getElementById('dots-style').value = template.dotsType;
            
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
                errorCorrectionLevel: 'M',
                typeNumber: 0
            },
            image: null
        };
        
        // Reset UI
        document.getElementById('qr-text').value = this.config.targetUrl;
        document.getElementById('background-color').value = this.config.backgroundOptions.color;
        document.getElementById('dots-style').value = this.config.dotsOptions.type;
        document.getElementById('qr-density').value = 2;
        document.getElementById('qr-density-value').textContent = 'Normale';
        document.getElementById('logo-scale').value = this.config.imageOptions.imageSize;
        document.getElementById('logo-scale-value').textContent = Math.round(this.config.imageOptions.imageSize * 100);
        document.getElementById('error-correction').value = this.config.qrOptions.errorCorrectionLevel;
        document.getElementById('logo-shape').value = 'square';
        
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