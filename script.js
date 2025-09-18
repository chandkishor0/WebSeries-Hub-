// Firebase Initialization
const firebaseConfig = {
  apiKey: "AIzaSyDzqf9LnP7opk30hyv42MuxcsII0AsRQ2I",
  authDomain: "webseries-hub-94dbb.firebaseapp.com",
  projectId: "webseries-hub-94dbb",
  storageBucket: "webseries-hub-94dbb.appspot.com",
  messagingSenderId: "416872939626",
  appId: "1:416872939626:web:af484c2c3a6e00af774a13"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Elements
const searchBox = document.getElementById("searchBox");
const adminBtn = document.getElementById("adminBtn");
const loginPopup = document.getElementById("loginPopup");
const closePopup = document.getElementById("closePopup");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");
const loader = document.getElementById("loader");
loader.style.display = "flex"; // show loader

const rows = document.querySelectorAll(".row");

// Admin Popup Controls
adminBtn.addEventListener("click", () => loginPopup.style.display = "flex");
closePopup.addEventListener("click", () => loginPopup.style.display = "none");
window.addEventListener("click", e => { if(e.target === loginPopup) loginPopup.style.display = "none"; });

// Admin Login
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
          window.location.href = "admin.html";
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

// Load Posters from Firestore
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
            <button class="play-btn">▶ Play</button>
          </div>
        `;
        container.appendChild(card);

        const playBtn = card.querySelector(".play-btn");
        playBtn.addEventListener("click", () => {
          if(p.parts && p.parts.length > 0){
            const popup = document.createElement("div");
            popup.className = "popup";
            popup.style.display = "flex";
            popup.style.justifyContent = "center";
            popup.style.alignItems = "center";
            popup.style.position = "fixed";
            popup.style.top = "0";
            popup.style.left = "0";
            popup.style.width = "100%";
            popup.style.height = "100%";
            popup.style.background = "rgba(0,0,0,0.85)";
            popup.style.zIndex = "9999";

            popup.innerHTML = `
              <div style="
                background: #181818;
                padding: 20px;
                border-radius: 12px;
                width: 90%;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 0 20px rgba(229,9,20,0.7);
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-height: 80vh;
                overflow-y: auto;
              ">
                <span style="
                  align-self: flex-end;
                  cursor: pointer;
                  font-size: 20px;
                  color: #e50914;
                " onclick="this.parentElement.parentElement.remove()">×</span>
                <h3 style="margin: 0 0 10px 0; color: #fff;">${p.title}</h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${p.parts.map((part, idx) => 
                    `<button style="
                      padding: 10px;
                      border: none;
                      border-radius: 8px;
                      background: #e50914;
                      color: #fff;
                      cursor: pointer;
                      font-size: 14px;
                      transition: background 0.3s;
                    " onmouseover="this.style.background='#b20710'" onmouseout="this.style.background='#e50914'" onclick="window.open('${part.url}','_blank')">
                      ${part.title || 'Part ' + (idx+1)}
                    </button>`
                  ).join("")}
                </div>
              </div>
            `;
            document.body.appendChild(popup);
          } else {
            window.open(p.video,'_blank');
          }
        });
      });
    });

    applySearchFilter();

    // Fade out loader smoothly
    loader.style.opacity = "0";
    setTimeout(() => loader.style.display = "none", 800);
    // Show Telegram button after loader
setTimeout(() => {
  document.querySelector(".telegram-float").style.display = "block";
}, 800);
setTimeout(() => {
  loader.style.display = "none";
  document.querySelector(".header").style.display = "flex";
}, 10);
  });
}

loadPosters();

// Search Filter
function applySearchFilter(){
  const query = searchBox.value.toLowerCase();
  document.querySelectorAll(".poster-card").forEach(card => {
    const alt = card.querySelector("img").alt.toLowerCase();
    card.style.display = alt.includes(query) ? "block" : "none";
  });
}

searchBox.addEventListener("input", applySearchFilter);

// Optional: Keep admin logged in
auth.onAuthStateChanged(user => {
  if(user && user.email === "chandkishor@gmail.com"){
    console.log("Admin logged in:", user.email);
  }
});