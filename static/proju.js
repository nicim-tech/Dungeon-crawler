//--connecting to html--
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const bossHpBar = document.getElementById("boss-hp-bar");
const bossHpFill = document.getElementById("boss-hp-fill");
const playerHpFill = document.getElementById("hp-fill");
const playerHpText = document.getElementById("hp-text");
const inventoryP = document.getElementById("inventory");
const messageP = document.getElementById("message");

//--item definitions--
const ITEMS = {
    sword: {name: "Sword"},
    potion: {name: "potion", heal: 40},
    cupcake: {name: "cupcake", heal: 30}
};

//--rooms--
const ROOMS = {
    start: {
        name: "entrance",
        doors: [{x: 750, y: 210, w: 50, h: 80, to: "hall", spawn: {x:80, y:250
    
}}],
        chests: [],
        boss: null,
    },
    hall: {
        name: "Halls",
        doors: [
            {x: 0, y: 210, w: 50, h: 80, to: "start", spawn: {x: 700, y: 250}
        },
            {x: 750, y: 210, w: 50, h: 80, to: "boss1", spawn: {x: 80, y: 250}
        },
            ],
            chest: [
                {id: "hall_1", x: 380, y: 100, item: "sword"},
                {id: "hall_2", x: 380, y: 360, item: "potion"},
            ],
            boss: null,
    },
    boss1: {
        name: "Boss Room 1",
        doors: [],
        chest: [],

        boss: {id: "boss1", name: "Skeleton King", maxHp: 60, damage: 8, speed: 1.2},
    },
};

//--game state(gets saved!)--
function newState() {
    return {
        room: "start",
        player: {x: 100, y: 250, hp: 100, maxHp: 100},
        inventory: [],
        openedChests: [],
        bossesDefeted: [],

    };
}

let state = newState();
let boss = null;
let hitCooldown = 0;
const keys = {};

//--keyboard input--
window.addEventListener("keydown", e => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", ""].includes(e.key)) e.preventDefault();

    keys[e.key] = true;

    if (e.key === "e") interact();
    if (e.key === " ") attack();
    if (e.key === "1") useItem("potion");
    if (e.key === "2") useItem("cupcake");
    if (e.key === "k") saveGame();
})
window.addEventListener("keyup", e => {keys[e.key] = false; });

//--helpers--
function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
const hitbox = () => ({x: state.player.x, y: state.player.y, w:30, h:30 });

function ROOMenter(id, spawn) {
    state.room = id;
    if (spawn) {state.player.x = spawn.x; state.player.y = spawn.y; }
    const def = ROOMS[id].boss;
    boss = def && !state.bossesDefeated.includes(def.id)
    ? {...def, hp: def.maxHp , x:600, y:230, w:50, h:50 } 
    : null;
}

//--actions--
function interact() {
  const room = ROOMS[state.room];
  const me = { x: state.player.x - 20, y: state.player.y - 20, w: 70, h: 70 }; 

  for (const c of room.chests) {
    if (!state.openedChests.includes(c.id) && overlap(me, { x: c.x, y: c.y, w: 40, h: 30 })) {
      state.openedChests.push(c.id);
      state.inventory.push(c.item);
      message = "You found a " + ITEMS[c.item].name + "!";
    }
  }
}
function attack() {
  if (!boss) return;
  const reach = { x: state.player.x - 25, y: state.player.y - 25, w: 80, h: 80 };
  if (overlap(reach, boss)) {
    boss.hp -= state.inventory.includes("sword") ? 12 : 3;
    if (boss.hp <= 0) {
      state.bossesDefeated.push(boss.id);
      message = boss.name + " defeated! Game saved.";
      boss = null;
      saveGame(); 
    }
  }
}
function useItem(name) {
  const i = state.inventory.indexOf(name);
  if (i === -1) return;
  state.inventory.splice(i, 1);
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + ITEMS[name].heal);
}

async function die() {
  message = "You died... loading last save.";
  await loadGame(); // anything collected since your last save is lost
}
// --update--
function update() {
  const p = state.player, speed = 3.5;
  if (keys["ArrowLeft"]  || keys["a"]) p.x -= speed;
  if (keys["ArrowRight"] || keys["d"]) p.x += speed;
  if (keys["ArrowUp"]    || keys["w"]) p.y -= speed;
  if (keys["ArrowDown"]  || keys["ArrowDown"] && false) p.y += speed;
  p.x = Math.max(0, Math.min(canvas.width - 30, p.x));
  p.y = Math.max(0, Math.min(canvas.height - 30, p.y));

  // doors
  for (const d of ROOMS[state.room].doors) {
    if (overlap(hitbox(), d)) { enterRoom(d.to, d.spawn); break; }
  }

  // boss chases you and hurts you
  if (boss) {
    boss.x += Math.sign(p.x - boss.x) * boss.speed;
    boss.y += Math.sign(p.y - boss.y) * boss.speed;
    if (hitCooldown > 0) hitCooldown--;
    if (overlap(hitbox(), boss) && hitCooldown === 0) {
      p.hp -= boss.damage;
      hitCooldown = 45; // ~0.75 sec of invincibility
      if (p.hp <= 0) die();
    }
  }
}

