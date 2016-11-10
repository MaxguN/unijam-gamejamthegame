function Player(x, y, level) {
	var self = this;
	
	this.current = null;
	this.human = PIXI.Sprite.fromImage('textures/human.png');
	this.chair = PIXI.Sprite.fromImage('textures/chair.png');

	this.level = level;

	this.Init();
}

Player.prototype.Init = function () {
	var self = this;
	var ratio;

	console.log(this.human.width, this.human.height)

	ratio = 100 / this.human.width;
	this.human.width = 100;
	this.human.height = ratio * this.human.height;

	this.human.x = (renderer.width - this.human.width) / 2;
	this.human.y = (renderer.height - this.human.height);

	ratio = 100 / this.chair.width;
	this.chair.width = 100;
	this.chair.height = ratio * this.chair.height;

	this.level.dynamic.addChild(this.human);
	this.current = this.human;
}

Player.prototype.Sit = function () {
	this.level.dynamic.removeChild(this.human);
	this.level.dynamic.addChild(this.chair);
	this.current = this.chair;
}

Player.prototype.Stand = function () {
	this.level.dynamic.removeChild(this.chair);	
	this.level.dynamic.addChild(this.human);
	this.current = this.human;
}

Player.prototype.Tick = function (length) {
	if (this.isLoaded) {

	}
}