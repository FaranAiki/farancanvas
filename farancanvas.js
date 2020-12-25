/*
	(C) Copyright 2020-2021 Muhammad Faran Aiki
	
	Free to use `FaranCanvas`.
	One module, can be combined with other modules.
	
	This is the main Javascript code of `FaranCanvas`.
	Used for `faranjs` module.
	
	Algorithm can be applied to pygame or other things.
	
	However, `FaranCanvas` does not implement object using a component.
	So there is no component called `Rigidbody` or `Animation`, but instead just a function that call(s) it repeatedly.
	
	Consistency
		1. Interpret `keyboard`, `rigidbody` as one word.
		2. For every class and function in `FaranCanvas` uses Capital for each word, for example...
			Range
			KeyboardOnDown <-- Keyboard is one word
			Update
		3. For every variable or constant in `FaranCanvas` uses Lowercase only for the first word, for example...
			Sprite().rigidbody
			RawImage().toScreenFormat()
			Array().repeat()
	
	Version 0.01, In development.
	
	Note that these things are not fixed:
		1. Z and Size Vector3 for Camera logic (do not use Z and Size of the camera).
		2. Frame per Second for 60+ is not supported yet.
		3. No animate or animation position for an object.
		3. Canvas per pixel is not fixed
*/

// External types
var standardImport	= ["module", "modules", "scene", "scenes", "script", "scripts"];

// Define shortcut
let getl	= (id) => document.getElementById(id);
let elem	= (type) => document.createElement(type.toUpperCase());

// Define variable
var fps		= 60;

// Set canvas property
var canvas	= elem("CANVAS");
var ctx		= canvas.getContext("2d");

canvas.drawType		= "normal";
canvas.backcolor	= "#9090FF";

canvas.relative			= false;
canvas.fullScreen		= false;

canvas.width			= 500;
canvas.height			= 500;

canvas.style.position	= "absolute";
canvas.style.left		= "0px";
canvas.style.top		= "0px";

/*
	Set some prototype
	
	Contains:
		Array:
			.reversed()
			.repeat(times=0)
			.toVector3()
		Number:
			.min0()
		String
			.format(variable, end, start)
*/

Array.prototype.reversed = function () {
	return this.map((item, index) => this[this.length-1-index]);
};

Array.prototype.repeat = function (times = 0) {
	if (times <= 0) {
		return this.concat(this.reversed().slice(1, this.length));
	} else {
		let lst = [...this];
		for (i = 0; i < times; i++) lst.push(...this) ;
		return lst;
	}
};

Array.prototype.toVector3 = function() {
	vector = new Vector3(); axis = ["x", "y", "z"];
	for (let index of this) {
		vector[axis[index]] = this[index];
	}
	return vector;
};

Array.prototype.remove = function(value) {
	return this.filter(key => key != value);
};

Number.prototype.min0 = function () {
	return (this > 0) ? this : 0;
};

String.prototype.format = function (variable="var", end = 1, start = 0) {
	arr = [];
	for (i = start; i < end; i++) {
		arr.push(this.toString().replace(`{${variable}}`, i));
	}
	return arr;
};

// define some function
function Range(range) {
	return [...Array(range).keys()]
}

// vector class
class Vector3 {
	constructor (x=0, y=0, z=0) {
		this.x	= x;
		this.y	= y;
		this.z	= z;
	}
	
	// function
	isEqual(vector=this) {
		let d = 0;
		for (let axis in vector) {
			d += this[axis] == vector[axis];
		}
		return d >= 3;
	}
	
	// operator
	plus(vector=this) {
		let vect = new Vector3(0, 0, 0);
		for (let axis in vector) {
			vect[axis] = this[axis] + vector[axis];
		}
		return vect;
	}
	
	// to format
	toPerPixel() {
		return new Vector3(this.x*canvas.perPixel.x, this.y*canvas.perPixel.y, this.z*canvas.perPixel.z);
	}
	
