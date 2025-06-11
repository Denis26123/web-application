
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import { getDatabase, ref, push, set, get, onValue } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";

/* -----------------------------------------------------------
 *   Firebase INITIALISATION
 * --------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyBdfBlNOkb3z7o1ERMUHWWHiqsLrJVvVMg",
  authDomain: "training-c1919.firebaseapp.com",
  databaseURL:
    "https://training-c1919-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "training-c1919",
  storageBucket: "training-c1919.appspot.com",
  messagingSenderId: "537168879516",
  appId: "1:537168879516:web:8639e7968434e7a5d8f259",
  measurementId: "G-2X8WX08W7W",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
getAnalytics(app);

// expose globals for inline onclick handlers
window.auth = auth;
window.database = database;
window.logout = () => signOut(auth).then(() => (location.href = "login.html"));

/* -----------------------------------------------------------
 *  UTILITIES
 * --------------------------------------------------------- */
const $id = (id) => document.getElementById(id);

/* -----------------------------------------------------------
 *  AUTH LISTENER
 * --------------------------------------------------------- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // redirect to login if signed out
    location.href = "login.html";
    return;
  }

  // show main UI
  $id("main-app").style.display = "block";
  // load history and build charts
  loadUserHistory();
});

/* -----------------------------------------------------------
 *  PROFILE
 * --------------------------------------------------------- */
window.saveProfile = function saveProfile() {
  const user = auth.currentUser;
  if (!user) return;

  const data = {
    username: $id("username").value.trim(),
    age: +$id("age").value,
    height: +$id("height").value,
    weight: +$id("weight").value,
    goal: $id("goal").value,
    timestamp: new Date().toISOString(),
    
    
  };

  // basic validation
  if (!data.username || !data.age || !data.height || !data.weight) {
    alert("Please fill all profile fields!");
    return;
  }

  set(ref(database, `users/${user.uid}/profile`), data)
    .then(() => {
      alert("Profile saved!");
      loadUserHistory();
      // update UI
      ["username", "age", "height", "weight", "goal"].forEach((k) => {
        $id(`res-${k}`).textContent = data[k];
      });
      document.querySelector(".profile-result").style.display = "block";
    })
    .catch((e) => console.error("Profile save error:", e));
};

/* -----------------------------------------------------------
 *  SCHEDULE  (simple rotation logic)
 * --------------------------------------------------------- */
