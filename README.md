# Toko Bu Wardono - Mobile App

## Cara Menambahkan Gambar Produk

Untuk mengganti gambar placeholder dengan gambar produk asli:

1. **Siapkan gambar produk** dengan format JPG, PNG, atau SVG
2. **Simpan gambar** di folder `images/` dengan nama yang deskriptif, contoh:
   - `good-day-choco-orange.jpg`
   - `pop-mie-soto.jpg`
   - `milo.jpg`

3. **Update file data** `DATA/Tabel Produk_rows.json`:
   - Cari produk yang ingin diubah
   - Ganti `"produk_image":"images/placeholder.svg"` dengan `"produk_image":"images/nama-gambar-anda.jpg"`

4. **Contoh update untuk satu produk**:
   ```json
   {
     "produk_id": "0497f11b-f079-46c1-be28-3aca7f3997c5",
     "produk_name": "GOOD DAY FREEZE CHOCOORANGE",
     "produk_image": "images/good-day-choco-orange.jpg"
   }
   ```

## Tips untuk Gambar
- **Ukuran**: 300x300px atau lebih besar untuk kualitas baik
- **Format**: JPG untuk foto, PNG untuk gambar dengan transparansi, SVG untuk ikon
- **Nama file**: Gunakan huruf kecil, tanpa spasi, ganti spasi dengan tanda hubung (-)

## Menjalankan Aplikasi
Buka file `index.html` di browser web modern (Chrome, Firefox, Safari, Edge).