	// this is to screen format algorithm, eh it's hard to explain :)
	toScreenFormat(size=new Vector3(0, 0, 0), isGUI=false) {
		let t = this.toPerPixel();
		let s = size.toPerPixel();
		
		switch (canvas.drawType) {
			case "centered": case "center":
				return new Vector3(t.x+s.x, canvas.height-t.y-s.y-t.y/2, t.z);
			case "javascript": case "canvas":
				return new Vector3(t.x, t.y, t.x);
			case "normal": case "standard":
				return new Vector3(t.x, canvas.height-t.y-s.y);
		}
	}
}

// define camera
Camera = {
	position:	new Vector3(0, 0, 0),
	rotation:	new Vector3(0, 0, 0),
	size:		1
};

// Define scene class
class Scene {
	constructor (name="scene1", load = function() {}, loop = function() {}) {		
		// name
		this.name		= name;
		
		// function
		this.onLoad		= load;
		
		// interval and event listener
		this.interval		= [];
		this.myInterval		= [];
		this.eventListener	= {};
		
		// listing
		this.audioList			= [];
		this.rawImageList		= [];
		this.spriteList			= [];
		this.squareList			= [];
		this.textList			= [];
		
		// push to sceneIndex
		sceneIndex.push(this);
		
		this.index	= sceneIndex.indexOf(this);
	}
	
	loadScene() {
		LoadScene(this.name);
	}
}

// Audio thing
class Audio extends window.Audio {
	constructor(src='', volume=1, type="audio") {
		super();
		
		// set source
		this.src	= src;
		this.volume	= volume;
		
		// define tag
		this.type	= type;
		
		// add to currentScene
		currentScene.audioList.push(this);
	}
}

AudioMaster = {
	volume: 1,
	type: {'audio': 1},
	
	check: function() {
		currentScene.audioList.forEach(function(audio) {
			audio.volume += AudioMaster.volume - 1;
			for (let master in AudioMaster.type) {
				if (audio.type == master) {
					audio.volume = AudioMaster.type[master];
				}
			}
		});
	}
}

// Define the basic of canvas.drawing
class RawImage { // usage `new Sprite("player0.png", 1, 1, 1, 1)`
	constructor (x=0, y=0, w=50, h=50, rotZ=0, flipX=0, flipY=0) {		
		// tag and classes
		this.tag		= 'none';
		this.classes	= [];
		
		// property abscence
		this.hidden		= false;
		this.active		= true;
		
		// interval
		this.interval	= []
		
		// vector
		this.position	= new Vector3(x, y, 0);
		this.size		= new Vector3(w, h, 0);
		this.flip		= new Vector3(flipX, flipY, 0);
		this.rotation	= new Vector3(0, 0, rotZ);
		
		// collider
		this.collideWithTag		= {};
		this.collideWithClass	= {};
		this.collideWith		= this.collideWithTag;
		
		// collision detection
		this.collisionStart		= new Vector3(0, 0, 0);
		this.collisionEnd		= this.size;
		
		// rigidbody
		this.rigidbody		= false;
		this.velocity		= new Vector3(0, 0, 0);
		this.acceleration	= new Vector3(0, 0, 0);
		
		// if sprite is a GUI sprite
		this.isGUI			= false;
		
		// if stroke
		this.stroke	= false;
		
		// boolean
		this.rotationAtCenter	= false ;
		
		// set interval
		this.interval.push(window.setInterval(() => RigidbodyController(this), 1000/fps));
	
		// push to list
		currentScene.rawImageList.push(this);
	}
	
	// define function for Sprite
	
	pushNoInterrupt(dis = new Vector3(0, 0, 0), time = 1) {
		let des = undefined;
		this.velocity.isEqual(new Vector3(0, 0, 0)) && (des = this.position.plus(dis));
		if (this.velocity.isEqual(new Vector3(0, 0, 0))) {
			this.push(dis, time);
		}
		setTimeout(() => this.velocity.isEqual(new Vector3(0, 0, 0))? des === undefined ? false : this.position = des : false, time*1000);
	}
	
