import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmf_eSwBYbCFCAh_7gwdkDUjFLZhGHF7A",
  authDomain: "tugas-xpm.firebaseapp.com",
  projectId: "tugas-xpm",
  storageBucket: "tugas-xpm.firebasestorage.app",
  messagingSenderId: "1092797132447",
  appId: "1:1092797132447:web:066b764fc219dea2223caa",
  measurementId: "G-NBEB4F1PWW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const inputMapel = document.getElementById('inputMapel');
const inputTugas = document.getElementById('inputTugas');
const inputGambar = document.getElementById('inputGambar');
const btnTambah = document.getElementById('btnTambah');
const containerMapel = document.getElementById('containerMapel');
const adminSection = document.getElementById('adminSection');
const btnLoginAdmin = document.getElementById('btnLoginAdmin');

// Elemen Menu Samping & Pengaturan
const btnMenu = document.getElementById('btnMenu');
const sideMenu = document.getElementById('sideMenu');
const btnCloseMenu = document.getElementById('btnCloseMenu');
const menuOverlay = document.getElementById('menuOverlay');
const btnDarkMode = document.getElementById('btnDarkMode');

// Elemen Modal Sandi Custom
const passwordModal = document.getElementById('passwordModal');
const inputPassword = document.getElementById('inputPassword');
const btnSubmitPassword = document.getElementById('btnSubmitPassword');
const btnCancelPassword = document.getElementById('btnCancelPassword');

let isAdmin = false;
adminSection.style.display = "none";

// Cek memori Mode Gelap
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-theme");
    btnDarkMode.textContent = "☀️ Mode Terang";
}

// Interaksi Buka/Tutup Menu Samping
btnMenu.addEventListener('click', () => {
    sideMenu.classList.add('open');
    menuOverlay.classList.add('active');
});

btnCloseMenu.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('active');
});

menuOverlay.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('active');
});

// Toggle Mode Gelap
btnDarkMode.addEventListener('click', function() {
    document.body.classList.toggle("dark-theme");
    
    if (document.body.classList.contains("dark-theme")) {
        localStorage.setItem("darkMode", "enabled");
        btnDarkMode.textContent = "☀️ Mode Terang";
    } else {
        localStorage.setItem("darkMode", "disabled");
        btnDarkMode.textContent = "🌙 Mode Gelap";
    }
});

// Logika Admin dengan Modal Custom
btnLoginAdmin.addEventListener('click', function() {
    if (!isAdmin) {
        inputPassword.value = "";
        passwordModal.classList.add('active');
        inputPassword.focus();
    } else {
        isAdmin = false;
        adminSection.style.display = "none";
        btnLoginAdmin.textContent = "Masuk Sebagai Admin";
        alert("Keluar dari Mode Admin.");
        muatTugasRealtime();
    }
});

btnSubmitPassword.addEventListener('click', function() {
    let sandi = inputPassword.value;
    if (sandi === "xpm123") {
        isAdmin = true;
        adminSection.style.display = "block";
        btnLoginAdmin.textContent = "Keluar Mode Admin";
        passwordModal.classList.remove('active');
        alert("Mode Admin Aktif!");
        muatTugasRealtime();
    } else {
        alert("Sandi salah!");
        inputPassword.value = "";
        inputPassword.focus();
    }
});

btnCancelPassword.addEventListener('click', function() {
    passwordModal.classList.remove('active');
});

btnTambah.addEventListener('click', async function() {
    const mapel = inputMapel.value.trim();
    const teks = inputTugas.value.trim();
    const gambar = inputGambar.value.trim();

    if (mapel === "" || teks === "") {
        alert("Nama Mapel dan Keterangan Tugas wajib diisi!");
        return;
    }

    try {
        await addDoc(collection(db, "tugasKelas"), {
            mapel: mapel,
            teks: teks,
            gambar: gambar,
            waktu: Date.now()
        });
        inputMapel.value = "";
        inputTugas.value = "";
        inputGambar.value = "";
        alert("Tugas berhasil ditambahkan!");
    } catch (error) {
        console.error("Gagal menambah tugas: ", error);
        alert("Terjadi kesalahan saat menyimpan.");
    }
});

// Fungsi Pemuatan Tugas Realtime + Tombol Unduh Gambar
function muatTugasRealtime() {
    onSnapshot(collection(db, "tugasKelas"), (snapshot) => {
        containerMapel.innerHTML = "";

        if (snapshot.empty) {
            containerMapel.innerHTML = "<p style='text-align:center; color:#888;'>Belum ada tugas sama sekali.</p>";
            return;
        }

        let dataMapel = {};
        snapshot.forEach((docItem) => {
            let data = docItem.data();
            let id = docItem.id;
            let namaMapel = data.mapel;

            if (!dataMapel[namaMapel]) {
                dataMapel[namaMapel] = [];
            }
            dataMapel[namaMapel].push({ id: id, ...data });
        });

        for (let mapel in dataMapel) {
            const card = document.createElement('div');
            card.classList.add('mapel-card');

            const header = document.createElement('div');
            header.classList.add('mapel-header');
            header.textContent = mapel;
            card.appendChild(header);

            const body = document.createElement('div');
            body.classList.add('mapel-body');

            dataMapel[mapel].forEach((tugas) => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('tugas-item');

                const teksP = document.createElement('div');
                teksP.classList.add('tugas-teks');
                teksP.textContent = tugas.teks;
                itemDiv.appendChild(teksP);

                if (tugas.gambar && tugas.gambar.trim() !== "") {
                    const img = document.createElement('img');
                    img.src = tugas.gambar;
                    img.classList.add('tugas-gambar');
                    itemDiv.appendChild(img);

                    // Tombol Unduh Gambar
                    const btnDownload = document.createElement('a');
                    btnDownload.textContent = '📥 Unduh Gambar';
                    btnDownload.href = tugas.gambar;
                    btnDownload.target = '_blank';
                    btnDownload.download = 'Tugas-XPM.jpg';
                    btnDownload.style.display = "inline-block";
                    btnDownload.style.marginTop = "8px";
                    btnDownload.style.padding = "6px 12px";
                    btnDownload.style.backgroundColor = "#4CAF50";
                    btnDownload.style.color = "white";
                    btnDownload.style.textDecoration = "none";
                    btnDownload.style.borderRadius = "4px";
                    btnDownload.style.fontSize = "14px";
                    
                    itemDiv.appendChild(btnDownload);
                }

                if (isAdmin) {
                    const btnHapus = document.createElement('button');
                    btnHapus.textContent = 'Hapus Tugas Ini';
                    btnHapus.classList.add('hapus');
                    btnHapus.addEventListener('click', async function() {
                        if (confirm("Yakin ingin menghapus tugas ini?")) {
                            await deleteDoc(doc(db, "tugasKelas", tugas.id));
                        }
                    });
                    itemDiv.appendChild(btnHapus);
                }

                body.appendChild(itemDiv);
            });

            card.appendChild(body);
            containerMapel.appendChild(card);
        }
    });
}

muatTugasRealtime();
