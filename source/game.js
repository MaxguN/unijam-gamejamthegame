var ticker = PIXI.ticker.shared;
ticker.autoStart = false;
ticker.stop();

var renderer = new PIXI.autoDetectRenderer(1280, 720);
renderer.backgroundColor = 0xeeeeee;
document.body.appendChild(renderer.view);

var level;
// var menu = new Menu(renderer);
var currentScene;

var textures = [
	'textures/background.jpg',
	'textures/human.png',
	'textures/chair.png',
	'textures/table.png',
	'textures/screen.png',
	'textures/keyboard.png',
	'textures/tablet.png'
];
var texCount = 0;

function tick(length) {
    currentScene.Tick(length);
}

ticker.add(tick)

textures.forEach(function (texture) {
	texCount += 1;
	load.image(texture, function () {
		texCount -= 1;

		if (texCount === 0) {
			level = new Level(renderer);

			currentScene = level;
			currentScene.ready(function () {
			    ticker.start();
			});
		}
	});
});

document.addEventListener('keydown', onkeydown);
document.addEventListener('keyup', onkeyup);
renderer.view.addEventListener('mousedown', mouse.down);
renderer.view.addEventListener('mousemove', mouse.move);
renderer.view.addEventListener('mouseup', mouse.up);
renderer.view.addEventListener('click', function () {window.focus()});
renderer.view.oncontextmenu = function () { return false; }

window.focus();