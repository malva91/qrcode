// ===== STATO DELL'APPLICAZIONE =====
class VikingQRApp {
    constructor() {
        this.config = this.getDefaultConfig();
        this.currentLogo = null;
        this.scanValidator = new QRScanValidator();
        this.debounceTimer = null;
        
        this.init();
    }
    
    // ===== CONFIGURAZIONE DEFAULT =====
    getDefaultConfig() {
        return {
            text: 'https://esempio.com',
            errorCorrection: 'M',
            size: 256,
            margin: 20,
            dotStyle: 'dots',
            cornerStyle: 'extra-rounded',
            foregroundColor: '#2F4F4F',
            backgroundColor: '#F5F5DC',
            useGradient: false,
            gradientColor: '#4682B4',
            gradientAngle: 45,
            usePattern: false,
            patternIntensity: 15,
            logoScale: 30,
            logoPadding: 10,
            currentPreset: 'drakkar'
        };
    }
    
    // ===== INIZIALIZZAZIONE =====
    init() {
        this.setupEventListeners();
        this.updateUI();
        this.generateQR();
        console.log('⚔️ Viking QR Forge inizializzato');
    }
    
    // ===== SETUP EVENT LISTENERS =====
    setupEventListeners() {
        // Input principali
        document.getElementById('qr-text').addEventListener('input', (e) => {
            this.config.text = e.target.value;
            this.debounceGenerateQR();
        });
        
        document.getElementById('error-correction').addEventListener('change', (e) => {
            this.config.errorCorrection = e.target.value;
            this.generateQR();
        });
        
        // Range sliders
        this.setupRangeListener('size', (value) => {
            this.config.size = parseInt(value);
            this.generateQR();
        });
        
        this.setupRangeListener('margin', (value) => {
            this.config.margin = parseInt(value);
            this.generateQR();
        });
        
        this.setupRangeListener('gradient-angle', (value) => {
            this.config.gradientAngle = parseInt(value);
            this.generateQR();
        });
        
        this.setupRangeListener('pattern-intensity', (value) => {
            this.config.patternIntensity = parseInt(value);
            this.generateQR();
        });
        
        this.setupRangeListener('logo-scale', (value) => {
            this.config.logoScale = parseInt(value);
            this.generateQR();
        });
        
        this.setupRangeListener('logo-padding', (value) => {
            this.config.logoPadding = parseInt(value);
            this.generateQR();
        });
        
        // Selects
        document.getElementById('dot-style').addEventListener('change', (e) => {
            this.config.dotStyle = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('corner-style').addEventListener('change', (e) => {
            this.config.cornerStyle = e.target.value;
            this.generateQR();
        });
        
        // Color inputs
        document.getElementById('foreground-color').addEventListener('change', (e) => {
            this.config.foregroundColor = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('background-color').addEventListener('change', (e) => {
            this.config.backgroundColor = e.target.value;
            this.generateQR();
        });
        
        document.getElementById('gradient-color').addEventListener('change', (e) => {
            this.config.gradientColor = e.target.value;
            this.generateQR();
        });
        
        // Checkboxes
        document.getElementById('use-gradient').addEventListener('change', (e) => {
            this.config.useGradient = e.target.checked;
            this.toggleGradientControls(e.target.checked);
            this.generateQR();
        });
        
        document.getElementById('use-pattern').addEventListener('change', (e) => {
            this.config.usePattern = e.target.checked;
            this.togglePatternControls(e.target.checked);
            this.generateQR();
        });
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.currentTarget.dataset.preset;
                this.applyPreset(preset);
            });
        });
        
        // Upload logo
        this.setupLogoUpload();
        
        // Action buttons
        document.getElementById('download-png').addEventListener('click', () => this.downloadPNG());
        document.getElementById('download-svg').addEventListener('click', () => this.downloadSVG());
        document.getElementById('verify-scan').addEventListener('click', () => this.verifyScanability());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetToDefaults());
        document.getElementById('copy-settings').addEventListener('click', () => this.copySettings());
    }
    
    // ===== SETUP RANGE LISTENER HELPER =====
    setupRangeListener(id, callback) {
        const element = document.getElementById(id);
        const valueDisplay = document.getElementById(`${id}-value`);
        
        element.addEventListener('input', (e) => {
            const value = e.target.value;
            if (valueDisplay) valueDisplay.textContent = value;
            callback(value);
        });
    }
    
    // ===== UPLOAD LOGO =====
    setupLogoUpload() {
        const uploadArea = document.getElementById('upload-area');
        const logoInput = document.getElementById('logo-input');
        const removeLogoBtn = document.getElementById('remove-logo');
        
        // Click to upload
        uploadArea.addEventListener('click', () => logoInput.click());
        
        // File input change
        logoInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.uploadLogo(e.target.files[0]);
            }
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                this.uploadLogo(e.dataTransfer.files[0]);
            }
        });
        
        // Remove logo
        removeLogoBtn.addEventListener('click', () => {
            this.removeLogo();
        });
    }
    
    // ===== UPLOAD LOGO AL SERVER =====
    async uploadLogo(file) {
        // Validazione client-side
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            this.showStatus('error', '❌ Formato file non supportato. Usa PNG, JPG o SVG.');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) { // 2MB
            this.showStatus('error', '❌ File troppo grande. Massimo 2MB.');
            return;
        }
        
        // Mostra loading
        this.showStatus('pending', '📤 Caricamento logo...');
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('upload.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.ok) {
                this.currentLogo = result.url;
                this.showLogoPreview(result.url);
                this.showLogoControls(true);
                this.generateQR();
                this.showStatus('success', '✅ Logo caricato con successo!');
            } else {
                throw new Error(result.error || 'Errore upload');
            }
            
        } catch (error) {
            console.error('Errore upload logo:', error);
            this.showStatus('error', `❌ Errore caricamento: ${error.message}`);
        }
    }
    
    // ===== RIMUOVI LOGO =====
    removeLogo() {
        this.currentLogo = null;
        this.showLogoControls(false);
        document.getElementById('logo-input').value = '';
        this.generateQR();
        this.showStatus('success', '🗑️ Logo rimosso');
    }
    
    // ===== MOSTRA ANTEPRIMA LOGO =====
    showLogoPreview(url) {
        const preview = document.getElementById('logo-preview');
        preview.innerHTML = `<img src="${url}" alt="Logo preview">`;
    }
    
    // ===== TOGGLE CONTROLLI LOGO =====
    showLogoControls(show) {
        const controls = document.getElementById('logo-controls');
        if (show) {
            controls.classList.remove('hidden');
        } else {
            controls.classList.add('hidden');
        }
    }
    
    // ===== TOGGLE CONTROLLI =====
    toggleGradientControls(show) {
        const controls = document.getElementById('gradient-controls');
        if (show) {
            controls.classList.remove('hidden');
        } else {
            controls.classList.add('hidden');
        }
    }
    
    togglePatternControls(show) {
        const controls = document.getElementById('pattern-controls');
        if (show) {
            controls.classList.remove('hidden');
        } else {
            controls.classList.add('hidden');
        }
    }
    
    // ===== APPLICA PRESET =====
    applyPreset(presetKey) {
        // Update active button
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-preset="${presetKey}"]`).classList.add('active');
        
        // Apply preset using global function
        window.VikingPresets.applyPreset(presetKey);
        
        this.config.currentPreset = presetKey;
        this.updateConfigFromUI();
        this.generateQR();
    }
    
    // ===== UPDATE CONFIG FROM UI =====
    updateConfigFromUI() {
        this.config.text = document.getElementById('qr-text').value;
        this.config.errorCorrection = document.getElementById('error-correction').value;
        this.config.size = parseInt(document.getElementById('size').value);
        this.config.margin = parseInt(document.getElementById('margin').value);
        this.config.dotStyle = document.getElementById('dot-style').value;
        this.config.cornerStyle = document.getElementById('corner-style').value;
        this.config.foregroundColor = document.getElementById('foreground-color').value;
        this.config.backgroundColor = document.getElementById('background-color').value;
        this.config.useGradient = document.getElementById('use-gradient').checked;
        this.config.gradientColor = document.getElementById('gradient-color').value;
        this.config.gradientAngle = parseInt(document.getElementById('gradient-angle').value);
        this.config.usePattern = document.getElementById('use-pattern').checked;
        this.config.patternIntensity = parseInt(document.getElementById('pattern-intensity').value);
        this.config.logoScale = parseInt(document.getElementById('logo-scale').value);
        this.config.logoPadding = parseInt(document.getElementById('logo-padding').value);
    }
    
    // ===== UPDATE UI FROM CONFIG =====
    updateUI() {
        document.getElementById('qr-text').value = this.config.text;
        document.getElementById('error-correction').value = this.config.errorCorrection;
        document.getElementById('size').value = this.config.size;
        document.getElementById('size-value').textContent = this.config.size;
        document.getElementById('margin').value = this.config.margin;
        document.getElementById('margin-value').textContent = this.config.margin;
        document.getElementById('dot-style').value = this.config.dotStyle;
        document.getElementById('corner-style').value = this.config.cornerStyle;
        document.getElementById('foreground-color').value = this.config.foregroundColor;
        document.getElementById('background-color').value = this.config.backgroundColor;
        document.getElementById('use-gradient').checked = this.config.useGradient;
        document.getElementById('gradient-color').value = this.config.gradientColor;
        document.getElementById('gradient-angle').value = this.config.gradientAngle;
        document.getElementById('gradient-angle-value').textContent = this.config.gradientAngle;
        document.getElementById('use-pattern').checked = this.config.usePattern;
        document.getElementById('pattern-intensity').value = this.config.patternIntensity;
        document.getElementById('pattern-intensity-value').textContent = this.config.patternIntensity;
        document.getElementById('logo-scale').value = this.config.logoScale;
        document.getElementById('logo-scale-value').textContent = this.config.logoScale;
        document.getElementById('logo-padding').value = this.config.logoPadding;
        document.getElementById('logo-padding-value').textContent = this.config.logoPadding;
        
        this.toggleGradientControls(this.config.useGradient);
        this.togglePatternControls(this.config.usePattern);
    }
    
    // ===== DEBOUNCED QR GENERATION =====
    debounceGenerateQR(delay = 300) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.generateQR();
        }, delay);
    }
    
    // ===== GENERAZIONE QR CODE =====
    async generateQR() {
        try {
            // Attendi che le librerie siano caricate
            if (typeof QRCode === 'undefined') {
                console.warn('⏳ QRCode non ancora caricato, riprovo...');
                setTimeout(() => this.generateQR(), 100);
                return;
            }
            
            const canvas = document.getElementById('qr-canvas');
            const ctx = canvas.getContext('2d');
            
            // Clear canvas
            canvas.width = this.config.size;
            canvas.height = this.config.size;
            
            // Update config from UI
            this.updateConfigFromUI();
            
            // Configurazione QRCode
            const qrConfig = {
                errorCorrectionLevel: this.config.errorCorrection,
                type: 'image/png',
                quality: 0.92,
                width: this.config.size,
                margin: Math.floor(this.config.margin / 4), // QRCode.js usa moduli come unità
                color: {
                    dark: this.config.foregroundColor,
                    light: this.config.backgroundColor
                }
            };
            
            // Genera QR usando QRCode.js
            QRCode.toCanvas(canvas, this.config.text, qrConfig, (error) => {
                if (error) {
                    console.error('Errore generazione QR:', error);
                    this.showStatus('error', '❌ Errore generazione QR Code');
                    return;
                }
                
                // Applica post-processing
                this.applyPostProcessing(canvas, ctx);
                
                // Update status
                this.showStatus('success', '✅ QR Code generato');
            });
            
        } catch (error) {
            console.error('Errore generazione QR:', error);
            this.showStatus('error', `❌ Errore: ${error.message}`);
        }
    }
    
    // ===== POST-PROCESSING =====
    applyPostProcessing(canvas, ctx) {
        // Aspetta un frame per assicurarsi che il QR sia renderizzato
        requestAnimationFrame(() => {
            this.doPostProcessing(canvas, ctx);
        });
    }
    
    // ===== POST-PROCESSING EFFETTIVO =====
    doPostProcessing(canvas, ctx) {
        // Applica pattern runico se richiesto
        if (this.config.usePattern) {
            this.applyGradientOverlay(canvas, ctx);
        }
        
        if (this.config.usePattern) {
            this.applyRunicPattern(canvas, ctx);
        }
        
        // Applica logo se presente
        if (this.currentLogo) {
            this.applyLogo(canvas, ctx);
        }
    }
    
    // ===== APPLICA GRADIENTE OVERLAY =====
    applyGradientOverlay(canvas, ctx) {
        // Salva stato
        ctx.save();
        
        // Crea gradiente
        const gradient = ctx.createLinearGradient(
            0, 0,
            Math.cos(this.config.gradientAngle * Math.PI / 180) * this.config.size,
            Math.sin(this.config.gradientAngle * Math.PI / 180) * this.config.size
        );
        gradient.addColorStop(0, this.config.backgroundColor + '80'); // 50% opacity
        gradient.addColorStop(1, this.config.gradientColor + '80');
        
        // Applica gradiente con blend mode
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Ripristina stato
        ctx.restore();
    }
    
    // ===== APPLICA PATTERN RUNICO =====
    applyRunicPattern(canvas, ctx) {
        const intensity = this.config.patternIntensity / 100;
        if (intensity <= 0) return;
        
        // Crea pattern SVG semplificato
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        patternCanvas.width = 60;
        patternCanvas.height = 60;
        
        // Disegna pattern runico semplice
        patternCtx.strokeStyle = this.config.foregroundColor;
        patternCtx.globalAlpha = intensity;
        patternCtx.lineWidth = 1;
        
        // Pattern intreccio semplice
        for (let i = 0; i < 60; i += 20) {
            patternCtx.beginPath();
            patternCtx.moveTo(i, 0);
            patternCtx.lineTo(i + 10, 20);
            patternCtx.lineTo(i, 40);
            patternCtx.lineTo(i + 10, 60);
            patternCtx.stroke();
        }
        
        // Applica pattern come overlay
        const pattern = ctx.createPattern(patternCanvas, 'repeat');
        ctx.globalAlpha = intensity * 0.3;
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }
    
    // ===== APPLICA LOGO =====
    applyLogo(canvas, ctx) {
        if (!this.currentLogo) return;
        
        const img = new Image();
        img.onload = () => {
            const logoSize = (this.config.size * this.config.logoScale) / 100;
            const padding = this.config.logoPadding;
            const x = (canvas.width - logoSize) / 2;
            const y = (canvas.height - logoSize) / 2;
            
            // Salva stato
            ctx.save();
            
            // Sfondo bianco per il logo
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.roundRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2, 8);
            ctx.fill();
            
            // Disegna logo
            ctx.drawImage(img, x, y, logoSize, logoSize);
            
            // Ripristina stato
            ctx.restore();
        };
        img.onerror = () => {
            console.warn('⚠️ Errore caricamento logo:', this.currentLogo);
        };
        img.crossOrigin = 'anonymous';
        img.src = this.currentLogo;
    }
    
    // ===== DOWNLOAD PNG =====
    downloadPNG() {
        const canvas = document.getElementById('qr-canvas');
        const link = document.createElement('a');
        link.download = `viking-qr-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        this.showStatus('success', '📱 PNG scaricato!');
    }
    
    // ===== DOWNLOAD SVG =====
    downloadSVG() {
        try {
            // Genera SVG dal canvas (semplificato)
            const canvas = document.getElementById('qr-canvas');
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Crea SVG semplificato
            const svg = this.createSVGFromImageData(imageData, canvas.width, canvas.height);
            
            // Download
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const link = document.createElement('a');
            link.download = `viking-qr-${Date.now()}.svg`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
            
            this.showStatus('success', '🎨 SVG scaricato!');
            
        } catch (error) {
            console.error('Errore generazione SVG:', error);
            this.showStatus('error', '❌ Errore generazione SVG');
        }
    }
    
    // ===== CREA SVG DA IMAGE DATA =====
    createSVGFromImageData(imageData, width, height) {
        const svg = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`];
        svg.push(`<rect width="${width}" height="${height}" fill="${this.config.backgroundColor}"/>`);
        
        // Analizza pixel e crea rettangoli (semplificato)
        const blockSize = Math.max(1, Math.floor(width / 50)); // Riduce complessità
        
        for (let y = 0; y < height; y += blockSize) {
            for (let x = 0; x < width; x += blockSize) {
                const idx = (y * width + x) * 4;
                const r = imageData.data[idx];
                const g = imageData.data[idx + 1];
                const b = imageData.data[idx + 2];
                const alpha = imageData.data[idx + 3];
                
                if (alpha > 128) {
                    const color = `rgb(${r},${g},${b})`;
                    const bgColor = this.hexToRgb(this.config.backgroundColor);
                    
                    // Solo se diverso dal background
                    if (Math.abs(r - bgColor.r) > 50 || Math.abs(g - bgColor.g) > 50 || Math.abs(b - bgColor.b) > 50) {
                        svg.push(`<rect x="${x}" y="${y}" width="${blockSize}" height="${blockSize}" fill="${color}"/>`);
                    }
                }
            }
        }
        
        svg.push('</svg>');
        return svg.join('\n');
    }
    
    // ===== UTILITY HEX TO RGB =====
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }
    
    // ===== VERIFICA SCANSIONABILITÀ =====
    async verifyScanability() {
        this.showStatus('pending', '🔍 Verifica scansionabilità in corso...');
        
        try {
            const canvas = document.getElementById('qr-canvas');
            const validation = await this.scanValidator.validateQRCode(canvas, this.config);
            
            // Mostra risultati
            this.displayScanResults(validation);
            
        } catch (error) {
            console.error('Errore verifica scansione:', error);
            this.showStatus('error', `❌ Errore verifica: ${error.message}`);
        }
    }
    
    // ===== MOSTRA RISULTATI SCANSIONE =====
    displayScanResults(validation) {
        const status = document.getElementById('scan-status');
        
        let type, icon, message;
        
        if (validation.confidence > 0.8) {
            type = 'success';
            icon = '✅';
            message = 'QR Code perfettamente scansionabile';
        } else if (validation.confidence > 0.6) {
            type = 'warning';
            icon = '⚠️';
            message = 'QR Code scansionabile con alcune limitazioni';
        } else {
            type = 'error';
            icon = '❌';
            message = 'QR Code potrebbe essere difficile da scansionare';
        }
        
        // Update status
        status.className = `scan-status ${type}`;
        status.innerHTML = `
            <div class="status-icon">${icon}</div>
            <div class="status-text">
                <strong>${message}</strong><br>
                <small>Confidenza: ${Math.round(validation.confidence * 100)}%</small>
                ${validation.suggestions.map(s => `<br><small>${s.icon} ${s.text}</small>`).join('')}
            </div>
        `;
        
        console.log('📊 Risultati validazione:', validation);
    }
    
    // ===== RESET A DEFAULTS =====
    resetToDefaults() {
        this.config = this.getDefaultConfig();
        this.removeLogo();
        this.updateUI();
        this.applyPreset('drakkar');
        this.showStatus('success', '🔄 Impostazioni ripristinate');
    }
    
    // ===== COPIA IMPOSTAZIONI =====
    copySettings() {
        const settings = JSON.stringify(this.config, null, 2);
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(settings).then(() => {
                this.showStatus('success', '📋 Impostazioni copiate negli appunti');
            });
        } else {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = settings;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showStatus('success', '📋 Impostazioni copiate');
        }
    }
    
    // ===== MOSTRA STATUS =====
    showStatus(type, message) {
        const statusElement = document.getElementById('scan-status');
        if (!statusElement) {
            console.log(`${type.toUpperCase()}: ${message}`);
            return;
        }
        
        let icon;
        switch(type) {
            case 'success': icon = '✅'; break;
            case 'error': icon = '❌'; break;
            case 'warning': icon = '⚠️'; break;
            case 'pending': icon = '⏳'; break;
            default: icon = 'ℹ️';
        }
        
        statusElement.className = `scan-status ${type}`;
        statusElement.innerHTML = `
            <div class="status-icon">${icon}</div>
            <div class="status-text">${message}</div>
        `;
        
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// ===== INIZIALIZZAZIONE APP =====
document.addEventListener('DOMContentLoaded', () => {
    // Attendi che le librerie siano caricate
    function initApp() {
        if (typeof QRCode !== 'undefined') {
            window.vikingApp = new VikingQRApp();
            console.log('🚀 Viking QR Forge caricato completamente');
        } else {
            console.log('⏳ Attendo caricamento librerie...');
            setTimeout(initApp, 100);
        }
    }
    
    initApp();
});