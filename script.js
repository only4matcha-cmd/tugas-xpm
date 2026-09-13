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

// Elemen DOM
const inputMapel = document.getElementById('inputMapel');
const inputTugas = document.getElementById('inputTugas');
const inputGambar = document.getElementById('inputGambar');
const btnTambah = document.getElementById('btnTambah');
const containerMapel = document.getElementById('containerMapel');
const adminSection = document.getElementById('adminSection');
const btnLoginAdmin = document.getElementById('btnLoginAdmin');

const btnMenu = document.getElementById('btnMenu');
const sideMenu = document.getElementById('sideMenu');
const btnCloseMenu = document.getElementById('btnCloseMenu');
const menuOverlay = document.getElementById('menuOverlay');
const btnDarkMode = document.getElementById('btnDarkMode');
const btnChangePassword = document.getElementById('btnChangePassword');
const btnVerifyWa = document.getElementById('btnVerifyWa');

const passwordModal = document.getElementById('passwordModal');
const inputPassword = document.getElementById('inputPassword');
const btnSubmitPassword = document.getElementById('btnSubmitPassword');
const btnCancelPassword = document.getElementById('btnCancelPassword');

const changePasswordModal = document.getElementById('changePasswordModal');
const inputOldPassword = document.getElementById('inputOldPassword');
const inputNewPassword = document.getElementById('inputNewPassword');
const btnSubmitNewPassword = document.getElementById('btnSubmitNewPassword');
const btnCancelChangePassword = document.getElementById('btnCancelChangePassword');

const verifyModal = document.getElementById('verifyModal');
const inputSiswaWa = document.getElementById('inputSiswaWa');
const btnKirimVerifikasi = document.getElementById('btnKirimVerifikasi');
const btnCancelVerify = document.getElementById('btnCancelVerify');

const inputWhitelistWa = document.getElementById('inputWhitelistWa');
const btnSimpanWa = document.getElementById('btnSimpanWa');
const listNomorWa = document.getElementById('listNomorWa');

let isAdmin = false;
adminSection.style.display = "none";

let currentAdminPassword = localStorage.getItem("adminPassword") || "xpm123";
const NOMOR_ADMIN_WA = "6281234567890"; // <-- Ganti dengan nomor WhatsApp aslimu

if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-theme");
    btnDarkMode.textContent = "☀️ Mode Terang";
}

// Navigasi Sidebar
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

// Dark Mode
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

// Modal Verifikasi Siswa
btnVerifyWa.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('active');
    verifyModal.classList.add('active');
    inputSiswaWa.value = "";
    inputSiswaWa.focus();
});

btnKirimVerifikasi.addEventListener('click', () => {
    let nomor = inputSiswaWa.value.trim();
    if (nomor !== "") {
        let kodeUnik = "VERIF-" + Math.floor(1000 + Math.random() * 9000);
        let pesan = `Halo Admin, saya ingin verifikasi nomor WhatsApp untuk web Tugas X-PM.\nNomor saya: ${nomor}\nKode: ${kodeUnik}`;
        let urlWa = `https://wa.me/${NOMOR_ADMIN_WA}?text=${encodeURIComponent(pesan)}`;
        window.open(urlWa, '_blank');
        verifyModal.classList.remove('active');
    } else {
        alert("Masukkan nomor WhatsApp terlebih dahulu!");
        inputSiswaWa.focus();
    }
});

btnCancelVerify.addEventListener('click', () => {
    verifyModal.classList.remove('active');
});

// Login Admin
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
    if (sandi === currentAdminPassword) {
        isAdmin = true;
        adminSection.style.display = "block";
        btnLoginAdmin.textContent = "Keluar Mode Admin";
        passwordModal.classList.remove('active');
        alert("Mode Admin Aktif!");
        muatWhitelistWa();
        muatTugasRealtime(); // Refresh agar tombol hapus tugas muncul
    } else {
        alert("Sandi salah!");
        inputPassword.value = "";
        inputPassword.focus();
    }
});

btnCancelPassword.addEventListener('click', function() {
    passwordModal.classList.remove('active');
});

// Ubah Sandi Admin
btnChangePassword.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('active');
    inputOldPassword.value = "";
    inputNewPassword.value = "";
    changePasswordModal.classList.add('active');
    inputOldPassword.focus();
});

btnSubmitNewPassword.addEventListener('click', () => {
    let oldPass = inputOldPassword.value;
    let newPass = inputNewPassword.value;

    if (oldPass === currentAdminPassword) {
        if (newPass && newPass.trim() !== "") {
            currentAdminPassword = newPass.trim();
            localStorage.setItem("adminPassword", currentAdminPassword);
            alert("Sandi admin berhasil diubah!");
            changePasswordModal.classList.remove('active');
        } else {
            alert("Sandi baru tidak boleh kosong!");
            inputNewPassword.focus();
        }
    } else {
        alert("Sandi lama salah!");
        inputOldPassword.value = "";
        inputOldPassword.focus();
    }
});

