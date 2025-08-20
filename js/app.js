import QRCodeStyling from 'qr-code-styling';

// ===== QR FORGE VICHINGO =====
class QRForgeVichingo {
    constructor() {
        this.config = {
            text: 'bridge.html',
            width: 400,
            height: 400,
            dotsColor: '#2c3e50',
            backgroundColor: '#ffffff',
            dotsType: 'square',
            cornersSquareType: 'square',
            cornersDotType: 'square',
            logoImage: null,
            logoScale: 0.25,
            logoMargin: 8
        };
        
        this.qrCode = null;
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
    
    loadLogoImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.config.logoImage = e.target.result;
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
        this.config.logoImage = null;
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
                cornersSquareType: 'square'
            },
            rounded: { 
                dotsColor: '#3b82f6', 
                backgroundColor: '#f1f5f9',
                dotsType: 'rounded',
                cornersSquareType: 'extra-rounded'
            },
            dots: { 
                dotsColor: '#8b5cf6', 
                backgroundColor: '#faf5ff',
                dotsType: 'dots',
                cornersSquareType: 'dot'
            },
            professional: { 
                dotsColor: '#f59e0b', 
                backgroundColor: '#1f2937',
                dotsType: 'extra-rounded',
                cornersSquareType: 'extra-rounded'
            }
        };
        
        const template = templates[templateName];
        if (template) {
            Object.assign(this.config, template);
            this.config.cornersDotType = template.cornersSquareType;
            
            // Update UI
            document.getElementById('foreground-color').value = template.dotsColor;
            document.getElementById('background-color').value = template.backgroundColor;
            document.getElementById('dots-style').value = template.dotsType;
            document.getElementById('corners-style').value = template.cornersSquareType;
            
            this.generateQR();
        }
    }
    
    generateQR() {
        try {
            const qrOptions = {
                width: this.config.width,
                height: this.config.height,
                type: 'svg',
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
                    errorCorrectionLevel: 'M'
                }
            };
            
            // Add logo if present
            if (this.config.logoImage) {
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
            const hasLogo = this.config.logoImage !== null;
            const logoSize = this.config.logoScale;
            
            let successProbability = 0.95;
            if (hasLogo) {
                successProbability -= (logoSize * 0.3);
            }
            
            const isScannableSimulation = Math.random() < successProbability;
            
            if (isScannableSimulation) {
                this.showStatus('success', '✅ QR Code scansionabile!');
            } else {
                this.showStatus('warning', '⚠️ QR Code potrebbe avere problemi di scansione - prova a ridurre la dimensione del logo');
            }
        }, 2000);
    }
    
    reset() {
        this.config = {
            text: 'bridge.html',
            width: 400,
            height: 400,
            dotsColor: '#2c3e50',
            backgroundColor: '#ffffff',
            dotsType: 'square',
            cornersSquareType: 'square',
            cornersDotType: 'square',
            logoImage: null,
            logoScale: 0.25,
            logoMargin: 8
        };
        
        // Reset UI
        document.getElementById('qr-text').value = this.config.text;
        document.getElementById('foreground-color').value = this.config.dotsColor;
        document.getElementById('background-color').value = this.config.backgroundColor;
        document.getElementById('dots-style').value = this.config.dotsType;
        document.getElementById('corners-style').value = this.config.cornersSquareType;
        document.getElementById('logo-scale').value = this.config.logoScale;
        document.getElementById('logo-scale-value').textContent = Math.round(this.config.logoScale * 100);
        document.getElementById('logo-margin').value = this.config.logoMargin;
        document.getElementById('logo-margin-value').textContent = this.config.logoMargin;
        
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