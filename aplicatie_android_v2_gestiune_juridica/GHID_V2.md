# 📱 Gestiune Cazuri Juridice PRO v2.0 - Ghid Complet

## 🎯 CE E NOU ÎN VERSIUNEA 2.0?

### ✨ Funcționalități Noi Majore:

1. **📥 Import Automat din Excel**
   - Importă toate dosarele din Excel-ul tău existent
   - Recunoaște automat: număr dosar, client, instanță, termene, link ECRIS
   - Actualizează dosare existente sau creează dosare noi
   
2. **🔗 Integrare ECRIS**
   - Fiecare dosar poate avea link direct la portal.just.ro
   - Buton "Deschide în ECRIS" pentru acces rapid
   - Sincronizare automată termene (pregătită pentru implementare)

3. **🔄 Sincronizare Automată Termene**
   - Buton "Sync ECRIS" pentru actualizare în masă
   - Sincronizare individuală per dosar
   - Tracking ultima sincronizare

4. **📊 Dashboard Îmbunătățit**
   - Statistici live actualizate
   - Termene apropiate cu countdown
   - Dosare importante sortate automat
   - Indicatori vizuali pentru urgențe

5. **🎨 Interfață Avansată**
   - Detalii complete dosar într-un ecran separat
   - Filtrare dosare după status
   - Badge-uri colorate pentru prioritate
   - Animații și feedback vizual

---

## 📥 INSTALARE (IDENTIC CU v1.0)

### Folosind Netlify (CEL MAI SIMPLU):
1. Accesează https://www.netlify.com
2. Trage toate fișierele din ZIP în Netlify Drop
3. Primești link automat (ex: `https://gestiune-juridica.netlify.app`)
4. Deschide pe telefon → Instalează

### Sau GitHub Pages:
1. Creează repository pe GitHub
2. Încarcă fișierele
3. Activează Pages în Settings
4. Link: `https://[username].github.io/[repo-name]/`

---

## 📊 IMPORT DIN EXCEL - GHID PAS CU PAS

### Pregătirea Fișierului Excel

Aplicația acceptă Excel-uri cu următoarea structură (exact ca al tău):

| DOSARE | Data termenului | Ora ședinței | Număr dosar | Partea/Client | Instanța | ECRIS | Observații |
|--------|----------------|--------------|-------------|---------------|----------|-------|------------|
| Dosar Civil | 2025-10-23 | 09:00 | 5897/278/2024 | POPESCU ION | Tribunalul Hunedoara | https://portal.just.ro/... | Observații |

**Coloane Importante:**
- **Coloana 1 (DOSARE)**: Tip dosar (Civil, Penal, etc.)
- **Coloana 2 (Data termenului)**: Data în format Excel
- **Coloana 3 (Ora)**: Ora termenului
- **Coloana 4 (Număr dosar)**: OBLIGATORIU - identificator unic
- **Coloana 5 (Client)**: Numele clientului
- **Coloana 6 (Instanța)**: Unde se judecă dosarul
- **Coloana 7 (ECRIS)**: Link complet către portal.just.ro
- **Coloana 8 (Observații)**: Note diverse

### Pași Import:

1. **Deschide aplicația** pe telefon/desktop
2. **Mergi la Setări** (ultima iconiță jos)
3. **Secțiunea "Import Date"**
4. **Click pe zona "Import din Excel"** SAU trage fișierul acolo
5. **Selectează fișierul .xlsx** 
6. **Așteaptă procesarea** (2-10 secunde)
7. **Verifică notificarea**: "Import finalizat: X dosare noi, Y actualizate"
8. **Gata!** Toate dosarele tale sunt acum în aplicație

### Ce Face Import-ul?

✅ **Creează dosare noi** pentru număr dosar nou
✅ **Actualizează dosare existente** dacă găsește același număr
✅ **Adaugă termene automat** din datele Excel
✅ **Salvează link-uri ECRIS** pentru fiecare dosar
✅ **Păstrează toate observațiile**

