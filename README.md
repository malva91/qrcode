# 🗡️ Viking QR Forge

Generatore di QR Code con estetica vichinga e runica, mantenendo la piena compatibilità con scanner comuni.

## ✨ Caratteristiche

### 🎨 Stili Disponibili
- **Classico**: QR code standard nero su bianco
- **Puro**: QR code senza decorazioni o cornici
- **Rombi Runici**: Moduli renderizzati come rombi
- **Tratti Runici**: Moduli come glifi runici stilizzati

### 🏰 Stili Finder Pattern
- **Classico**: Pattern standard
- **Pietra Spaccata**: Effetto pietra con bordi irregolari
- **Nessuno**: Rimuove completamente i finder pattern

### 🛡️ Cornici Decorative
- **Nessuna**: QR code pulito
- **Vichinga**: Bordo decorativo con angoli ornamentali
- **Runica**: Cerchio runico con simboli sui punti cardinali

### ⚙️ Opzioni Avanzate
- **Correzione Errore**: L (7%), M (15%), Q (25%), H (30%)
- **Ottimizzazione Maschera**: Algoritmo che favorisce pattern diagonali
- **Densità Rune**: Controllo percentuale di moduli runici vs classici
- **Colori Personalizzabili**: Foreground e background

## 🔧 Utilizzo

### Interfaccia Web
1. Inserisci il testo/URL da codificare
2. Seleziona uno stile preset o personalizza le opzioni
3. Scarica in formato PNG o SVG
4. Usa il pulsante "Valida QR" per verificare la scansionabilità

### API JavaScript

```javascript
import { VikingQR } from './js/qr-engine/viking-qr.js';

// Genera SVG
const svgString = VikingQR.generateSVG('https://esempio.com', {
  ecLevel: 'H',
  moduleSize: 8,
  margin: 4,
  style: 'runes-romb',
  finderStyle: 'stone',
  borderStyle: 'viking',
  foregroundColor: '#8B4513',
  backgroundColor: '#F5F5DC',
  runeDensity: 0.8,
  maskStrategy: 'optimize'
});

// Genera PNG
const pngBlob = await VikingQR.generatePNG('https://esempio.com', options);

// Valida scansionabilità
const isValid = await VikingQR.validateQR(svgString);
```

## 📱 Compatibilità Scanner

Il sistema è ottimizzato per mantenere la compatibilità con:
- Scanner iOS nativi
- Scanner Android (ZXing, Google Lens)
- App di terze parti
- Lettori industriali

### 🎯 Raccomandazioni per la Stampa
- **Dimensione minima**: 30mm per lato per URL corti
- **Contrasto**: Mantenere colori scuri su sfondo chiaro
- **Quiet Zone**: Sempre rispettata (4 moduli di margine)
- **Risoluzione**: Minimo 300 DPI per stampa

## 🏗️ Architettura

### Moduli Principali
- `qr-generator.ts`: Generazione matrice QR con ottimizzazione maschere
- `rune-renderer.ts`: Rendering SVG con stili runici
- `viking-qr.ts`: API principale e validazione
- `types.ts`: Definizioni TypeScript

### Algoritmo di Ottimizzazione
Il sistema implementa un algoritmo di scoring personalizzato che:
1. Favorisce pattern diagonali e cluster a rombo
2. Penalizza run-length eccessivi
3. Mantiene la compatibilità con standard QR
4. Testa tutte le 8 maschere disponibili

## 🧪 Testing

Il sistema include validazione automatica tramite:
- Decoder jsQR integrato
- Test di rendering Canvas
- Verifica pattern critici (finder, timing, alignment)

## 🎨 Glifi Runici Implementati

- **Fehu** (ᚠ): Ricchezza, bestiame
- **Uruz** (ᚢ): Forza, coraggio  
- **Thurisaz** (ᚦ): Protezione, martello di Thor
- **Ansuz** (ᚨ): Saggezza, comunicazione
- **Raidho** (ᚱ): Viaggio, movimento
- **Kenaz** (ᚲ): Conoscenza, fuoco

## 🔒 Sicurezza e Affidabilità

- Quiet zone sempre rispettata
- Pattern critici mai modificati
- Validazione automatica pre-download
- Fallback a rendering classico in caso di errori

## 📄 Licenza

MIT License - Libero per uso commerciale e personale.

## 🛠️ Sviluppo

```bash
# Installa dipendenze
npm install

# Avvia server di sviluppo
npm run dev

# Build per produzione
npm run build
```

## 🎯 Roadmap

- [ ] CLI standalone per Node.js
- [ ] Supporto logo centrale
- [ ] Più stili runici
- [ ] Export in formati vettoriali aggiuntivi
- [ ] Batch processing per più QR