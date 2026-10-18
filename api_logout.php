<?php
session_start();
session_unset();
session_destroy();
// Arahkan kembali ke halaman utama setelah logout
header("Location: index.html");
exit;
?>
```

---

### Langkah 3: Tambahkan Sedikit JavaScript di `index.html`
Sekarang buka **`index.html`**, *scroll* sampai ke bagian paling bawah (di dalam tag `<script>`). Taruh kode ini di mana saja di bagian bawah kumpulannya (misalnya tepat di atas tag `</script>` penutup).

```javascript
        // FITUR BARU: CEK STATUS LOGIN (Mengubah tombol Masuk menjadi Profil)
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                const response = await fetch('api_session.php');
                const session = await response.json();
                
                // Cari area tombol-tombol di pojok kanan atas
                const navActions = document.querySelector('.nav-actions');
                const loginBtn = navActions.querySelector('a[href="login.html"]');

                // Jika user SUDAH LOGIN
                if (session.logged_in) {
                    if (loginBtn) loginBtn.remove(); // Hapus tombol "Masuk"

                    // Ambil nama panggilan (kata pertama saja)
                    const namaPanggilan = session.name.split(' ')[0];
                    
                    // Buat elemen profil baru
                    const profileDiv = document.createElement('div');
                    profileDiv.style.display = 'flex';
                    profileDiv.style.alignItems = 'center';
                    profileDiv.style.gap = '15px';
                    profileDiv.style.marginRight = '10px';

                    // Jika yang login Admin, arahkan ke dashboard. Jika pelanggan, tetap di index.
                    const linkDashboard = session.role === 'admin' ? 'admin.html' : '#';
                    const teksSapaan = session.role === 'admin' ? 'Dashboard Admin' : `Halo, ${namaPanggilan}`;

                    profileDiv.innerHTML = `
                        <a href="${linkDashboard}" style="font-weight: 700; color: var(--text-main); font-size: 0.95rem; text-decoration: none;">
                            <i class="ri-user-smile-line" style="color: var(--accent); margin-right: 4px;"></i> ${teksSapaan}
                        </a>
                        <a href="api_logout.php" class="btn btn-outline" style="padding: 6px 16px; font-size: 0.85rem; border-radius: 50px; color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">Keluar</a>
                    `;
                    
                    // Masukkan ke dalam navbar
                    navActions.prepend(profileDiv);
                }
            } catch (error) {
                console.error("Gagal mengecek sesi login:", error);
            }
        });