const MUSCLES = ["Chest", "Back", "Legs", "Shoulder", "Biceps", "Triceps", "Abs"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

window.makeSchedule = function makeSchedule() {
  const user = auth.currentUser;
  if (!user) return;

  // collect checked muscles
  const selected = MUSCLES.filter((m) => $id(m).checked);
  if (!selected.length) {
    alert("Select at least one muscle group!");
    return;
  }

  // build schedule rotating selected muscles, rest on remaining days
  const firstDay = $id("firstday").value;
  const startIdx = DAYS.indexOf(firstDay);
  const schedule = {};
  // --- новый цикл формирует расписание ---
let musIndex = 0;                                // счётчик выбранных мышц
for (let i = 0; i < 7; i++) {
  const dayName = DAYS[(startIdx + i) % 7];

  if (musIndex < selected.length) {              // пока есть мышцы — ставим их
    schedule[dayName] = selected[musIndex];
    musIndex++;
  } else {                                       // остальные дни – Rest
    schedule[dayName] = "Rest";
  }

  $id(dayName).textContent = " " + schedule[dayName];
}


  document.querySelector(".js--schedule-result").style.display = "block";

  // push to DB
  push(ref(database, `users/${user.uid}/schedules`), {
    schedule,
    timestamp: new Date().toISOString(),
  });
};

/* -----------------------------------------------------------
 *  CALORIES
 * --------------------------------------------------------- */
const foodLog = [];

function pushFoodToDB(name, calories, protein) {
  const user = auth.currentUser;
  if (!user) return;
  push(ref(database, `users/${user.uid}/foods`), {
    name,
    calories,
    protein,
    timestamp: new Date().toISOString(),
  });
}

window.addFood = function addFood(e) {
  e.preventDefault();
  const name = $id("food-name").value.trim();
  const calories = +$id("food-calories").value || 0;
  const protein = +$id("food-protein").value || 0;

  if (!name) {
    alert("Enter food name!");
    return;
  }

  foodLog.push({ name, calories, protein });
  pushFoodToDB(name, calories, protein);

  document.querySelector(".food-note span").innerHTML += `${name} – ${calories} cals, ${protein} g protein<br>`;
  ["food-name", "food-calories", "food-protein"].forEach((id) => ($id(id).value = ""));
};

window.clearFood = () => {
  foodLog.length = 0;
  document.querySelector(".food-note span").innerHTML = "";
  document.querySelector(".cal-cal").style.display = "none";
};

window.calCal = () => {
  const totalCals = foodLog.reduce((t, f) => t + f.calories, 0);
  const totalProt = foodLog.reduce((t, f) => t + f.protein, 0);
  $id("all-calories").textContent = totalCals;
  $id("all-protein").textContent = totalProt;
  document.querySelector(".cal-cal").style.display = "block";
};

document.querySelector(".cal-form").addEventListener("submit", window.addFood);

/* -----------------------------------------------------------
 *  PROGRESS
 * --------------------------------------------------------- */
window.saveProgress = function saveProgress() {
  const user = auth.currentUser;
  if (!user) return;
  const date = $id("progress-date").value;
  const weight = +$id("progress-weight").value;

  if (!date || !weight) {
    alert("Enter date and weight!");
    return;
  }

  push(ref(database, `users/${user.uid}/progress`), { date, weight });
  $id("progress-date").value = "";
  $id("progress-weight").value = "";
};

$id("progress-form").addEventListener("submit", (e) => {
  e.preventDefault();
  window.saveProgress();
});

/* -----------------------------------------------------------
 *  HISTORY + CHART
 * --------------------------------------------------------- */
function renderProgressChart(uid) {
  onValue(ref(database, `users/${uid}/progress`), (snap) => {
    const arr = [];
    snap.forEach((c) => arr.push(c.val()));
    arr.sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = arr.map((i) => i.date);
    const weights = arr.map((i) => i.weight);

    if (window.progressChart) window.progressChart.destroy();

    const ctx = document.getElementById("progressChart").getContext("2d");
    window.progressChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Weight (kg)",
            data: weights,
            fill: false,
            tension: 0.1,
          },
        ],
      },
    });
  });
}

function loadUserHistory() {
  const user = auth.currentUser;
  if (!user) return;
  const uid = user.uid;

  // Profile ─ выводим локальную дату-время
get(ref(database, `users/${uid}/profile`)).then((snap) => {
  if (snap.exists()) {
    const d  = snap.val();
    const tb = document.querySelector("#profile-history tbody");
    tb.innerHTML = `<tr>
      <td>${new Date(d.timestamp).toLocaleString()}</td>
      <td>${d.username}</td><td>${d.age}</td><td>${d.height}</td>
      <td>${d.weight}</td><td>${d.goal}</td>
    </tr>`;
  }
});

// Foods ─ каждая строка с локальной датой-временем
onValue(ref(database, `users/${uid}/foods`), (snap) => {
  const tb = document.querySelector("#food-history tbody");
  tb.innerHTML = "";
  snap.forEach((c) => {
    const f  = c.val();
    const ts = new Date(f.timestamp).toLocaleString();
    tb.innerHTML += `<tr>
      <td>${ts}</td><td>${f.name}</td>
      <td>${f.calories}</td><td>${f.protein}</td>
    </tr>`;
  });
});

// Schedules ─ первая ячейка с форматированной датой
onValue(ref(database, `users/${uid}/schedules`), (snap) => {
  const tb = document.querySelector("#schedule-history tbody");
  tb.innerHTML = "";
  snap.forEach((c) => {
    const s  = c.val();
    const ts = new Date(s.timestamp).toLocaleString();
    const row = `<tr><td>${ts}</td>` +
      DAYS.map((d) => `<td>${s.schedule[d] ?? ""}</td>`).join("") +
      "</tr>";
    tb.innerHTML += row;
  });
});


  // Progress chart
  renderProgressChart(uid);
}
function wipe(path){
  const u=auth.currentUser; if(!u) return;
  set(ref(database,`users/${u.uid}/${path}`),null);
}
window.clearProfileHistory = ()=>{wipe("profile"  ); document.querySelector("#profile-history tbody").innerHTML="";};
window.clearFoodHistory    = ()=>{wipe("foods"    ); document.querySelector("#food-history tbody").innerHTML="";};
window.clearScheduleHistory= ()=>{wipe("schedules"); document.querySelector("#schedule-history tbody").innerHTML="";};

// export for debugging
window.loadUserHistory = loadUserHistory;