	push(dis = new Vector3(0, 0, 0), time = 1) {
		for (let axis in dis) {
			this.velocity[axis] = dis[axis]/time;
			setTimeout(() => this.velocity[axis] = 0, time*1000);
		}
	}
	
	setVisibility(bool) {
		this.hidden = bool;
	}
	
	setActive(bool) {
		this.active	= bool;
	}
	
	toScreenFormat() {
		return this.position.toScreenFormat(this.size, this.isGUI);
	}
	
	setOnClick(fn) {
		RemoveEventListener("click", this.onClick);
		this.onClick	= fn;
		this.addEventClick();
	}
	
	addEventClick() {
		AddEventListener("click", (event) => {
			let clickVector = new Vector3(event.clientX/canvas.perPixel.x, event.clientY/canvas.perPixel.y, 0).toScreenFormat();
			if (
				clickVector.x > this.position.toPerPixel().x && clickVector.x < this.position.toPerPixel().x + this.size.toPerPixel().x &&
				clickVector.y > this.position.toPerPixel().y && clickVector.y < this.position.toPerPixel().y + this.size.toPerPixel().y
			) this.onClick();
		});
	}
}

// Extended class from RawImage
class Sprite extends RawImage {
	constructor(image="", x=0, y=0, w=50, h=50, rotZ=0, flipX=0, flipY=0) {
		// super
		super(x, y, w, h, rotZ, flipX, flipY);
		
		// image
		this.image		= new window.Image();
		this.image.src	= image;
		
		// animation
		this.animationOn 		= {};
		this.animationSpeed		= 12;
		this.animationFrame		= 0;
		
		// interval
		this.interval.push(window.setInterval(() => AnimationController(this), 1000/this.animationSpeed));
		this.interval.push(window.setInterval(() => SpriteCollisionDetector(this), 1000/fps));
		
		// button
		this.onClick	= () => 0;
		
		// push to list
		currentScene.spriteList.push(this);
	}
}

class Square extends RawImage {
	constructor(x=0, y=0, w=50, h=50, rotZ=0, flipX=0, flipY=0) {
		super(x, y, w, h, rotZ, flipX, flipY);
		
		// define function
		this.onClick	= () => 0;
		this.color		= "#e6e6e6";
		
		// push to list
		currentScene.squareList.push(this);
	}
	
	setOnClick(fn) {
		RemoveEventListener("click", this.onClick);
		this.onClick	= fn;
		this.addEventClick();
	}
	
	addEventClick() {
		AddEventListener("click", (event) => {
			let clickVector = new Vector3(event.clientX/canvas.perPixel.x, event.clientY/canvas.perPixel.y, 0).toScreenFormat();
			if (
				clickVector.x > this.position.toPerPixel().x && clickVector.x < this.position.toPerPixel().x + this.size.toPerPixel().x &&
				clickVector.y > this.position.toPerPixel().y && clickVector.y < this.position.toPerPixel().y + this.size.toPerPixel().y
			) this.onClick();
		});
	}
}

class Text extends RawImage {
	constructor (text="", x=0, y=0, font="15px Courier", color="#000000", rotZ=0, flipX=0, flipY=0) {
		super(x, y, 0, 0, rotZ, flipX, flipY);
		
		// text property
		this.text	= text;
		this.color	= color;
		this.font	= font;
		
		// push to list
		currentScene.textList.push(this);
	}
}

// Controller, need `window.setInterval`
function RigidbodyController(rigid) {
	for (let axis of ["x", "y", "z"]) {
		rigid.position[axis] += rigid.velocity[axis]/fps;	
		rigid.velocity[axis] += rigid.acceleration[axis]/fps;
	}
}

