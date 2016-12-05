function Player(x, y, level) {
	var self = this;
	
	this.current = null;
	this.human = PIXI.Sprite.fromImage('textures/human.png');
	this.chair = PIXI.Sprite.fromImage('textures/chair.png');

	this.level = level;
	this.container = new PIXI.Container();

	this.Init();
}

Player.prototype.Init = function () {
	var self = this;
	var ratio;

	ratio = 180 / this.human.width;
	this.human.width = 180;
	this.human.height = ratio * this.human.height;

	this.human.x = (renderer.width - this.human.width) / 2;
	this.human.y = (renderer.height - this.human.height);

	ratio = 220 / this.chair.width;
	this.chair.width = 220;
	this.chair.height = ratio * this.chair.height;

	this.chair.x = (renderer.width - this.chair.width) / 2;
	this.chair.y = (renderer.height - this.chair.height) + 150;

	this.container.addChild(this.human);
	this.current = this.human;

	this.level.dynamic.addChild(this.container);
}

Player.prototype.Sit = function () {
	if (this.current !== this.chair) {
		this.container.removeChild(this.human);
		this.container.addChild(this.chair);
		this.current = this.chair;
	}
}

Player.prototype.Stand = function () {
	if (this.current !== this.human) {
		this.container.removeChild(this.chair);
		this.container.addChild(this.human);
		this.current = this.human;
	}
}

Player.prototype.Tick = function (length) {
	if (this.isLoaded) {

	}
}