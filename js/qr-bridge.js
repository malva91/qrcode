// ===== SISTEMA QR BRIDGE - FILE SEPARATO PER PAGINE TARGET =====

/**
 * Sistema per creare un "ponte" tra la scansione QR e la pagina di destinazione
 * Questo file può essere incluso nelle pagine target per mostrare la schermata di caricamento
 */

class QRBridge {
    constructor(options = {}) {
        this.options = {
            loadingDuration: 3000,
            showWolves: true,
            customMessage: null,
            autoRedirect: true,
            ...options
        };
        
        this.init();
    }
    
    init() {
        // Controlla se arriviamo da un QR scan
        const urlParams = new URLSearchParams(window.location.search);
        const fromQR = urlParams.get('from_qr');
        const originalUrl = urlParams.get('original_url');
        
        if (fromQR === 'true') {
            this.showBridgeScreen(originalUrl);
        }
    }
    
    showBridgeScreen(originalUrl = null) {
        // Crea la schermata di caricamento se non esiste
        if (!document.getElementById('qr-loading-screen')) {
            this.createLoadingScreen();
        }
        
        const loadingScreen = document.getElementById('qr-loading-screen');
        loadingScreen.classList.remove('hidden');
        
        // Nascondi il contenuto principale temporaneamente
        const mainContent = document.body.children;
        Array.from(mainContent).forEach(element => {
            if (element.id !== 'qr-loading-screen') {
                element.style.display = 'none';
            }
        });
        
        // Dopo il tempo specificato, mostra il contenuto
        setTimeout(() => {
            this.hideBridgeScreen();
        }, this.options.loadingDuration);
    }
    
    hideBridgeScreen() {
        const loadingScreen = document.getElementById('qr-loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        
        // Ripristina il contenuto principale
        const mainContent = document.body.children;
        Array.from(mainContent).forEach(element => {
            if (element.id !== 'qr-loading-screen') {
                element.style.display = '';
            }
        });
        
        // Rimuovi i parametri QR dall'URL
        this.cleanUrl();
    }
    
    createLoadingScreen() {
        const loadingHTML = `
            <div id="qr-loading-screen" class="qr-loading-screen hidden">
                <div class="qr-loading-content">
                    ${this.options.showWolves ? `
                        <div class="odin-logo">
                            <div class="wolf-eyes">👁️‍🗨️ 👁️‍🗨️</div>
                            <div class="runes">ᚠᚢᚦᚨᚱᚲ</div>
                        </div>
                    ` : ''}
                    <h2 class="qr-loading-title">I Cani di Odino</h2>
                    <p class="qr-loading-text">${this.options.customMessage || 'ti stanno portando alla destinazione...'}</p>
                    <div class="qr-loading-spinner"></div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
        
        // Aggiungi gli stili se non esistono
        if (!document.getElementById('qr-bridge-styles')) {
            this.addStyles();
        }
    }
    
    addStyles() {
        const styles = `
            <style id="qr-bridge-styles">
                .qr-loading-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    transition: opacity 0.5s ease-out, visibility 0.5s ease-out;
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                }
                
                .qr-loading-screen:not(.hidden) {
                    opacity: 1;
                    visibility: visible;
                    pointer-events: all;
                }
                
                .qr-loading-content {
                    text-align: center;
                    color: #F5F5DC;
                    font-family: 'Inter', sans-serif;
                }
                
                .odin-logo {
                    margin-bottom: 24px;
                }
                
                .wolf-eyes {
                    font-size: 3rem;
                    margin-bottom: 8px;
                    animation: qr-blink 2s infinite;
                }
                
                .runes {
                    font-size: 1.5rem;
                    color: #FFD700;
                    letter-spacing: 0.5rem;
                    margin-bottom: 24px;
                }
                
                .qr-loading-title {
                    font-family: 'Cinzel', serif;
                    font-size: 2rem;
                    color: #FFD700;
                    margin-bottom: 8px;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                }
                
                .qr-loading-text {
                    color: #B0E0E6;
                    font-size: 1.1rem;
                    margin-bottom: 32px;
                }
                
                .qr-loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(70, 130, 180, 0.3);
                    border-top: 3px solid #CD853F;
                    border-radius: 50%;
                    animation: qr-spin 1s linear infinite;
                    margin: 0 auto;
                }
                
                @keyframes qr-blink {
                    0%, 90% { opacity: 1; }
                    95% { opacity: 0.3; }
                }
                
                @keyframes qr-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    cleanUrl() {
        const url = new URL(window.location);
        url.searchParams.delete('from_qr');
        url.searchParams.delete('original_url');
        window.history.replaceState({}, document.title, url.toString());
    }
    
    // Metodo statico per creare URL con bridge
    static createBridgeUrl(targetUrl, options = {}) {
        const url = new URL(targetUrl);
        url.searchParams.set('from_qr', 'true');
        if (options.originalUrl) {
            url.searchParams.set('original_url', options.originalUrl);
        }
        return url.toString();
    }
    
    // Metodo per inizializzazione automatica
    static autoInit(options = {}) {
        document.addEventListener('DOMContentLoaded', () => {
            new QRBridge(options);
        });
    }
}

// Esporta per uso globale
if (typeof window !== 'undefined') {
    window.QRBridge = QRBridge;
}

// Auto-inizializzazione se il parametro è presente
QRBridge.autoInit();