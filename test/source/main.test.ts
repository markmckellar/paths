import { World } from "../../../source/walkers/walkerworld/world";
import { WorldUpdate } from "../../../source/walkers/walkerworld/worldupdate";

import { MatterWalkerEngine } from "../../../source/walkers/matterengine/matterwalkerengine";
import * as Matter from "matter-js";
// import * as $ from "jquery";
// import Greeter from "./entities/greeter";
// let merge = require("merge2");
// npm install --save @types/matter-js
// import Matter from "@types/matter-js";
// import * as jsdom from "jsdom";
// import { jsdom } from "jsdom";
// const document = jsdom("");

// let canvas = document.getElementById("world");
let matterEngine = new MatterWalkerEngine();
let world = new World(matterEngine);
let engine = matterEngine.engine;

// create a renderer
let render = Matter.Render.create({
  element: document.body,
  engine: engine,
  options : {
    hasBounds:false,
    height:600,
    width:800,
    wireframes:true,
  },
});

world.walkerEngine.createBounds(render.canvas.width,render.canvas.height);
matterEngine.initMouse(render);

// run the engine
Matter.Engine.run(engine);
Matter.Render.run(render);

/*
let j1 = new Junction("1");
let j2 = new Junction("2");
let p1to2 = new Path("1to2",j1,j2);

world.addJunction(j1);
world.addJunction(j2);
world.addPath(p1to2);
*/
let worldUpdate1:WorldUpdate = new WorldUpdate("junction1","walker",new Date(),{},{},{});
let worldUpdate2:WorldUpdate = new WorldUpdate("junction2","walker",new Date(),{},{},{});
let worldUpdate3:WorldUpdate = new WorldUpdate("junction3","walker",new Date(),{},{},{});
let worldUpdate4:WorldUpdate = new WorldUpdate("junction4","walker",new Date(),{},{},{});
let worldUpdate5:WorldUpdate = new WorldUpdate("junction5","walker",new Date(),{},{},{});


world.addWorldUpdate(worldUpdate1);
world.addWorldUpdate(worldUpdate2);
world.addWorldUpdate(worldUpdate3);
world.addWorldUpdate(worldUpdate4);
world.addWorldUpdate(worldUpdate5);


world.processWorldUpdates();

//Observable.interval(10000).takeWhile(() => true).subscribe(() => this.function());

//setInterval(() => {
//  this.callFuntionAtIntervals();
//}, 1000);

console.log("xx main:world.junctions.keys.length="+world.junctions.size);