btnCancelChangePassword.addEventListener('click', () => {
    changePasswordModal.classList.remove('active');
});

// Admin Menambah Nomor Whitelist ke Firestore
btnSimpanWa.addEventListener('click', async () => {
    let nomorBaru = inputWhitelistWa.value.trim();
    if (nomorBaru !== "") {
        try {
            await addDoc(collection(db, "whitelistWa"), { nomor: nomorBaru });
            inputWhitelistWa.value = "";
            alert("Nomor berhasil disimpan ke daftar terverifikasi!");
        } catch (error) {
            console.error("Gagal menyimpan nomor:", error);
            alert("Terjadi kesalahan saat menyimpan.");
        }
    } else {
        alert("Nomor tidak boleh kosong!");
    }
});

// Muat dan render daftar nomor terverifikasi beserta tombol Hapus (Unwishlist) di Panel Admin
function muatWhitelistWa() {
    onSnapshot(collection(db, "whitelistWa"), (snapshot) => {
        listNomorWa.innerHTML = "";
        
        if (snapshot.empty) {
            listNomorWa.textContent = "Belum ada nomor terverifikasi.";
            return;
        }

        const titleP = document.createElement('div');
        titleP.innerHTML = "<b>Daftar Tersimpan:</b>";
        titleP.style.marginBottom = "5px";
        listNomorWa.appendChild(titleP);

        snapshot.forEach((docItem) => {
            let dataNomor = docItem.data().nomor;
            let docId = docItem.id;

            const rowDiv = document.createElement('div');
            rowDiv.style.display = "flex";
            rowDiv.style.alignItems = "center";
            rowDiv.style.justifyContent = "space-between";
            rowDiv.style.background = "#222";
            rowDiv.style.padding = "6px 10px";
            rowDiv.style.borderRadius = "4px";
            rowDiv.style.marginBottom = "4px";

            const spanNum = document.createElement('span');
            spanNum.textContent = dataNomor;
            rowDiv.appendChild(spanNum);

            const btnHapusWa = document.createElement('button');
            btnHapusWa.textContent = "Hapus";
            btnHapusWa.style.backgroundColor = "#d32f2f";
            btnHapusWa.style.color = "white";
            btnHapusWa.style.border = "none";
            btnHapusWa.style.padding = "2px 8px";
            btnHapusWa.style.borderRadius = "3px";
            btnHapusWa.style.cursor = "pointer";
            btnHapusWa.style.fontSize = "11px";

            // Fitur Unwishlist: Menghapus nomor dari Firestore
            btnHapusWa.addEventListener('click', async () => {
                if (confirm(`Yakin ingin menghapus nomor ${dataNomor} dari daftar?`)) {
                    try {
                        await deleteDoc(doc(db, "whitelistWa", docId));
                        alert("Nomor berhasil dihapus dari daftar terverifikasi!");
                    } catch (error) {
                        console.error("Gagal menghapus nomor:", error);
                        alert("Terjadi kesalahan saat menghapus.");
                    }
                }
            });

            rowDiv.appendChild(btnHapusWa);
            listNomorWa.appendChild(rowDiv);
        });
    });
}

// Tambah Tugas oleh Admin
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

        let kirimWa = confirm("Tugas berhasil diposting! Ingin mengirim pengingat ke WhatsApp?");
        if (kirimWa) {
            let pesan = `📢 *TUGAS BARU - ${mapel.toUpperCase()}*\n\n${teks}\n\nCek web kelas: ${window.location.href}`;
            let urlWa = `https://wa.me/?text=${encodeURIComponent(pesan)}`;
            window.open(urlWa, '_blank');
        }

    } catch (error) {
        console.error("Gagal menambah tugas: ", error);
        alert("Terjadi kesalahan saat menyimpan.");
    }
});

