var ticker = PIXI.ticker.shared;
ticker.autoStart = false;
ticker.stop();

var renderer = new PIXI.autoDetectRenderer(1280, 720);
renderer.backgroundColor = 0xeeeeee;
document.body.appendChild(renderer.view);

var level;
// var menu = new Menu(renderer);
var currentScene;

var loader = PIXI.loader;
var textures = [
	['background', 'textures/background.png'],
	['human', 'textures/human.png'],
	['chair', 'textures/chair.png'],
	['table', 'textures/table.png'],
	['screen', 'textures/screen.png'],
	['keyboard', 'textures/keyboard.png'],
	['tablet', 'textures/tablet.png']
];
var texCount = 0;

function tick(length) {
    currentScene.Tick(length);
}

ticker.add(tick)

textures.forEach(function (texture) {
	loader.add(texture[0], texture[1]);
});

loader.once('complete', function () {
	level = new Level(renderer);

	currentScene = level;
	currentScene.ready(function () {
	    ticker.start();
	});
});
loader.load();

document.addEventListener('keydown', onkeydown);
document.addEventListener('keyup', onkeyup);
renderer.view.addEventListener('mousedown', mouse.down);
renderer.view.addEventListener('mousemove', mouse.move);
renderer.view.addEventListener('mouseup', mouse.up);
renderer.view.addEventListener('click', function () {window.focus()});
renderer.view.oncontextmenu = function () { return false; }

window.focus();