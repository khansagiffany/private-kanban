# My Private Board 💜

Kanban board pribadi (multi-project), tema pastel, drag-and-drop, self-hosted.
Backend: Node.js + Express (data disimpan di file `data/data.json`, tanpa perlu install database).
Frontend: React (Vite), di-build jadi static file dan disajikan langsung oleh server yang sama —
jadi cukup jalankan **satu proses** untuk keduanya.

## Struktur

```
private-kanban/
  server/
    app.js         -> semua route Express (dipakai di mode self-host maupun Vercel)
    index.js       -> entry point mode self-host (serve frontend + app.listen)
    db.js          -> otomatis pilih db-local (self-host) atau db-redis (Vercel)
    db-local.js     -> penyimpanan data ke file data/data.json
    db-redis.js     -> penyimpanan data ke Upstash Redis (dipakai saat di Vercel)
  api/
    [...path].js   -> entry point serverless function untuk Vercel (bungkus server/app.js)
  client/          -> source frontend React (Vite)
  data/            -> data.json dibuat otomatis saat mode self-host (tidak dipakai di Vercel)
  vercel.json      -> konfigurasi build untuk Vercel
  package.json     -> dependency & script backend
```

Codebase yang sama bisa dipakai untuk dua mode deploy:
- **Self-host** (VPS/server internal): pakai `server/index.js`, data disimpan di file `data/data.json`.
- **Vercel**: pakai `api/[...path].js`, data disimpan di Upstash Redis (karena Vercel tidak punya filesystem yang persisten).

## Cara install & jalankan (server internal)

Butuh Node.js versi 18 ke atas.

```bash
# 1. Masuk ke folder project
cd private-kanban

# 2. Install dependency backend
npm install

# 3. Build frontend (sekali saja, atau setiap kali ubah kode frontend)
npm run build:client

# 4. (Opsional tapi disarankan) set JWT secret sendiri
cp .env.example .env
# lalu edit .env, isi JWT_SECRET dengan string acak yang panjang

# 5. Jalankan server
npm start
```

Server akan jalan di `http://localhost:4000` (atau port lain lewat env `PORT`).
Buka URL itu di browser, kamu akan diminta bikin password pertama kali (setup),
setelah itu tinggal login pakai password itu setiap kali buka board.

## Menjalankan terus-menerus di server (production)

Disarankan pakai process manager seperti `pm2` supaya server tetap jalan setelah SSH ditutup / server restart:

```bash
npm install -g pm2
pm2 start server/index.js --name private-kanban
pm2 save
pm2 startup   # ikuti instruksi yang muncul supaya auto-start saat server reboot
```

Kalau server internal kamu ada di belakang reverse proxy (nginx dsb), tinggal arahkan proxy ke port yang dipakai (default 4000).

## Mode development (kalau mau ubah-ubah tampilan)

Jalankan backend dan frontend terpisah, dengan hot-reload di frontend:

```bash
# terminal 1
npm start

# terminal 2
cd client
npm install
npm run dev
```

Lalu buka `http://localhost:5173` (Vite dev server, otomatis proxy API ke port 4000).

## Deploy ke Vercel

Karena Vercel itu serverless (tidak ada file storage yang permanen), data disimpan pakai
**Upstash Redis** lewat Vercel Marketplace — gratis untuk skala pemakaian pribadi.

### 1. Push project ke GitHub

```bash
cd private-kanban
git init
git add .
git commit -m "Initial commit"
```
Buat repo baru di GitHub (bisa **private repo**, gratis), lalu push:
```bash
git remote add origin https://github.com/<username>/<nama-repo>.git
git branch -M main
git push -u origin main
```

### 2. Import project ke Vercel

1. Buka [vercel.com](https://vercel.com), login/daftar (bisa pakai akun GitHub).
2. Klik **Add New → Project**, pilih repo `private-kanban` yang barusan di-push.
3. Di bagian **Build & Output Settings**, biarkan default — semua sudah diatur lewat `vercel.json` di dalam repo (build frontend otomatis, function API otomatis kebaca dari folder `api/`).
4. **Jangan klik Deploy dulu** — tambahkan database dulu di langkah 3.

### 3. Tambah database Redis (Upstash) lewat Marketplace

1. Di dashboard project Vercel yang baru dibuat, buka tab **Storage**.
2. Klik **Create Database** / **Browse Marketplace**, cari **Upstash** (Redis).
3. Pilih plan gratis (Free), lalu **Connect** ke project ini.
4. Vercel otomatis menambahkan environment variable seperti `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` (atau `KV_REST_API_URL` / `KV_REST_API_TOKEN`, tergantung versi integrasi) ke project — kamu tidak perlu isi manual. Kode di `server/db-redis.js` sudah baca kedua kemungkinan nama variabel itu.

### 4. Tambah environment variable JWT_SECRET

Masih di tab **Settings → Environment Variables** project Vercel:
- Key: `JWT_SECRET`
- Value: string acak yang panjang (misalnya generate lewat `openssl rand -hex 32` di terminal)
- Terapkan untuk **Production**, **Preview**, dan **Development**

### 5. Deploy

Klik **Deploy**. Tunggu proses build selesai (build frontend + siapkan function API).
Setelah selesai, Vercel kasih URL seperti `https://nama-project.vercel.app` — itu board kamu.

Buka URL-nya, kamu akan diminta setup password pertama kali seperti biasa.

### 6. Update di kemudian hari

Setiap kali kamu `git push` ke branch `main`, Vercel otomatis build & deploy ulang. Tidak perlu langkah manual lagi.

### Catatan mode Vercel

- Data (project & kartu) tersimpan di Upstash Redis, bukan di `data/data.json` — file itu hanya dipakai kalau kamu jalankan secara self-host.
- Kalau mau develop/edit tampilan secara lokal sebelum push, tetap pakai langkah "Mode development" di atas — itu tidak berubah.
- Free tier Upstash cukup besar untuk board pribadi (ribuan request/hari), tapi kalau board ini dipakai tim besar, cek limit-nya di dashboard Upstash.

## Fitur

- 🔒 Login dengan 1 password admin (hash tersimpan aman pakai bcrypt), tanpa sistem user lain — sesuai request "cuma aku yang bisa login"
- 📁 Multi-project: tiap project punya board terpisah, kartu tidak akan tercampur antar project
- 🗂️ 6 kolom tetap: Backlog, Requirement Gathering, UI/UX, Review PM, Engineer, Done
- 🖱️ Drag-and-drop kartu antar kolom maupun urutan dalam kolom
- 🏷️ Prioritas kartu: Low / Medium / High
- 💾 Semua data tersimpan di `data/data.json` di server kamu sendiri — tidak ada data yang keluar ke pihak ketiga

## Reset password

Kalau lupa password, hentikan server, hapus isi field `passwordHash` di `data/data.json`
(atau hapus seluruh file itu kalau tidak masalah semua data project ikut hilang), lalu jalankan
server lagi — kamu akan diminta setup password baru.

## Catatan keamanan

- Ganti `JWT_SECRET` di file `.env` dengan string acak sebelum dipakai serius (jangan pakai default).
- Karena ini board pribadi single-user, tidak ada fitur multi-akun / role — sesuai kebutuhan awal.
- Kalau server internal kamu bisa diakses banyak orang di jaringan yang sama, pertimbangkan tambahkan HTTPS (lewat reverse proxy) supaya password tidak dikirim polos di jaringan.
