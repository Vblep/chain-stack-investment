// Firebase init
const firebaseConfig = { /* your config */ };
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Protect pages: force login & force complete profile
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    const lastActive = localStorage.getItem('lastActive');
    if (lastActive && Date.now() - lastActive > 5*60*1000) {
      auth.signOut();
      alert("Session expired, please login again.");
      window.location.href='login.html';
    } else {
      localStorage.setItem('lastActive', Date.now());
    }

    // Check profile
    db.collection('users').doc(user.uid).get().then(doc=>{
      if (!doc.exists || !doc.data().displayName) {
        window.location.href='profile.html';
      }
    });

    // Show admin dashboard button only if admin
    if (user.email === 'ebuvick0@gmail.com') {
      const adminBtn = document.createElement('li');
      adminBtn.innerHTML = '<a href="admin-dashboard.html">Admin Dashboard</a>';
      document.getElementById('menu')?.appendChild(adminBtn);
    }
  }
});

// Save settings
function saveSettings() {
  const lang = document.getElementById('languageSelect').value;
  const method = document.getElementById('withdrawMethod').value;
  const displayName = document.getElementById('displayName').value;
  const phone = document.getElementById('phoneNumber').value;
  const newPass = document.getElementById('newPassword').value;

  auth.onAuthStateChanged(user=>{
    if (user) {
      db.collection('users').doc(user.uid).update({language:lang, withdrawMethod:method, displayName, phone})
      .then(()=>alert("Settings saved!"));

      if(newPass) user.updatePassword(newPass).then(()=>alert("Password changed!"));
    }
  });
}