function AnimationController(sprite) {
	for (let key in sprite) {
		if (key && key in sprite.animationOn) {
			sprite.image.src	= sprite.animationOn[key][(sprite.animationFrame++) % sprite.animationOn[key].length];
		}
	}
}

function SpriteCollisionDetector(current) {
	for (let sprite of currentScene.spriteList) {
		if (sprite.tag in current.collideWithTag &&
			(current.position.x + current.collisionEnd.x >= sprite.position.x) && (current.position.x <= sprite.position.x + sprite.collisionEnd.x) &&
			(current.position.y + current.collisionEnd.y >= sprite.position.y) && (current.position.y <= sprite.position.y + sprite.collisionEnd.y) &&
			(current.position.z + current.collisionEnd.z >= sprite.position.z) && (current.position.z <= sprite.position.z + sprite.collisionEnd.z)
		) {
			try { current.collideWithTag[sprite.tag](sprite); } catch {}
		}
		if (false) {
			// do thing -> class
		}
	}
}

// Scene management
function LoadScene (id="") {
	if (currentScene != undefined) {
		currentScene.interval.forEach(function(interval) {
			window.clearInterval(interval);
		});
		
		currentScene.rawImageList.forEach(function(rawImage) {
			rawImage.interval.forEach(function(interval) {
				window.clearInterval(interval);
			});
		});
		
		for (event in currentScene.eventListener) {
			try { currentScene.eventListener[event].forEach(function(fn) {
				document.removeEventListener(event, fn);
			}); } catch {}
		}
		
		currentScene.audioList.forEach(function(audio) {
			audio.pause()
		});
		
		currentScene.audio				= [];
		currentScene.interval			= [];
		currentScene.spriteList			= [];
		currentScene.squareList			= [];
		currentScene.textList			= [];
	}
	
	if (typeof(id) == "string") {
		for (let scene of sceneIndex) {
			if (scene.name == id) currentScene = scene;
		}
	} else if (typeof(id) == "number") {
		currentScene = sceneIndex[id];
	} else if (typeof(id) == "object") {
		currentScene = id;
	}
	
	if (currentScene != undefined) currentScene.onLoad();
}

// Timer
function Timer(time) { // usage `window.time.second
	time.second += 1/fps;
}

// Event listener keyboard
function AddEventListener(type="", fn = () => 0) {
	try {
		currentScene.eventListener[type].push(fn);
	} catch {
		currentScene.eventListener[type] = [fn];
	}
	document.addEventListener(type, fn);
}

function RemoveEventListener(type="", fn = () => 0) {
	try {
		currentScene.eventListener[type].remove(fn);
		document.removeEventListener(type, fn);
	} catch {}
}

function KeyboardOnDown(fn) {
	AddEventListener("keydown", fn);
}

function KeyboardOnUp(fn) {
	AddEventListener("keyup", fn);
}

// Color management, usage: col = LinearGradient([[0.5, "#ffffff"]])
function LinearGradient(grads=[]) {
	let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
	for (let grad of grads) {
		gradient.addColorStop(grad[0].toString(), grad[1].toString());
	}
	return gradient;
}

// Define destroy
function Destroy(obj) {
	currentScene.spriteList	= currentScene.spriteList.remove(obj);
}

// Define start <-- actually not used, and update
function Start(fn) {
	fn();
}

function Update(fn) {
	currentScene.myInterval.push(window.setInterval(fn, 1000/fps));
}

// Clear update
function ClearInterval() {
	currentScene.myInterval.forEach(function(index) {
		window.clearInterval(index);
	});
}

// External management like import...
function SingleImport(src) {
	let script = elem("SCRIPT");
	
	for (let mods of [src].concat(standardImport)) {
		try {
			script.src = mods;
			document.body.appendChild(script);
			break;
		} catch {}
	}
	
	return script;
}

