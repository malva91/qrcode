// ===== PRESET VICHINGHI =====
const vikingPresets = {
    drakkar: {
        name: 'Scudo di Drakkar',
        description: 'Moduli arrotondati, colori legno e bronzo',
        config: {
            dotStyle: 'dots',
            cornerStyle: 'extra-rounded',
            foregroundColor: '#8B4513', // Legno scuro
            backgroundColor: '#F5F5DC', // Beige/osso
            useGradient: true,
            gradientColor: '#CD853F', // Bronzo
            gradientAngle: 45,
            usePattern: false,
            patternIntensity: 10
        }
    },
    
    odin: {
        name: 'Rune di Odino',
        description: 'Pattern runico, colori ghiaccio e oro',
        config: {
            dotStyle: 'classy',
            cornerStyle: 'dot',
            foregroundColor: '#4682B4', // Blu acciaio
            backgroundColor: '#F0F8FF', // Bianco ghiaccio
            useGradient: true,
            gradientColor: '#FFD700', // Oro
            gradientAngle: 90,
            usePattern: true,
            patternIntensity: 20
        }
    },
    
    tempesta: {
        name: 'Tempesta del Nord',
        description: 'Gradiente blu-grigio, atmosfera nebbiosa',
        config: {
            dotStyle: 'square',
            cornerStyle: 'square',
            foregroundColor: '#2F4F4F', // Grigio tempesta
            backgroundColor: '#E6E6FA', // Lavanda chiaro
            useGradient: true,
            gradientColor: '#708090', // Grigio ardesia
            gradientAngle: 135,
            usePattern: false,
            patternIntensity: 5
        }
    },
    
    berserker: {
        name: 'Berserker',
        description: 'Alto contrasto, rosso cupo e nero',
        config: {
            dotStyle: 'square',
            cornerStyle: 'square',
            foregroundColor: '#8B0000', // Rosso scuro
            backgroundColor: '#FFFAF0', // Bianco fiorale
            useGradient: true,
            gradientColor: '#000000', // Nero
            gradientAngle: 0,
            usePattern: false,
            patternIntensity: 25
        }
    }
};

// ===== FUNZIONI UTILITY PER PRESET =====
function applyPreset(presetKey) {
    const preset = vikingPresets[presetKey];
    if (!preset) return;
        console.warn(`⚠️ Preset non trovato: ${presetKey}`);
    
    const config = preset.config;
    
    // Verifica che gli elementi esistano prima di applicare
    const elements = {
        'dot-style': document.getElementById('dot-style'),
        'corner-style': document.getElementById('corner-style'),
        'foreground-color': document.getElementById('foreground-color'),
        'background-color': document.getElementById('background-color'),
        'use-gradient': document.getElementById('use-gradient'),
        'gradient-color': document.getElementById('gradient-color'),
        'gradient-angle': document.getElementById('gradient-angle'),
        'gradient-angle-value': document.getElementById('gradient-angle-value'),
        'use-pattern': document.getElementById('use-pattern'),
        'pattern-intensity': document.getElementById('pattern-intensity'),
        'pattern-intensity-value': document.getElementById('pattern-intensity-value'),
        'gradient-controls': document.getElementById('gradient-controls'),
        'pattern-controls': document.getElementById('pattern-controls')
    };
    
    // Verifica elementi mancanti
    const missingElements = Object.entries(elements)
        .filter(([key, element]) => !element)
        .map(([key]) => key);
    
    if (missingElements.length > 0) {
        console.warn('⚠️ Elementi DOM mancanti:', missingElements);
        return;
    }
    
    // Applica le impostazioni UI
    elements['dot-style'].value = config.dotStyle;
    elements['corner-style'].value = config.cornerStyle;
    elements['foreground-color'].value = config.foregroundColor;
    elements['background-color'].value = config.backgroundColor;
    
    // Gestione gradiente
    elements['use-gradient'].checked = config.useGradient;
    elements['gradient-color'].value = config.gradientColor;
    elements['gradient-angle'].value = config.gradientAngle;
    elements['gradient-angle-value'].textContent = config.gradientAngle;
    
    // Toggle controlli gradiente
    if (config.useGradient) {
        elements['gradient-controls'].classList.remove('hidden');
    } else {
        elements['gradient-controls'].classList.add('hidden');
    }
    
    // Gestione pattern
    elements['use-pattern'].checked = config.usePattern;
    elements['pattern-intensity'].value = config.patternIntensity;
    elements['pattern-intensity-value'].textContent = config.patternIntensity;
    
    // Toggle controlli pattern
    if (config.usePattern) {
        elements['pattern-controls'].classList.remove('hidden');
    } else {
        elements['pattern-controls'].classList.add('hidden');
    }
    
    console.log(`🎨 Preset applicato: ${preset.name}`);
}

// ===== VALIDAZIONE CONTRASTO =====
function checkContrast(fgColor, bgColor) {
    // Converte hex in RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    // Calcola la luminanza relativa
    function getLuminance(rgb) {
        const { r, g, b } = rgb;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
    
    const fg = hexToRgb(fgColor);
    const bg = hexToRgb(bgColor);
    
    if (!fg || !bg) return 1; // Fallback sicuro
    
    const fgLum = getLuminance(fg);
    const bgLum = getLuminance(bg);
    
    const brightest = Math.max(fgLum, bgLum);
    const darkest = Math.min(fgLum, bgLum);
    
    return (brightest + 0.05) / (darkest + 0.05);
}

// ===== SUGGERIMENTI AUTOMATICI =====
function getContrastSuggestions(contrast, patternIntensity, errorCorrection) {
    const suggestions = [];
    
    if (contrast < 3) {
        suggestions.push('⚠️ Contrasto molto basso - scegli colori più distinti');
    } else if (contrast < 4.5) {
        suggestions.push('💡 Aumenta il contrasto tra moduli e sfondo');
    }
    
    if (patternIntensity > 20) {
        suggestions.push('🎨 Riduci intensità pattern per migliore leggibilità');
    }
    
    if (contrast < 4.5 && errorCorrection === 'L') {
        suggestions.push('🛡️ Usa correzione errore più alta (M, Q, o H)');
    }
    
    if (suggestions.length === 0) {
        suggestions.push('✅ Configurazione ottimale per la scansione');
    }
    
    return suggestions;
}

// ===== ESPORTAZIONE PER USO GLOBALE =====
window.VikingPresets = {
    presets: vikingPresets,
    applyPreset,
    checkContrast,
    getContrastSuggestions
};