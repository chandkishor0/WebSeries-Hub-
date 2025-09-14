// ---------------------------
// Firebase Config
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
// Admin Auth Check
// ---------------------------
auth.onAuthStateChanged(user => {
  if(!user || user.email !== "chandkishor@gmail.com"){
    window.location.href = "index.html";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut().then(()=> window.location.href = "index.html");
});

// ---------------------------
// Form Elements
// ---------------------------
const videoForm = document.getElementById("videoForm");
const docIdInput = document.getElementById("docId");
const titleInput = document.getElementById("videoTitle");
const posterInput = document.getElementById("videoPoster");
const linkInput = document.getElementById("videoLink");
const categoryInput = document.getElementById("videoCategory");
const trendingInput = document.getElementById("videoTrending");
const videosList = document.getElementById("videosList");

// ---------------------------
// Add / Update Video
// ---------------------------
videoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    title: titleInput.value,
    poster: posterInput.value,
    video: linkInput.value,
    category: categoryInput.value,
    trending: trendingInput.checked
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

// ---------------------------
// Reset Form
// ---------------------------
function resetForm(){
  docIdInput.value = "";
  titleInput.value = "";
  posterInput.value = "";
  linkInput.value = "";
  categoryInput.value = "movies";
  trendingInput.checked = false;
}

// ---------------------------
// Load All Videos
// ---------------------------
function loadVideos(){
  videosList.innerHTML = "";
  db.collection("videos").orderBy("title").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.style.border = "1px solid #e50914";
      div.style.padding = "10px";
      div.style.margin = "10px 0";
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

// ---------------------------
// Edit Video
// ---------------------------
window.editVideo = (id) => {
  db.collection("videos").doc(id).get().then(doc => {
    const data = doc.data();
    docIdInput.value = id;
    titleInput.value = data.title;
    posterInput.value = data.poster;
    linkInput.value = data.video;
    categoryInput.value = data.category;
    trendingInput.checked = data.trending;
  });
}

// ---------------------------
// Delete Video
// ---------------------------
window.deleteVideo = (id) => {
  if(confirm("Are you sure you want to delete this video?")){
    db.collection("videos").doc(id).delete().then(loadVideos);
  }
}

// ---------------------------
// Toggle Trending
// ---------------------------
window.toggleTrending = (id, value) => {
  db.collection("videos").doc(id).update({ trending: value });
}