function Import(src) {
	if (typeof(src) == "string") SingleImport(src);
	if (Array.isArray(src)) {
		for (let source of src) {
			SingleImport(source);
		} 
	}
}

// Define canvas draw
canvas.draw	= function() {
	ctx.fillStyle = canvas.backcolor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	// sprite list
	for (sprite of currentScene.spriteList) {
		try { if(!sprite.hidden && sprite.active) {
			ctx.save();
			ctx.translate(sprite.toScreenFormat().x, sprite.toScreenFormat().y)
			ctx.rotate(sprite.rotation.z * Math.PI/180);
			ctx.drawImage(
				sprite.image, 
				0,
				0, 
				(sprite.size.x-Camera.position.z).min0()/Camera.size*canvas.perPixel.x, 
				(sprite.size.y-Camera.position.z).min0()/Camera.size*canvas.perPixel.y
			);
			ctx.restore();
		}} catch {}
	};
	
	// square list
	for (square of currentScene.squareList) {
		try { if (!square.hidden && square.active) {
			ctx.save();
			ctx.translate(square.toScreenFormat().x, square.toScreenFormat().y);
			ctx.rotate(square.rotation.z * Math.PI/180);
			ctx.fillStyle = square.color;
			if (!square.stroke) ctx.fillRect(
				0, 
				0, 
				(square.size.x-Camera.position.z).min0()/Camera.size*canvas.perPixel.x, 
				(square.size.y-Camera.position.z).min0()/Camera.size*canvas.perPixel.y
			);
			else ctx.strokeRect(
				0,
				0,
				(square.size.x-Camera.position.z).min0()/Camera.size*canvas.perPixel.x, 
				(square.size.y-Camera.position.z).min0()/Camera.size*canvas.perPixel.y
			)
			ctx.restore();
		}} catch {} 
	}
	
	for (text of currentScene.textList) {
		try { if (!text.hidden && text.active) {
			ctx.save();
			ctx.translate(text.toScreenFormat().x, text.toScreenFormat().y);
			ctx.rotate(text.rotation.z * Math.PI/180);
			ctx.fillStyle	= text.color;
			ctx.font		= text.font;
			if (!text.stroke) ctx.fillText(text.text, 0, 0);
			else ctx.strokeText(text.text, 0, 0);
			ctx.restore()
		}} catch {}
	}
}

// check canvas
canvas.check	= function() {
	if (canvas.fullScreen) {
		if (canvas.width != window.innerWidth) canvas.width = window.innerWidth;
		if (canvas.height != window.innerHeight) canvas.height = window.innerHeight;
	}
}

// define canvas 
canvas.setPosition = function(x=0, y=0, rel=false) {
	canvas.style.position	= rel ? 'relative' : 'absolute';
	canvas.style.left		= x+"px";
	canvas.style.right		= y+"px";
}

canvas.setRelativePixel	= function() {
	canvas.perPixel.x = canvas.width/10;
	canvas.perPixel.y = canvas.height/10;
}

// Define canvas as Vector3
canvas.perPixel = new Vector3(100, 100, 100);

// Define window
window.time			= { // set time for window
	second: 0,
	minute: 0, 
	hour: 0,
}

window.setTitle		= function(title) {
	document.title	= title;
}

// Scene
var sceneIndex		= [];
var currentScene	= new Scene("default");

// Append property of Update() to myInterval
window.myInterval	= [];

// Standard interval
window.interval		= [window.setInterval(canvas.draw, 1000/fps), window.setInterval(() => Timer(window.time), 1000/fps), window.setInterval(AudioMaster.check, 1000/fps), window.setInterval(canvas.check, 1000/fps), window.setInterval(canvas.setRelativePixel, 1000/fps)];

// Append the created document
document.body.appendChild(canvas);

// Set the window.onload
window.onload = function() {
	if (sceneIndex.length > 1) LoadScene(1);
}

console.log("Faran Canvas (farancanvas.js) module imported");