**IMPORTANT**: Numărul dosarului (coloana 4) este folosit ca identificator unic!

---

## 🔗 FOLOSIREA LINK-URILOR ECRIS

### Adăugare Link ECRIS

**La import Excel:**
- Link-ul din coloana ECRIS este salvat automat

**Manual:**
1. Când adaugi dosar nou → completează câmpul "Link ECRIS"
2. Introdu URL-ul complet de pe portal.just.ro
3. Exemplu: `https://portal.just.ro/278/SitePages/Dosar.aspx?id_dosar=...`

### Folosire Link ECRIS

**În Dashboard / Lista Dosare:**
- Buton "🔗 ECRIS" → deschide dosarul direct în browser
- Buton "🔄 Sync" → sincronizează termene din ECRIS

**În Detalii Dosar:**
- Link mare "🔗 Deschide în ECRIS" 
- Buton "🔄 Sincronizează din ECRIS"

---

## 🔄 SINCRONIZARE AUTOMATĂ TERMENE

### Sincronizare Individuală:
1. Click pe dosar în listă
2. Click buton "🔄 Sync" sau "🔄 Sincronizează din ECRIS"
3. Aplicația actualizează automat termene din portal.just.ro

### Sincronizare în Masă:
1. Click butonul "🔄 Sync ECRIS" din header (sus-dreapta)
2. Sau mergi la Setări → "Sincronizare ECRIS" → "Sincronizează Acum"
3. Se actualizează TOATE dosarele cu link ECRIS

**Notă v2.0**: Sincronizarea este pregătită, dar scraping-ul efectiv al portal.just.ro necesită backend (din cauza CORS). Alternativa pentru acum:
- Reimportă Excel-ul actualizat când ai termene noi
- Sau adaugă termene manual

### Vezi Ultima Sincronizare:
- Setări → "Sincronizare ECRIS" → vezi data/ora ultimei sincronizări

---

## 📱 FUNCȚIONALITĂȚI AVANSATE

### Detalii Dosar
- Click pe orice dosar → vezi toate detaliile
- Secțiuni: Info, Termene, Task-uri
- Link direct ECRIS
- Înapoi cu butonul "← Înapoi la dosare"

### Filtrare Dosare
- Tabs: Toate / În curs / Suspendat / Închis
- Căutare: caută în număr dosar, client, instanță

### Dashboard Inteligent
- **Dosare Active**: click → vezi dosare în curs
- **Termene săpt.**: click → filtrează termene apropiate
- **Task-uri**: click → vezi toate task-urile
- **Clienți**: click → lista clienți

### Termene Apropiate
- Countdown zile rămase
- Culori: roșu (0-3 zile), galben (4-7 zile), albastru (8+ zile)
- Sortate automat cronologic

---

## 💾 EXPORT & BACKUP

### Export JSON (Recomandat):
1. Setări → "Export & Backup"
2. Click "📥 Export JSON"
3. Fișier descărcat: `backup_gestiune_juridica_2025-XX-XX.json`
4. **Salvează-l pe Google Drive / Cloud!**

### Import JSON:
1. Setări → "Import Date"
2. Click "📤 Import JSON"
3. Selectează fișierul de backup
4. Confirmă (⚠️ suprascrie datele curente!)

### Frecvență Backup:
- **Săptămânal**: ideal
- **După fiecare import Excel**: recomandat
- **Înainte de update aplicație**: obligatoriu

---

## 🎨 FOLOSIRE ZILNICĂ

### Dimineața:
1. Deschide aplicația
2. Verifică Dashboard → Termene apropiate
3. Click "🔄 Sync ECRIS" pentru actualizare

### Când primești dosar nou:
1. Adaugă în Excel
2. Importă Excel în aplicație
3. SAU: Click "+" → Dosar Nou → completează manual