// Render Daftar Tugas Realtime
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
            header.style.display = "flex";
            header.style.alignItems = "center";
            header.style.justifyContent = "space-between";
            header.style.position = "relative";
            header.style.padding = "5px 12px"; 
            header.style.minHeight = "auto";
            header.style.lineHeight = "1.2";

            const spacer = document.createElement('div');
            spacer.style.width = "24px";
            header.appendChild(spacer);

            const titleSpan = document.createElement('span');
            titleSpan.textContent = mapel;
            titleSpan.style.flexGrow = "1";
            titleSpan.style.textAlign = "center";
            titleSpan.style.fontWeight = "bold";
            titleSpan.style.fontSize = "15px";
            titleSpan.style.margin = "0";
            titleSpan.style.overflow = "hidden";
            titleSpan.style.textOverflow = "ellipsis";
            titleSpan.style.whiteSpace = "nowrap";
            header.appendChild(titleSpan);

            const btnMapelOptions = document.createElement('button');
            btnMapelOptions.textContent = "⋮";
            btnMapelOptions.style.background = "transparent";
            btnMapelOptions.style.color = "white";
            btnMapelOptions.style.border = "none";
            btnMapelOptions.style.fontSize = "18px";
            btnMapelOptions.style.fontWeight = "bold";
            btnMapelOptions.style.cursor = "pointer";
            btnMapelOptions.style.width = "24px";
            btnMapelOptions.style.height = "24px";
            btnMapelOptions.style.lineHeight = "1";
            btnMapelOptions.style.padding = "0";
            header.appendChild(btnMapelOptions);

            const mapelMenuDropdown = document.createElement('div');
            mapelMenuDropdown.style.display = "none";
            mapelMenuDropdown.style.position = "absolute";
            mapelMenuDropdown.style.top = "36px";
            mapelMenuDropdown.style.right = "10px";
            mapelMenuDropdown.style.background = "#2d2d2d";
            mapelMenuDropdown.style.color = "#ffffff";
            mapelMenuDropdown.style.boxShadow = "0 6px 16px rgba(0,0,0,0.6)";
            mapelMenuDropdown.style.borderRadius = "8px";
            mapelMenuDropdown.style.zIndex = "10";
            mapelMenuDropdown.style.overflow = "hidden";
            mapelMenuDropdown.style.minWidth = "170px";
            mapelMenuDropdown.style.border = "1px solid #444";

            let tugasUtama = dataMapel[mapel][0]; 
            let adaGambar = tugasUtama.gambar && tugasUtama.gambar.trim() !== "";

            const optionCopy = document.createElement('div');
            optionCopy.textContent = "📋 Salin Text";
            optionCopy.style.padding = "10px 14px";
            optionCopy.style.cursor = "pointer";
            optionCopy.style.fontSize = "14px";
            optionCopy.style.borderBottom = adaGambar ? "1px solid #444" : "none";
            optionCopy.addEventListener('click', () => {
                navigator.clipboard.writeText(tugasUtama.teks).then(() => {
                    alert("Teks berhasil disalin!");
                }).catch(err => {
                    console.error("Gagal menyalin teks: ", err);
                });
                mapelMenuDropdown.style.display = "none";
            });
            mapelMenuDropdown.appendChild(optionCopy);

            if (adaGambar) {
                const optionFull = document.createElement('div');
                optionFull.textContent = "🔍 Full Screen";
                optionFull.style.padding = "10px 14px";
                optionFull.style.cursor = "pointer";
                optionFull.style.fontSize = "14px";
                optionFull.style.borderBottom = "1px solid #444";
                optionFull.addEventListener('click', () => {
                    const targetImg = card.querySelector('.tugas-gambar');
                    if (targetImg) {
                        if (targetImg.requestFullscreen) {
                            targetImg.requestFullscreen();
                        } else if (targetImg.webkitRequestFullscreen) {
                            targetImg.webkitRequestFullscreen();
                        }
                    }
                    mapelMenuDropdown.style.display = "none";
                });
                mapelMenuDropdown.appendChild(optionFull);

                const optionDownload = document.createElement('a');
                optionDownload.textContent = "📥 Download Image";
                optionDownload.href = tugasUtama.gambar;
                optionDownload.target = "_blank";
                optionDownload.download = "Tugas-XPM.jpg";
                optionDownload.style.display = "block";
                optionDownload.style.padding = "10px 14px";
                optionDownload.style.color = "#ffffff";
                optionDownload.style.textDecoration = "none";
                optionDownload.style.fontSize = "14px";
                optionDownload.addEventListener('click', () => {
                    mapelMenuDropdown.style.display = "none";
                });
                mapelMenuDropdown.appendChild(optionDownload);
            }

            mapelMenuDropdown.classList.add('mapel-menu-dropdown-popup');
            header.appendChild(mapelMenuDropdown);

            btnMapelOptions.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.mapel-menu-dropdown-popup').forEach(m => {
                    if (m !== mapelMenuDropdown) m.style.display = "none";
                });

                if (mapelMenuDropdown.style.display === "block") {
                    mapelMenuDropdown.style.display = "none";
                } else {
                    mapelMenuDropdown.style.display = "block";
                }
            });

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
                    img.style.width = "100%";
                    img.style.borderRadius = "6px";
                    img.style.marginTop = "10px";
                    img.style.display = "block";
                    itemDiv.appendChild(img);
                }

                if (isAdmin) {
                    const btnHapus = document.createElement('button');
                    btnHapus.textContent = 'Hapus Tugas Ini';
                    btnHapus.classList.add('hapus');
                    btnHapus.style.marginTop = "10px";
                    btnHapus.style.backgroundColor = "#d32f2f";
                    btnHapus.style.color = "white";
                    btnHapus.style.border = "none";
                    btnHapus.style.padding = "6px 12px";
                    btnHapus.style.borderRadius = "4px";
                    btnHapus.style.cursor = "pointer";

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

// Tutup dropdown jika klik di luar
document.addEventListener('click', () => {
    document.querySelectorAll('.mapel-menu-dropdown-popup').forEach(m => {
        m.style.display = "none";
    });
});

// Jalankan fungsi muat tugas saat halaman dibuka
muatTugasRealtime();
