// ---------------------------
// Firebase Initialization
// ---------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDzqf9LnP7opk30hyv42MuxcsII0AsRQ2I",
  authDomain: "webseries-hub-94dbb.firebaseapp.com",
  projectId: "webseries-hub-94dbb",
  storageBucket: "webseries-hub-94dbb.firebasestorage.app",
  messagingSenderId: "416872939626",
  appId: "1:416872939626:web:af484c2c3a6e00af774a13"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ---------------------------
// Elements
// ---------------------------
const searchBox = document.getElementById("searchBox");
const adminBtn = document.getElementById("adminBtn");
const loginPopup = document.getElementById("loginPopup");
const closePopup = document.getElementById("closePopup");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

// ---------------------------
// Admin Popup Controls
// ---------------------------
adminBtn.addEventListener("click", () => loginPopup.style.display = "flex");
closePopup.addEventListener("click", () => loginPopup.style.display = "none");
window.addEventListener("click", e => { if(e.target === loginPopup) loginPopup.style.display = "none"; });

// ---------------------------
// Admin Login
// ---------------------------
loginBtn.addEventListener("click", () => {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      if(user.email === "chandkishor@gmail.com"){ // admin email
        loginMessage.textContent = "Login Successful!";
        loginMessage.style.color = "lime";
        setTimeout(() => {
          loginPopup.style.display = "none";
          window.location.href = "admin.html"; // go to dashboard
        }, 1000);
      } else {
        loginMessage.textContent = "You are not admin!";
        loginMessage.style.color = "red";
        auth.signOut();
      }
    })
    .catch(err => {
      loginMessage.textContent = "Invalid Email or Password!";
      loginMessage.style.color = "red";
      console.error(err);
    });
});

// ---------------------------
// Load Posters from Firestore
// ---------------------------
const rows = document.querySelectorAll(".row");

function loadPosters(){
  db.collection("videos").onSnapshot(snapshot => {
    const videos = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id;
      videos.push(data);
    });

    // Clear rows
    rows.forEach(row => row.querySelector(".row-posters").innerHTML = "");

    // Populate rows
    rows.forEach(row => {
      const category = row.dataset.category;
      const container = row.querySelector(".row-posters");

      let filteredVideos;
      if(category === "trending"){
        filteredVideos = videos.filter(v => v.trending);
      } else {
        filteredVideos = videos.filter(v => v.category === category);
      }

      filteredVideos.forEach(p => {
        const card = document.createElement("div");
        card.className = "poster-card";
        card.innerHTML = `
          <img src="${p.poster}" alt="${p.title}">
          <div class="poster-overlay">
            <h3>${p.title}</h3>
            <button class="play-btn" onclick="window.open('${p.video}', '_blank')">▶ Play</button>
          </div>
        `;
        container.appendChild(card);
      });
    });

    applySearchFilter();
  });
}

loadPosters();

// ---------------------------
// Search Filter
// ---------------------------
function applySearchFilter(){
  const query = searchBox.value.toLowerCase();
  document.querySelectorAll(".poster-card").forEach(card => {
    const alt = card.querySelector("img").alt.toLowerCase();
    card.style.display = alt.includes(query) ? "block" : "none";
  });
}

searchBox.addEventListener("input", applySearchFilter);

// ---------------------------
// Optional: Keep admin logged in
// ---------------------------
auth.onAuthStateChanged(user => {
  if(user && user.email === "chandkishor@gmail.com"){
    console.log("Admin logged in:", user.email);
  }
});