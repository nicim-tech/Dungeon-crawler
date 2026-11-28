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

//--game state--
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

