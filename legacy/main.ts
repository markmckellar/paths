import { World } from "./walkers/walkerworld/world";
import { MatterWalkerEngine } from "./walkers/matterengine/matterwalkerengine";
import * as Matter from "matter-js";
import { WorldUpdate } from "./walkers/walkerworld/worldupdate";
//import decomp from 'poly-decomp';

//window.decomp = decomp;
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
    wireframes:false,
  },
});

world.walkerEngine.createBounds(render.canvas.width,render.canvas.height);
matterEngine.initMouse(render);

// run the engine
Matter.Engine.run(engine);
Matter.Render.run(render);


//let body:Matter.Body = Matter.Bodies.circle(350,350,40,{},8);     
//console.log("main:body="+body.parts.length); 
//let body2:Matter.Body = matterEngine.createBoundObject(body,1,1.05);

//Matter.World.add(engine.world,[body2]);


/*
let worldUpdate1:WorldUpdate = new WorldUpdate("junction1","walker",WorldUpdate.datePlus(1*1000),{},{},{});
let worldUpdate2:WorldUpdate = new WorldUpdate("junction2","walker",WorldUpdate.datePlus(2*1000),{},{},{});
let worldUpdate3:WorldUpdate = new WorldUpdate("junction3","walker",WorldUpdate.datePlus(3*1000),{},{},{});
let worldUpdate4:WorldUpdate = new WorldUpdate("junction4","walker",WorldUpdate.datePlus(4*1000),{},{},{});
let worldUpdate5:WorldUpdate = new WorldUpdate("junction5","walker",WorldUpdate.datePlus(5*1000),{},{},{});
let worldUpdate6:WorldUpdate = new WorldUpdate("junction6","walker",WorldUpdate.datePlus(6*1000),{},{},{});


let worldUpdate3b:WorldUpdate = new WorldUpdate("junction3","walker2",WorldUpdate.datePlus(16*1000),{},{},{});
let worldUpdate4b:WorldUpdate = new WorldUpdate("junction4b","walker2",WorldUpdate.datePlus(17*1000),{},{},{});
let worldUpdate5b:WorldUpdate = new WorldUpdate("junction5b","walker2",WorldUpdate.datePlus(18*1000),{},{},{});
let worldUpdate6b:WorldUpdate = new WorldUpdate("junction6b","walker2",WorldUpdate.datePlus(19*1000),{},{},{});
*/



let timer=1;
let timerInc = 0.2;
for(let t=0;t<10;t++)
{
  for(let i=0;i<22;i++,timer+=timerInc) {
    let worldUpdate1:WorldUpdate = new WorldUpdate("junction"+i,"walker1",WorldUpdate.datePlus(timer*1000),{},{},{});
    world.addWorldUpdate(worldUpdate1);
    let worldUpdate2:WorldUpdate = new WorldUpdate("junction"+(5-i),"walker2",WorldUpdate.datePlus(timer*1000),{},{},{});
    world.addWorldUpdate(worldUpdate2);
    
  }
/*

  for(let i=5;i>=0;i--,timer+=timerInc) {
    let worldUpdate1:WorldUpdate = new WorldUpdate("junction"+i,"walker1."+t,WorldUpdate.datePlus(timer*1000),{},{},{});
    world.addWorldUpdate(worldUpdate1);
    let worldUpdate2:WorldUpdate = new WorldUpdate("junction"+(5-i),"walker2."+t,WorldUpdate.datePlus(timer*1000),{},{},{});
    world.addWorldUpdate(worldUpdate2);
  }*/
}

/*
world.addWorldUpdate(worldUpdate1);
world.addWorldUpdate(worldUpdate2);
world.addWorldUpdate(worldUpdate3);
world.addWorldUpdate(worldUpdate4);
world.addWorldUpdate(worldUpdate5);
world.addWorldUpdate(worldUpdate6);

world.addWorldUpdate(worldUpdate3b);
world.addWorldUpdate(worldUpdate4b);
world.addWorldUpdate(worldUpdate5b);
world.addWorldUpdate(worldUpdate6b);
*/


let bbm:number = 240;
let bbs:number = bbm/60.0;
let interval:number = 1000/bbs; //one millisecond over beat per second
console.log("drawing every : "+interval+"ms");
setInterval(doDraw,interval);

function doDraw()
{
  //console.log(".");
	world.processWorldUpdates();
}


world.processWorldUpdates();
console.log("yy main:world.junctions.keys.length="+world.junctions.size);