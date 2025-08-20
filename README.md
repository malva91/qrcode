# 🎨 QR Designer Pro

Generatore professionale di QR Code con design personalizzati e supporto logo.

## ✨ Caratteristiche

### 🎨 Template di Design
- **Classico**: QR code standard nero su bianco
- **Arrotondato**: Moduli arrotondati con colori moderni
- **Punti**: Stile a punti con design elegante
- **Professionale**: Design avanzato con pattern personalizzati

### 🖼️ Logo Centrale
- Caricamento logo personalizzato
- Controllo dimensione e margini
- Angoli arrotondati configurabili
- Anteprima in tempo reale

### ⚙️ Opzioni Avanzate
- **Correzione Errore**: L (7%), M (15%), Q (25%), H (30%)
- **Stili Personalizzabili**: Moduli e angoli configurabili
- **Colori**: Foreground e background completamente personalizzabili
- **Dimensioni**: Da 300px a 600px

## 🔧 Utilizzo

### Interfaccia Web
1. Inserisci il testo/URL da codificare
2. Seleziona un template di design o personalizza le opzioni
3. Carica un logo opzionale
4. Scarica in formato PNG o SVG
5. Usa il pulsante "Testa Scansione" per verificare la scansionabilità

### API JavaScript

```javascript
import QRCodeStyling from 'qr-code-styling';

const qr = new QRCodeStyling({
  width: 400,
  height: 400,
  data: 'https://esempio.com',
  dotsOptions: {
    color: '#2c3e50',
    type: 'rounded'
  },
  backgroundOptions: {
    color: '#ffffff'
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.25,
    margin: 8
  },
  image: logoDataUrl
});
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
- **Logo**: Non superare il 25% della dimensione totale
- **Risoluzione**: Minimo 300 DPI per stampa

## 🏗️ Architettura

### Tecnologie Utilizzate
- **qr-code-styling**: Libreria principale per generazione QR
- **Vite**: Build tool e dev server
- **CSS Custom Properties**: Sistema di design modulare
- **ES6 Modules**: Architettura JavaScript moderna

### Funzionalità Principali
- Generazione QR in tempo reale
- Anteprima live
- Sistema di template
- Gestione logo con anteprima
- Test di scansionabilità simulato
- Download PNG/SVG

## 🎨 Template Disponibili

### Classico
- Moduli quadrati neri
- Sfondo bianco
- Massima compatibilità

### Arrotondato
- Moduli arrotondati blu
- Sfondo chiaro
- Design moderno

### Punti
- Moduli circolari viola
- Sfondo tenue
- Stile elegante

### Professionale
- Pattern avanzati dorati
- Sfondo scuro
- Effetto premium

## 🔒 Sicurezza e Affidabilità

- Correzione errore configurabile
- Test di scansionabilità integrato
- Validazione parametri logo
- Fallback per compatibilità

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

- [ ] Più template di design
- [ ] Supporto batch processing
- [ ] API REST
- [ ] Integrazione con servizi cloud
- [ ] Editor avanzato colori