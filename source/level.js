function Level(renderer) {
	var self = this;


	this.json = {};
	this.window = {
		x : 0,
		y : 0,
		w : 1280,
		h : 720
	};

	this.music = new Audio();
	this.width = 0;
	this.height = 0;

	this.background = PIXI.Sprite.fromImage('textures/background.jpg');
	this.table = PIXI.Sprite.fromImage('textures/table.png');
	this.screen = PIXI.Sprite.fromImage('textures/screen.png');
	this.keyboard = PIXI.Sprite.fromImage('textures/keyboard.png');
	this.tablet = PIXI.Sprite.fromImage('textures/tablet.png');

	this.phases = {
		init : 'init',
		one : 'one',
		sit : 'sit',
		two : 'two',
		code : 'code',
		three : 'three',
		draw : 'draw',
		play : 'play'
	}

	this.phase = null;

	this.origin = {x:0,y:0};
	this.interface = {};
	this.interactable = null;
	this.end = -1;

	this.loaded = false;
	this.listeners = {
		ready : [],
		kill : [],
		loose : [],
		win : []
	};
	this.next = {
		ready : [],
		kill : []
	};

	this.ending = false;
	this.over = false;

	this.renderer = renderer;
	this.container = new PIXI.Container();
	this.game = new PIXI.Container();
	this.map = new PIXI.Container();
	this.dynamic = new PIXI.Container();
	
	this.player = new Player(0, 0, this);

	this.Init();
}

Level.prototype.Init = function() {
	var self = this;

	this.loaded = true;
	this.listeners.ready.forEach(function (listener) {
		listener();
	});
	while (this.next.ready.length > 0) {
		(this.next.ready.shift())();
	}

	this.map.addChild(this.background);

	this.game.addChild(this.map);
	// this.game.addChild(this.mapSprite);
	this.game.addChild(this.dynamic);
	this.container.addChild(this.game);
};

Level.prototype.on = function(event, callback) {
	if (this.listeners[event]) {
		this.listeners[event].push(callback);
	}
};

Level.prototype.ready = function(callback) {
	if (!this.loaded) {
		this.next.ready.push(callback);
	} else {
		callback();
	}
};

Level.prototype.loose = function() {
	this.listeners.loose.forEach(function (listener) {
		listener();
	});
};

Level.prototype.win = function() {
	this.listeners.win.forEach(function (listener) {
		listener();
	});
};

Level.prototype.CenterCamera = function (point) {
	this.game.x = -Math.min(Math.max(0, point.x - this.renderer.width / 2), this.mapSprite.width - this.renderer.width);
	this.game.y = -Math.min(Math.max(0, point.y - this.renderer.height / 2), this.mapSprite.height - this.renderer.height);
}

Level.prototype.UpdateCamera = function(point) {
	var space = 0;

	if (-this.game.x > point.x + space - this.renderer.width / 2) { // left border
		this.game.x = Math.round(-Math.min(Math.max(0, point.x + space - this.renderer.width / 2), this.mapSprite.width - this.renderer.width));
	} else if (-this.game.x < point.x - space - this.renderer.width / 2) { // right border
		this.game.x = Math.round(-Math.min(Math.max(0, point.x - space - this.renderer.width / 2), this.mapSprite.width - this.renderer.width));
	}
 	
	this.game.y = Math.round(-Math.min(Math.max(0, point.y - this.renderer.height / 2), this.mapSprite.height - this.renderer.height));
};

Level.prototype.Victory = function () {
	var self = this;
	this.submarine.Lock();
	setTimeout(function () {self.victorySpeech.Display();}, 1000);
}

Level.prototype.Defeat = function () {
	this.defeatDialog.Display();
}

Level.prototype.AddObject = function (object) {
	this.objects[object.colliderTag].push(object);

	if (object.triggerTag && object.triggerTag !== object.colliderTag) {
		this.objects[object.triggerTag].push(object);
	}
}

Level.prototype.RemoveObject = function (object) {
	for (var i = 0; i < this.objects[object.colliderTag].length; i += 1) {
		if (this.objects[object.colliderTag][i] === object) {
			this.objects[object.colliderTag].splice(i, 1);
			break;
		}
	}

	if (object.triggerTag && object.triggerTag !== object.colliderTag) {
		for (var i = 0; i < this.objects[object.triggerTag].length; i += 1) {
			if (this.objects[object.triggerTag][i] === object) {
				this.objects[object.triggerTag].splice(i, 1);
				break;
			}
		}
	}
}

Level.prototype.GetObjects = function (tag) {
	if (!this.objects[tag]) {
		return [];
	}

	return this.objects[tag];
}

Level.prototype.Tick = function(length) {
	if (this.loaded) {
		var deltaTime = PIXI.ticker.shared.elapsedMS / 1000;

		switch (this.phase) {
			case this.phases.init:
				// timer
				// add desk + screen
				break;
			case this.phases.one:
				// react to controls
				break;
			case this.phases.sit:
				// timer
				// add keyboard
				break;
			case this.phases.two:
				// react to controls
				break;
			case this.phases.code:
				// timer
				// remove keyboard
				// add tablet
				break;
			case this.phases.three:
				// react to controls
				break;
			case this.phases.draw:
				// timer
				// remove desk + tablet + player
				break;
			case this.phases.play:
				// timer animation
				break;
			default:
				// add player
				break;
		}

		this.Draw();
	}
};

Level.prototype.Draw = function() {	
	if (this.loaded) {
		this.renderer.render(this.container);
	}
};