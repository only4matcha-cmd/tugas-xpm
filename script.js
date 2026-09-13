// Import Firebase SDK versi modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Konfigurasi Firebase milikmu
const firebaseConfig = {
  apiKey: "AIzaSyCmf_eSwBYbCFCAh_7gwdkDUjFLZhGHF7A",
  authDomain: "tugas-xpm.firebaseapp.com",
  projectId: "tugas-xpm",
  storageBucket: "tugas-xpm.firebasestorage.app",
  messagingSenderId: "1092797132447",
  appId: "1:1092797132447:web:066b764fc219dea2223caa",
  measurementId: "G-NBEB4F1PWW"
};

// Inisialisasi Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const inputTugas = document.getElementById('inputTugas');
const btnTambah = document.getElementById('btnTambah');
const listTugas = document.getElementById('listTugas');
const loadingText = document.getElementById('loadingText');
const adminSection = document.getElementById('adminSection');
const btnLoginAdmin = document.getElementById('btnLoginAdmin');

// Status Admin (Default: False / Hanya bisa lihat)
let isAdmin = false;

// Tombol rahasia untuk membuka menu input tugas (pakai sandi sederhana "xpm123")
btnLoginAdmin.addEventListener('click', function() {
    if (!isAdmin) {
        let sandi = prompt("Masukkan sandi admin:");
        if (sandi === "xpm123") {
            isAdmin = true;
            adminSection.style.display = "flex";
            btnLoginAdmin.textContent = "Keluar Mode Admin";
            alert("Mode Admin Aktif! Kamu bisa menambah dan menghapus tugas.");
            muatTugasRealtime(); // Muat ulang agar tombol hapus muncul khusus untuk admin
        } else if (sandi !== null) {
            alert("Sandi salah!");
        }
    } else {
        isAdmin = false;
        adminSection.style.display = "none";
        btnLoginAdmin.textContent = "Masuk Sebagai Admin";
        alert("Keluar dari Mode Admin.");
        muatTugasRealtime();
    }
});

// Fungsi Menambahkan Tugas ke Firestore (Database Online)
btnTambah.addEventListener('click', async function() {
    const teksTugas = inputTugas.value.trim();
    if (teksTugas === "") {
        alert("Tolong isi nama tugas!");
        return;
    }

    try {
        await addDoc(collection(db, "tugasKelas"), {
            teks: teksTugas,
            waktu: Date.now()
        });
        inputTugas.value = "";
    } catch (error) {
        console.error("Gagal menambah tugas: ", error);
        alert("Terjadi kesalahan saat menyimpan ke database.");
    }
});

// Fungsi Mengambil & Menampilkan Tugas Secara Real-Time dari Firebase
function muatTugasRealtime() {
    onSnapshot(collection(db, "tugasKelas"), (snapshot) => {
        listTugas.innerHTML = ""; // Bersihkan list di layar
        
        if (snapshot.empty) {
            listTugas.innerHTML = "<p style='text-align:center; color:#888;'>Belum ada tugas.</p>";
            return;
        }

        snapshot.forEach((docItem) => {
            const data = docItem.data();
            const idTugas = docItem.id;

            const li = document.createElement('li');
            
            const span = document.createElement('span');
            span.textContent = data.teks;
            li.appendChild(span);

            // Jika sedang login sebagai Admin, tampilkan tombol Hapus
            if (isAdmin) {
                const btnHapus = document.createElement('button');
                btnHapus.textContent = 'Hapus';
                btnHapus.classList.add('hapus');
                
                btnHapus.addEventListener('click', async function() {
                    if (confirm("Yakin ingin menghapus tugas ini?")) {
                        await deleteDoc(doc(db, "tugasKelas", idTugas));
                    }
                });
                
                li.appendChild(btnHapus);
            }

            listTugas.appendChild(li);
        });
    });
}

// Jalankan fungsi ambil data saat web dibuka
muatTugasRealtime();

