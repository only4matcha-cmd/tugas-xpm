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

// Fungsi Pemuatan Tugas Realtime + Menu Titik Tiga Gambar
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
                    // Container pembungkus gambar agar tombol titik tiga bisa melayang di pojok kanan atas
                    const imageWrapper = document.createElement('div');
                    imageWrapper.style.position = "relative";
                    imageWrapper.style.marginTop = "10px";

                    const img = document.createElement('img');
                    img.src = tugas.gambar;
                    img.classList.add('tugas-gambar');
                    img.style.width = "100%";
                    img.style.borderRadius = "6px";
                    imageWrapper.appendChild(img);

                    // Tombol Titik Tiga (⋮) di Pojok Kanan Atas
                    const btnOptions = document.createElement('button');
                    btnOptions.textContent = "⋮";
                    btnOptions.style.position = "absolute";
                    btnOptions.style.top = "8px";
                    btnOptions.style.right = "8px";
                    btnOptions.style.background = "rgba(0, 0, 0, 0.6)";
                    btnOptions.style.color = "white";
                    btnOptions.style.border = "none";
                    btnOptions.style.borderRadius = "50%";
                    btnOptions.style.width = "32px";
                    btnOptions.style.height = "32px";
                    btnOptions.style.fontSize = "18px";
                    btnOptions.style.cursor = "pointer";
                    btnOptions.style.zIndex = "5";
                    imageWrapper.appendChild(btnOptions);

                    // Menu Pop-up (Fullscreen & Download)
                    const menuDropdown = document.createElement('div');
                    menuDropdown.style.display = "none";
                    menuDropdown.style.position = "absolute";
                    menuDropdown.style.top = "45px";
                    menuDropdown.style.right = "8px";
                    menuDropdown.style.background = "#fff";
                    menuDropdown.style.color = "#333";
                    menuDropdown.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
                    menuDropdown.style.borderRadius = "6px";
                    menuDropdown.style.zIndex = "10";
                    menuDropdown.style.overflow = "hidden";

                    // Opsi 1: Full Screen
                    const optionFull = document.createElement('div');
                    optionFull.textContent = "🔍 Full Screen";
                    optionFull.style.padding = "10px 14px";
                    optionFull.style.cursor = "pointer";
                    optionFull.style.fontSize = "14px";
                    optionFull.style.borderBottom = "1px solid #eee";
                    optionFull.addEventListener('click', () => {
                        if (img.requestFullscreen) {
                            img.requestFullscreen();
                        } else if (img.webkitRequestFullscreen) {
                            img.webkitRequestFullscreen();
                        }
                        menuDropdown.style.display = "none";
                    });
                    menuDropdown.appendChild(optionFull);

                    // Opsi 2: Download Image
                    const optionDownload = document.createElement('a');
                    optionDownload.textContent = "📥 Download Image";
                    optionDownload.href = tugas.gambar;
                    optionDownload.target = "_blank";
                    optionDownload.download = "Tugas-XPM.jpg";
                    optionDownload.style.display = "block";
                    optionDownload.style.padding = "10px 14px";
                    optionDownload.style.color = "#333";
                    optionDownload.style.textDecoration = "none";
                    optionDownload.style.fontSize = "14px";
                    optionDownload.addEventListener('click', () => {
                        menuDropdown.style.display = "none";
                    });
                    menuDropdown.appendChild(optionDownload);

                    imageWrapper.appendChild(menuDropdown);

                    // Event Klik Tombol Titik Tiga untuk Buka/Tutup Menu
                    btnOptions.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (menuDropdown.style.display === "block") {
                            menuDropdown.style.display = "none";
                        } else {
                            menuDropdown.style.display = "block";
                        }
                    });

                    // Tutup menu jika klik di luar gambar
                    document.addEventListener('click', () => {
                        menuDropdown.style.display = "none";
                    });

                    itemDiv.appendChild(imageWrapper);
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
