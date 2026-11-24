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