//--draw
// ---------- DRAW ----------
function draw() {
  const room = ROOMS[state.room];
  ctx.fillStyle = "#1a1a1f"; ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "saddlebrown";
  room.doors.forEach(d => ctx.fillRect(d.x, d.y, d.w, d.h));

  room.chests.forEach(c => {
    ctx.fillStyle = state.openedChests.includes(c.id) ? "#444" : "gold";
    ctx.fillRect(c.x, c.y, 40, 30);
  });

  ctx.fillStyle = "royalblue";
  ctx.fillRect(state.player.x, state.player.y, 30, 30);

  if (boss) {
    ctx.fillStyle = "crimson"; ctx.fillRect(boss.x, boss.y, boss.w, boss.h);
    ctx.fillStyle = "#400"; ctx.fillRect(250, 15, 300, 12);
    ctx.fillStyle = "red";  ctx.fillRect(250, 15, 300 * boss.hp / boss.maxHp, 12);
  }

  drawHUD(room);
}

function drawHUD(room) {
  const p = state.player;
  // HP bar
  ctx.fillStyle = "#400"; ctx.fillRect(15, 15, 200, 18);
  ctx.fillStyle = "limegreen"; ctx.fillRect(15, 15, 200 * p.hp / p.maxHp, 18);
  ctx.fillStyle = "white"; ctx.font = "14px sans-serif";
  ctx.fillText(`HP ${p.hp}/${p.maxHp}`, 20, 29);
  ctx.fillText(room.name, 15, 55);

  // inventory slots along the bottom
  ctx.fillText("Inventory (1 = potion, 2 = cupcake):", 15, canvas.height - 50);
  state.inventory.forEach((name, i) => {
    ctx.fillStyle = ITEMS[name].color;
    ctx.fillRect(15 + i * 50, canvas.height - 40, 40, 30);
  });

  ctx.fillStyle = "yellow";
  ctx.fillText(message, 300, canvas.height - 15);
}

//--start screen--
async function api(url, method = "POST", body = null) {
    const options = { method };
    if (body) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(body);      // turn the object into text
    }
    const res = await fetch(url, options);
    if (!res.ok) throw new Error("Server error " + res.status);
    return res.json();
}


const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");
const startBtn = document.getElementById("start-btn");
const loadBtn = document.getElementById("load-btn");
const restartBtn = document.getElementById("restart-btn");
const startMsg = document.getElementById("start-msg");

function showScreen(screen) {
    for (const s of [startScreen, gameScreen, endScreen]) s.hidden = true;
    screen.hidden = false;
}
function showGame(state) {
    showScreen(gameScreen);
}
function showGame(data) {
    gameState = data;
    if (data.status === "playing") {
        showScreen(gameScreen);
         enterRoom(state.room);
    } else {
        showScreen(endScreen);
    }
}
async function saveGame() {
    try {
        await api("/api/save", "POST", state);
        messageP.textContent = "Game saved!";
    } catch (err) {
        messageP.textContent = "Save failed: " + err.message;
    }
}
saveBtn.onclick = saveGame;

//--buttons--
startBtn.onclick = async () => {
    try { showGame(await api("/api/reset", "POST")); }
    catch (err) { startMsg.textContent = "Could not start: " + err.message; }
};
loadBtn.onclick = async () => {
    try { showGame(await api("/api/state", "GET")); }
    catch (err) { startMsg.textContent = "Could not load: " + err.message; }
};
restartBtn.onclick = async () => {
    try { showGame (await api("/api/reset", "POST")); }
    catch (err) { console.error(err); }
}
(async () => {
    try {
        const { exists } = await api("/api/has_save", "GET");
        loadBtn.disabled = !exists;    
    } catch (err) { console.error(err); }
})();

const saveBtn = document.getElementById("save-btn");
saveBtn.onclick = async () => {
    try {
        await api("/api/save", "POST", gameState);
        messageP.textContent = "Game saved!";
    } catch (err) {
        messageP.textContent = "Save failed: " + err.message;
    }
};

//--quit button--
const quitBtn = document.getElementById("quit-btn");
console.log("quitBtn is:", quitBtn);

quitBtn.onclick = async () => {
    console.log("quit clicked");
    showScreen(startScreen);
    startMsg.textContent = "";
    try {
        const { exists } = await api("/api/has_save", "GET");
        loadBtn.disabled = !exists;
    } catch (err) { console.error(err); }
};

//--background--

const IMG = {};
function loadImg(name, file) {
    const img = new Image();
    img.src = "/static/images/" + file;
    IMG[name] = img;
}
loadImg("hall", "peli.1.png");
loadImg("door", "peli.2.png");


function newDoorDistance() {
    return 5 + Math.floor(Math.random() * 6);   
}

function doorHere() {
    return state.steps >= state.doorAt;
}

function walkForward() {
    if (doorHere()) return;         
    state.steps++;
}

function openDoor() {
    if (!doorHere()) return;
    state.steps = 0;
    state.doorAt = newDoorDistance();
    messageP.textContent = "You went through the door!";
    
}
function draw() {
    const img = doorHere() ? IMG.door : IMG.hall;
    if (img.complete) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function update() {}   // nothing needed yet

function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();

//--doors--

window.addEventListener("keydown", e => {
    if (e.repeat) return;
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();

    if (k === "arrowup" || k === "w") walkForward();
    if (k === "e") openDoor();
    if (k === "k") saveGame();
});
//--save/load(talk to flask)---
async function saveGame() {
  try {
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    message = "Game saved!";
  } catch { message = "Save failed."; }
}

async function loadGame() {
  try {
    const res = await fetch("/api/load");
    const data = await res.json();
    state = data.state || newState();
  } catch { state = newState(); }
  enterRoom(state.room, null);
}


// ---------- LOOP ----------
function loop() { update(); draw(); requestAnimationFrame(loop); }
loadGame().then(loop);
