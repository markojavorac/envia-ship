# Driver Assist - Testing Guide

## Mock Ticket Data for Testing

The system includes 13 realistic ENVÍA delivery tickets with Guatemala City addresses for testing the AI analysis feature.

### Quick Start

1. **Enable Mock Mode** (no AI API key required):
   ```bash
   # In .env.local
   USE_MOCK_AI=true
   ```

2. **Test the Upload**:
   - Go to `/admin/driver-assist`
   - Click "Add Ticket"
   - Upload ANY image or PDF
   - The system will return a **random** mock ticket from the collection

3. **Tickets Included**: 13 mock tickets with realistic Guatemala City data

## Mock Ticket Collection

### Ticket 1 - Los Próceres to Zona Viva
- **Number**: DTLNO1251452370
- **Origin**: Gran Centro Comercial Los Próceres, Zona 10
- **Destination**: Edificio Forum Zona Viva, Zona 10
- **Package**: Laptop Dell Inspiron

### Ticket 2 - Oakland Mall to Plaza del Sol
- **Number**: DTLNO2584739201
- **Origin**: Oakland Mall, Zona 10
- **Destination**: Edificio Plaza del Sol, Zona 9
- **Package**: Samsung Galaxy S23 Ultra

### Ticket 3 - Pradera Concepción to Las Luces
- **Number**: DTLNO3698521470
- **Origin**: Pradera Concepción, Carretera a El Salvador
- **Destination**: Residenciales Las Luces, Zona 10
- **Package**: Aspiradora Robot Xiaomi

### Ticket 4 - Fontabella to Las Charcas
- **Number**: DTLNO4712589630
- **Origin**: Fontabella Plaza, Boulevard Los Próceres
- **Destination**: Colonia Las Charcas, Zona 11
- **Package**: Smart TV LG 65" OLED

### Ticket 5 - Paseo Cayalá to Century Tower
- **Number**: DTLNO5823674190
- **Origin**: Paseo Cayalá, Zona 16 Mixco
- **Destination**: Edificio Century Tower, Zona 4
- **Package**: Impresora Epson EcoTank

### Ticket 6 - Metronorte to Géminis 10
- **Number**: DTLNO6934712580
- **Origin**: Metronorte, Zona 7
- **Destination**: Edificio Géminis 10, Zona 10
- **Package**: PlayStation 5 Slim

### Ticket 7 - Tikal Futura to Plaza Marítima
- **Number**: DTLNO7145896320
- **Origin**: Tikal Futura, Zona 11
- **Destination**: Edificio Plaza Marítima, Zona 10
- **Package**: Cafetera Nespresso Vertuo

### Ticket 8 - Naranjo Mall to Atlántida
- **Number**: DTLNO8256471930
- **Origin**: Naranjo Mall, Zona 4
- **Destination**: Residenciales Atlántida, Zona 13
- **Package**: iPad Air 5 + Apple Pencil

### Ticket 9 - Plaza Madero to Interplaza
- **Number**: DTLNO9367582410
- **Origin**: Plaza Madero Atanasio, Zona 10
- **Destination**: Edificio Interplaza Torre 2, Zona 10
- **Package**: Licuadora Vitamix E310

### Ticket 10 - Miraflores to Centro Histórico
- **Number**: DTLNO1047856239
- **Origin**: Miraflores, Zona 11
- **Destination**: Centro Histórico, Zona 1
- **Package**: Bicicleta Eléctrica Xiaomi

### Ticket 11 - Pradera Xela to Oakland
- **Number**: DTLNO1158963247
- **Origin**: Pradera Xela, Quetzaltenango
- **Destination**: Oakland, Zona 14
- **Package**: Horno Microondas Samsung

### Ticket 12 - Arkadia to Etisa
- **Number**: DTLNO1269874153
- **Origin**: Centro Comercial Arkadia, Zona 12
- **Destination**: Edificio Etisa, Zona 9
- **Package**: Auriculares Sony WH-1000XM5

