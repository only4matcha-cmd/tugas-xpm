import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCnf_e5WBYbCFCAh_7gwdkDU",
    authDomain: "tugas-xpm.firebaseapp.com",
    projectId: "tugas-xpm",
    storageBucket: "tugas-xpm.appspot.com",
    messagingSenderId: "1092797132447",
    appId: "1:1092797132447:web:O66b764fc219dea2223caa"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);

// Elemen DOM
const btnMenu = document.getElementById('btnMenu');
const sideMenu = document.getElementById('sideMenu');
const btnCloseMenu = document.getElementById('btnCloseMenu');
const menuOverlay = document.getElementById('menuOverlay');
const btnDarkMode = document.getElementById('btnDarkMode');
const btnChangePassword = document.getElementById('btnChangePassword');
const btnLoginAdmin = document.getElementById('btnLoginAdmin');
const adminSection = document.getElementById('adminSection');
const btnTambah = document.getElementById('btnTambah');
const containerMapel = document.getElementById('containerMapel');

// Cek Memori Mode Gelap
if (localStorage.getItem("theme") === "light") {
    document.body.classList.remove("dark-theme");
    btnDarkMode.textContent = "🌙 Mode Gelap";
} else {
    document.body.classList.add("dark-theme");
    btnDarkMode.textContent = "☀️ Mode Terang";
}

// Toggle Tombol Mode Warna
btnDarkMode.addEventListener('click', function() {
    document.body.classList.toggle("dark-theme");
    
    if (document.body.classList.contains("dark-theme")) {
        localStorage.setItem("theme", "dark");
        btnDarkMode.textContent = "☀️ Mode Terang";
    } else {
        localStorage.setItem("theme", "light");
        btnDarkMode.textContent = "🌙 Mode Gelap";
    }
});

// Kontrol Menu Samping (Sidebar)
if (btnMenu) {
    btnMenu.addEventListener('click', () => {
        sideMenu.classList.add('active');
        menuOverlay.classList.add('active');
    });
}

function closeMenu() {
    sideMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
}

if (btnCloseMenu) btnCloseMenu.addEventListener('click', closeMenu);
if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

// Manajemen Sandi Admin (Lokal)
const DEFAULT_PASSWORD = "admin";
if (!localStorage.getItem("adminPassword")) {
    localStorage.setItem("adminPassword", DEFAULT_PASSWORD);
}

let isAdminLoggedIn = false;

// Modal Elemen
const passwordModal = document.getElementById('passwordModal');
const inputPassword = document.getElementById('inputPassword');
const btnSubmitPassword = document.getElementById('btnSubmitPassword');
const btnCancelPassword = document.getElementById('btnCancelPassword');

const changePasswordModal = document.getElementById('changePasswordModal');
const inputOldPassword = document.getElementById('inputOldPassword');
const inputNewPassword = document.getElementById('inputNewPassword');
const btnSubmitNewPassword = document.getElementById('btnSubmitNewPassword');
const btnCancelChangePassword = document.getElementById('btnCancelChangePassword');

// Tombol Login Admin
if (btnLoginAdmin) {
    btnLoginAdmin.addEventListener('click', () => {
        if (!isAdminLoggedIn) {
            passwordModal.style.display = 'flex';
            inputPassword.value = '';
        } else {
            isAdminLoggedIn = false;
            adminSection.style.display = 'none';
            btnLoginAdmin.textContent = "Masuk Sebagai Admin";
            alert("Berhasil keluar dari mode admin.");
        }
    });
}

// Verifikasi Sandi Masuk Admin
if (btnSubmitPassword) {
    btnSubmitPassword.addEventListener('click', () => {
        const enteredPassword = inputPassword.value;
        const savedPassword = localStorage.getItem("adminPassword");

        if (enteredPassword === savedPassword) {
            isAdminLoggedIn = true;
            adminSection.style.display = 'block';
            btnLoginAdmin.textContent = "Keluar Admin";
            passwordModal.style.display = 'none';
            requestNotificationPermission();
        } else {
            alert("Sandi salah!");
        }
    });
}

if (btnCancelPassword) {
    btnCancelPassword.addEventListener('click', () => {
        passwordModal.style.display = 'none';
    });
}

// Tombol Buka Menu Ubah Sandi
if (btnChangePassword) {
    btnChangePassword.addEventListener('click', () => {
        closeMenu();
        changePasswordModal.style.display = 'flex';
        inputOldPassword.value = '';
        inputNewPassword.value = '';
    });
}

