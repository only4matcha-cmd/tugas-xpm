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

let isAdmin = false;

// Pastikan panel admin tertutup saat pertama kali web dibuka
adminSection.style.display = "none";

btnLoginAdmin.addEventListener('click', function() {
    if (!isAdmin) {
        let sandi = prompt("Masukkan sandi admin:");
        if (sandi === "xpm123") {
            isAdmin = true;
            adminSection.style.display = "block";
            btnLoginAdmin.textContent = "Keluar Mode Admin";
            alert("Mode Admin Aktif!");
            muatTugasRealtime();
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