### Ticket 13 - Pradera Zona 10 to Vista Hermosa
- **Number**: DTLNO1378945621
- **Origin**: Pradera Zona 10, Boulevard Los Próceres
- **Destination**: Vista Hermosa I, Zona 15
- **Package**: Apple Watch Series 9

## Coverage

### Geographic Coverage
- **Zones**: 1, 4, 7, 9, 10, 11, 12, 13, 14, 15, 16 (Mixco)
- **Shopping Centers**: Oakland Mall, Pradera Concepción, Fontabella, Paseo Cayalá, Metronorte, Tikal Futura, Naranjo Mall, Plaza Madero, Arkadia
- **Neighborhoods**: Zona Viva, Las Charcas, Centro Histórico, Atlántida, Oakland, Vista Hermosa

### Package Types
- Electronics (laptops, phones, tablets, TVs, consoles)
- Home appliances (vacuums, blenders, coffee makers, microwaves)
- Accessories (headphones, smartwatches)
- Recreation (electric bicycles)

## Testing Workflow

### 1. Upload & Auto-Parse
```
1. Open /admin/driver-assist
2. Click "Add Ticket"
3. Upload any image/PDF
4. Wait 500-2000ms (simulated API delay)
5. Random ticket data appears auto-filled
6. Review and click "Add Ticket"
```

### 2. Test Navigation
```
1. Click "Navigate" on added ticket
2. System geocodes addresses
3. Opens Waze (mobile) or Google Maps (desktop)
4. Verify route is correct
```

### 3. Test Ticket Details
```
1. Click eye icon to view full ticket details in modal
2. Review all information (addresses, recipient, notes, photo)
3. Close modal
4. Click chevron (if available) to expand/collapse inline details
```

### 4. Test Completion
```
1. Click "Done" on ticket
2. Ticket fades but remains visible
3. Checkmark badge appears
4. Verify localStorage persistence
5. Trash icon appears for deletion
```

### 5. Test Multiple Tickets
```
1. Add multiple tickets (different random data each time)
2. Verify full-width row layout (consistent on all screen sizes)
3. Test localStorage (refresh page, tickets should persist)
4. Mark some as complete, add more tickets
5. Test collapsible details if recipient/notes are present
```

## Production Mode (Real AI)

To test with real Gemini Vision API:

1. **Get API Key**:
   ```bash
   # Get from: https://aistudio.google.com/app/apikey
   GOOGLE_GEMINI_API_KEY=your_actual_key_here
   ```

2. **Disable Mock Mode**:
   ```bash
   # In .env.local - remove or set to false
   USE_MOCK_AI=false
   ```

3. **Upload Real ENVÍA Tickets**:
   - The AI will analyze the actual image/PDF
   - Extract real ticket data
   - More accurate than mocks

## Troubleshooting

### Mock Mode Not Working
- Check `.env.local` has `USE_MOCK_AI=true`
- Restart dev server: `npm run dev`
- Clear browser cache

### Real AI Not Working
- Verify `GOOGLE_GEMINI_API_KEY` is set
- Check API key is valid at Google AI Studio
- Ensure `USE_MOCK_AI` is `false` or not set
- Check browser console for errors

### Addresses Not Geocoding
- Check internet connection
- Verify OpenStreetMap Nominatim API is accessible
- Check browser console for rate limiting errors
- Try clearing geocoding cache in localStorage

## File Locations

- **Mock Data**: `/lib/services/mock-ticket-data.ts`
- **AI Service**: `/lib/services/ticket-analysis.ts`
- **API Endpoint**: `/app/api/admin/analyze-ticket/route.ts`
- **Upload Component**: `/components/admin/driver-assist/AddTicketDialog.tsx`
- **Main Page**: `/app/admin/driver-assist/page.tsx`

## Next Steps

1. Test with real ENVÍA tickets in production
2. Fine-tune AI prompt if extraction accuracy is low
3. Add more mock tickets for edge cases
4. Implement batch upload (multiple tickets at once)
5. Add ticket search/filter functionality