// Aksi Simpan Sandi Baru
if (btnSubmitNewPassword) {
    btnSubmitNewPassword.addEventListener('click', () => {
        const oldPass = inputOldPassword.value;
        const newPass = inputNewPassword.value;
        const savedPassword = localStorage.getItem("adminPassword");

        if (oldPass === savedPassword) {
            if (newPass.trim() !== "") {
                localStorage.setItem("adminPassword", newPass);
                alert("Sandi admin berhasil diubah!");
                changePasswordModal.style.display = 'none';
            } else {
                alert("Sandi baru tidak boleh kosong!");
            }
        } else {
            alert("Sandi saat ini salah!");
        }
    });
}

if (btnCancelChangePassword) {
    btnCancelChangePassword.addEventListener('click', () => {
        changePasswordModal.style.display = 'none';
    });
}

// Fungsi Request Izin Notifikasi & Ambil FCM Token
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Izin notifikasi diberikan.');
            
            const token = await getToken(messaging, { 
                vapidKey: 'BIgsyrE3a6TY5Ejjdgs3XrKxt5604tpN_AIZOVgHZDMXwsgCzV-_RyJV0LhwqhgBlQwmmmp6YbiB9GdbB3LsIb4' 
            });
            
            if (token) {
                console.log('FCM Token Perangkat:', token);
            } else {
                console.log('Gagal mendapatkan token FCM.');
            }
        } else {
            console.log('Izin notifikasi ditolak.');
        }
    } catch (error) {
        console.error('Terjadi kesalahan saat meminta izin notifikasi:', error);
    }
}

// Menangkap Pesan Saat Aplikasi Terbuka (Foreground)
onMessage(messaging, (payload) => {
    console.log('Pesan diterima saat aplikasi terbuka: ', payload);
    alert(`Notifikasi Baru: ${payload.notification.title} - ${payload.notification.body}`);
});

// Fitur Tambah Tugas ke Firestore
if (btnTambah) {
    btnTambah.addEventListener('click', async () => {
        const mapel = document.getElementById('inputMapel').value.trim();
        const tugas = document.getElementById('inputTugas').value.trim();
        const gambar = document.getElementById('inputGambar').value.trim();

        if (!mapel || !tugas) {
            alert("Nama mata pelajaran dan keterangan tugas harus diisi!");
            return;
        }

        try {
            await addDoc(collection(db, "tugas"), {
                mapel: mapel,
                tugas: tugas,
                gambar: gambar,
                timestamp: new Date()
            });

            document.getElementById('inputMapel').value = '';
            document.getElementById('inputTugas').value = '';
            document.getElementById('inputGambar').value = '';
            alert("Tugas berhasil diposting!");
        } catch (error) {
            console.error("Gagal menambahkan tugas: ", error);
            alert("Terjadi kesalahan saat menyimpan tugas.");
        }
    });
}

// Render Real-Time Daftar Tugas dari Firestore
if (containerMapel) {
    onSnapshot(collection(db, "tugas"), (snapshot) => {
        containerMapel.innerHTML = "";
        
        if (snapshot.empty) {
            containerMapel.innerHTML = `<p style="text-align: center; color: #888;">Belum ada tugas.</p>`;
            return;
        }

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const docId = docSnap.id;

            const card = document.createElement('div');
            card.className = 'mapel-card';
            
            let gambarHTML = data.gambar ? `<img src="${data.gambar}" alt="Gambar Tugas" style="width:100%; border-radius:8px; margin-top:10px;">` : '';
            let tombolHapusHTML = isAdminLoggedIn ? `<button onclick="window.hapusTugas('${docId}')" style="background:#ff4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-top:10px;">Hapus Tugas</button>` : '';

            card.innerHTML = `
                <div class="mapel-header"><h3>${data.mapel}</h3></div>
                <div class="mapel-body">
                    <p>${data.tugas}</p>
                    ${gambarHTML}
                    ${tombolHapusHTML}
                </div>
            `;
            containerMapel.appendChild(card);
        });
    });
}

// Fungsi Global untuk Hapus Tugas (Khusus Admin)
window.hapusTugas = async function(id) {
    if (confirm("Yakin ingin menghapus tugas ini?")) {
        try {
            await deleteDoc(doc(db, "tugas", id));
            alert("Tugas berhasil dihapus.");
        } catch (error) {
            console.error("Gagal menghapus: ", error);
        }
    }
};