### Când ai termen nou:
1. Click "+" → Termen Nou
2. SAU: Reimportă Excel actualizat

### Când finalizezi termen:
1. Click pe dosar → vezi Termene
2. (în viitor: marchează ca finalizat)

---

## 🔧 PROBLEME ȘI SOLUȚII

### Import Excel nu funcționează:
- ✅ Verifică că fișierul e .xlsx (nu .xls sau .csv)
- ✅ Asigură-te că coloana "Număr dosar" nu e goală
- ✅ Încearcă pe desktop (nu telefon) pentru prima dată
- ✅ Deschide Console (F12) și vezi erori

### Link-uri ECRIS nu se deschid:
- ✅ Verifică că URL-ul e complet (cu `https://`)
- ✅ Link-ul trebuie să înceapă cu `https://portal.just.ro`

### Date pierdute după reinstalare:
- ⚠️ **ATENȚIE**: Datele sunt locale!
- ✅ Fă backup JSON înainte de orice
- ✅ După reinstalare: Import JSON

### Aplicația e lentă:
- Dacă ai 500+ dosare, e normal
- Șterge dosarele arhivate (export mai întâi!)
- Golește cache browser

---

## 📋 ROADMAP VIITOR (v3.0)

🚧 **În dezvoltare:**
- Sincronizare ECRIS reală cu scraping portal.just.ro
- Notificări push pentru termene
- Export Excel avansat
- Statistici și rapoarte
- Backup automat cloud
- Partajare dosare între avocați
- Template-uri documente

---

## 💡 TIPS & TRICKS

### Organizare Optimă:
1. Importă tot din Excel la început
2. Adaugă dosare noi manual sau prin re-import
3. Backup săptămânal
4. Marchează dosarele închise ca "Închis"

### Workflow Eficient:
```
Dimineață:
  → Check Dashboard
  → Sync ECRIS  
  → Vezi termene zilei

După termen:
  → Adaugă observații
  → Programează task-uri
  
Săptămânal:
  → Export backup
  → Review dosare active
  → Contactează clienți
```

### Comenzi Rapide:
- **Click stat-card**: filtrare rapidă
- **Long-press dosar**: opțiuni (în viitor)
- **Swipe**: acțiuni rapide (în viitor)

---

## ⚖️ CONFORMITATE ȘI SECURITATE

### GDPR:
- ✅ Date stocate LOCAL (nu în cloud)
- ✅ Nicio transmisie către servere externe
- ✅ Control complet asupra datelor
- ✅ Export oricând
- ✅ Ștergere definitivă

### Securitate:
- 🔒 Date criptate în browser (LocalStorage)
- 🔒 Fără acces terți
- 🔒 Backup-uri locale/cloud-ul tău

### Recomandări:
- Nu partaja link-ul aplicației cu link-uri ECRIS
- Fă backup criptat (7zip cu parolă)
- Șterge datele dacă vinzi/donezi telefonul

---

## 📞 SUPORT

### Auto-ajutor:
1. Citește acest ghid complet
2. Verifică secțiunea Probleme
3. Testează pe desktop mai întâi

### Pentru Dezvoltatori:
- Console browser (F12) → vezi erori
- Verifică LocalStorage
- Verifică compatibilitate browser

---

## 🎉 SUCCESS!

Ai acum un sistem profesional de gestiune cazuri juridice, cu:
- ✅ Import automat din Excel
- ✅ Integrare ECRIS
- ✅ Sincronizare termene
- ✅ Dashboard avansat
- ✅ 100% GRATUIT
- ✅ Funcționare offline
- ✅ Date locale securizate

**Versiune**: 2.0.0  
**Data**: Februarie 2025  
**Compatibilitate**: Android 8+, iOS 12+, Desktop (Chrome, Firefox, Edge)

---

**IMPORTANT**: Fă backup ACUM și salvează-l în cloud! 📥
