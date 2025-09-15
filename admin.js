// ---------------------------
// Firebase Config
// ---------------------------
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

const adminContent = document.getElementById("adminContent");

// ---------------------------
// Admin Auth Check
// ---------------------------
auth.onAuthStateChanged(user => {
  if(!user || user.email !== "chandkishor@gmail.com"){
    window.location.href = "index.html";
  } else {
    adminContent.style.display = "block"; // show content only for admin
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut().then(()=> window.location.href = "index.html");
});

// Form Elements
const videoForm = document.getElementById("videoForm");
const docIdInput = document.getElementById("docId");
const titleInput = document.getElementById("videoTitle");
const posterInput = document.getElementById("videoPoster");
const linkInput = document.getElementById("videoLink");
const categoryInput = document.getElementById("videoCategory");
const trendingInput = document.getElementById("videoTrending");
const videosList = document.getElementById("videosList");
const partsContainer = document.getElementById("partsContainer");
const addPartBtn = document.getElementById("addPartBtn");
const allVideosSection = document.getElementById("allVideosSection");

// Add Part Button
addPartBtn.addEventListener("click", () => {
  const partDiv = document.createElement("div");
  partDiv.style.display = "flex";
  partDiv.style.gap = "5px";
  partDiv.style.marginBottom = "5px";

  const partTitle = document.createElement("input");
  partTitle.type = "text";
  partTitle.placeholder = "Part Title";
  partTitle.required = true;
  partTitle.style.flex = "1";

  const partUrl = document.createElement("input");
  partUrl.type = "text";
  partUrl.placeholder = "Part URL";
  partUrl.required = true;
  partUrl.style.flex = "1";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "❌";
  removeBtn.addEventListener("click", () => partDiv.remove());

  partDiv.appendChild(partTitle);
  partDiv.appendChild(partUrl);
  partDiv.appendChild(removeBtn);
  partsContainer.appendChild(partDiv);
});

// Add / Update Video
videoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const parts = Array.from(partsContainer.children).map(div => ({
    title: div.children[0].value,
    url: div.children[1].value
  }));

  const data = {
    title: titleInput.value,
    poster: posterInput.value,
    video: linkInput.value,
    category: categoryInput.value,
    trending: trendingInput.checked,
    parts: parts.length > 0 ? parts : null
  };

  const docId = docIdInput.value;
  if(docId){ // update
    db.collection("videos").doc(docId).update(data).then(()=> {
      resetForm();
      loadVideos();
    });
  } else { // new
    db.collection("videos").add(data).then(()=> {
      resetForm();
      loadVideos();
    });
  }
});

// Reset Form
function resetForm(){
  docIdInput.value = "";
  titleInput.value = "";
  posterInput.value = "";
  linkInput.value = "";
  categoryInput.value = "movies";
  trendingInput.checked = false;
  partsContainer.innerHTML = "";
}

// Load All Videos
function loadVideos(){
  videosList.innerHTML = "";
  db.collection("videos").orderBy("title").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${data.title}</strong> [${data.category}] ${data.trending ? "🔥" : ""}
        <br>
        <a href="${data.video}" target="_blank">▶ Play</a>
        <button onclick="editVideo('${doc.id}')">Edit</button>
        <button onclick="deleteVideo('${doc.id}')">Delete</button>
        <label>Trending 🔥 <input type="checkbox" ${data.trending ? "checked" : ""} onchange="toggleTrending('${doc.id}', this.checked)"></label>
      `;
      videosList.appendChild(div);
    });
  });
}
loadVideos();

// Edit Video
window.editVideo = (id) => {
  db.collection("videos").doc(id).get().then(doc => {
    const data = doc.data();
    docIdInput.value = id;
    titleInput.value = data.title;
    posterInput.value = data.poster;
    linkInput.value = data.video;
    categoryInput.value = data.category;
    trendingInput.checked = data.trending;

    partsContainer.innerHTML = "";
    if(data.parts && data.parts.length > 0){
      data.parts.forEach(p => {
        const partDiv = document.createElement("div");
        partDiv.style.display = "flex";
        partDiv.style.gap = "5px";
        partDiv.style.marginBottom = "5px";

        const partTitle = document.createElement("input");
        partTitle.type = "text";
        partTitle.placeholder = "Part Title";
        partTitle.value = p.title;
        partTitle.required = true;
        partTitle.style.flex = "1";

        const partUrl = document.createElement("input");
        partUrl.type = "text";
        partUrl.placeholder = "Part URL";
        partUrl.value = p.url;
        partUrl.required = true;
        partUrl.style.flex = "1";

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "❌";
        removeBtn.addEventListener("click", () => partDiv.remove());

        partDiv.appendChild(partTitle);
        partDiv.appendChild(partUrl);
        partDiv.appendChild(removeBtn);
        partsContainer.appendChild(partDiv);
      });
    }
  });
}

// Delete Video
window.deleteVideo = (id) => {
  if(confirm("Are you sure you want to delete this video?")){
    db.collection("videos").doc(id).delete().then(loadVideos);
  }
}

// Toggle Trending
window.toggleTrending = (id, value) => {
  db.collection("videos").doc(id).update({ trending: value });
}

// Search Box with Scroll
const searchBox = document.getElementById("searchBox");

searchBox.addEventListener("input", () => {
  const query = searchBox.value.toLowerCase();
  const cards = document.querySelectorAll("#videosList div");

  cards.forEach(card => {
    const title = card.querySelector("strong").textContent.toLowerCase();
    card.style.display = title.includes(query) ? "block" : "none";
  });

  if(query.trim() !== "") {
    // Scroll to "All Videos" when typing
    allVideosSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    // Scroll back to top when search cleared
    adminContent.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});