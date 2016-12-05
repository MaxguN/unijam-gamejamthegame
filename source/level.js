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

	this.background = PIXI.Sprite.fromImage('textures/background.png');
	this.table = PIXI.Sprite.fromImage('textures/table.png');
	this.screen = PIXI.Sprite.fromImage('textures/screen.png');
	this.display = new PIXI.Graphics();
	this.code = PIXI.Sprite.fromImage('textures/code.png');
	this.code.texture.frame = new PIXI.Rectangle(0, 0, this.code.texture.frame.width, 668);
	this.keyboard = PIXI.Sprite.fromImage('textures/keyboard.png');
	this.tablet = PIXI.Sprite.fromImage('textures/tablet.png');

	this.moveCount = 0;
	this.drawingsData = [[],[],[],[]];
	this.drawings = [];
	this.currentDrawing = -1;

	this.resize = {
		limits : {
			desk : 0.3,
			keyboard : 0.1,
			tablet : 0.1,
			player : 0.8
		},
		desk : {
			factor : 0.8,
			width : 0,
			height : 0
		},
		keyboard : {
			factor : 1,
			width : 0,
			height : 0
		},
		tablet : {
			factor : 1,
			width : 0,
			height : 0
		},
		player : {
			factor : 0.8,
			width : 0,
			height : 0
		}
	}
	this.timers = {
		limits : {
			init : 2,
			keyboard : 2,
			tablet : 2,
			screen : 2,
			play : 12
		},
		init : 0,
		keyboard : 0,
		tablet : 0,
		screen : 0,
		play : 0
	}

	this.phases = {
		init : 'init',
		one : 'one',
		sit : 'sit',
		two : 'two',
		code : 'code',
		three : 'three',
		draw : 'draw',
		play : 'play',
		credits : 'credits',
		end : 'end'
	}

	this.phase = null;
	this.timeout = null;

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
	this.objects = new PIXI.Container();
	this.desk = new PIXI.Container();
	
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
	this.dynamic.addChild(this.objects);
	this.dynamic.swapChildren(this.objects, this.player.container);
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

Level.prototype.WaitFor = function (length) {
	var self = this;
	var currentPhase = this.phase;

	length *= 1000;

	this.timeout = setTimeout(function () {
		self.phase = currentPhase;
	}, length);

	this.phase = null;
}

Level.prototype.Tick = function(length) {
	if (this.loaded) {
		var deltaTime = PIXI.ticker.shared.elapsedMS / 1000;

		switch (this.phase) {
			case this.phases.init:
				// timer
				if (!this.timers.init) {
					this.desk.addChild(this.table);
					this.desk.addChild(this.display);
					this.desk.addChild(this.screen);
					this.objects.addChild(this.desk);
					
					this.screen.width /= 2;
					this.screen.height /= 2;
					this.screen.x = (this.desk.width - this.screen.width) / 2;
					this.screen.y = -(this.screen.width * 2 / 3);
					this.resize.desk.width = this.desk.width;
					this.resize.desk.height = this.desk.height;

					this.display.x = this.screen.x + 51;
					this.display.y = this.screen.y + 70;

					this.display.beginFill(0x272822, 1);
					this.display.drawRect(0, 0, 1022, 668);

					this.resize.desk.factor = this.resize.limits.desk;

					this.desk.width = this.resize.desk.width * this.resize.desk.factor;
					this.desk.height = this.resize.desk.height * this.resize.desk.factor;
					this.desk.x = (renderer.width - this.desk.width) / 2;
					this.desk.y = (renderer.height - this.desk.height) / 2 + 10 - this.screen.y * this.resize.desk.factor;

					this.timers.init = this.timers.limits.init;

					this.WaitFor(2);
				} else if (this.timers.init >= 0) {
					this.timers.init -= deltaTime;

					if (this.timers.init <= 0) {
						this.timers.init = 0;
						this.phase = this.phases.one;
					}

					this.resize.desk.factor = this.resize.limits.desk + (1 - this.resize.limits.desk) * (this.timers.limits.init - this.timers.init) / this.timers.limits.init;

					this.desk.width = this.resize.desk.width * this.resize.desk.factor;
					this.desk.height = this.resize.desk.height * this.resize.desk.factor;
					this.desk.x = (renderer.width - this.desk.width) / 2;
					this.desk.y = (renderer.height - this.desk.height) / 2 + 10 - this.screen.y * this.resize.desk.factor;
				}
				break;
			case this.phases.one:
				// react to controls
				if (keydown[keys.s] || keydown[keys.down]) {
					this.resize.desk.factor -= deltaTime * 0.2;

					if (this.resize.desk.factor <= this.resize.limits.desk) {
						this.resize.desk.factor = this.resize.limits.desk;
						this.phase = this.phases.sit;
						// this.phase = this.phases.code;
						// this.phase = this.phases.draw;
					}

					this.desk.width = this.resize.desk.width * this.resize.desk.factor;
					this.desk.height = this.resize.desk.height * this.resize.desk.factor;
					this.desk.x = (renderer.width - this.desk.width) / 2;
					this.desk.y = (renderer.height - this.desk.height) / 2 + 10 - this.screen.y * this.resize.desk.factor;
				} else if (keydown[keys.w] || keydown[keys.up]) {
					this.resize.desk.factor += deltaTime * 0.2;

					this.desk.width = this.resize.desk.width * this.resize.desk.factor;
					this.desk.height = this.resize.desk.height * this.resize.desk.factor;
					this.desk.x = (renderer.width - this.desk.width) / 2;
					this.desk.y = (renderer.height - this.desk.height) / 2 + 10 - this.screen.y * this.resize.desk.factor;
				}
				break;
			case this.phases.sit:
				// timer
				if (!this.timers.keyboard) {
					this.player.Sit();
					this.objects.addChild(this.keyboard);

					this.resize.keyboard.factor = this.resize.limits.keyboard;
					this.resize.keyboard.width = this.keyboard.width;
					this.resize.keyboard.height = this.keyboard.height;

					this.keyboard.width = this.resize.keyboard.width * this.resize.keyboard.factor;
					this.keyboard.height = this.resize.keyboard.height * this.resize.keyboard.factor;
					this.keyboard.x = (renderer.width - this.keyboard.width) / 2;
					this.keyboard.y = (renderer.height - this.keyboard.height) / 2 + 40;

					this.timers.keyboard = this.timers.limits.keyboard;
				
					this.WaitFor(2);
				} else if (this.timers.keyboard >= 0) {
					this.timers.keyboard -= deltaTime;

					if (this.timers.keyboard <= 0) {
						this.timers.keyboard = 0;
						this.desk.addChild(this.code);
						this.desk.swapChildren(this.code, this.screen);
						this.code.x = this.display.x + 20;
						this.code.y = this.display.y + 20;
						this.code.texture.frame = new PIXI.Rectangle(0, 0, this.code.texture.frame.width, 0);
						this.phase = this.phases.two;
					}

					this.resize.keyboard.factor = this.resize.limits.keyboard + (1 - this.resize.limits.keyboard) * (this.timers.limits.keyboard - this.timers.keyboard) / this.timers.limits.keyboard;

					this.keyboard.width = this.resize.keyboard.width * this.resize.keyboard.factor;
					this.keyboard.height = this.resize.keyboard.height * this.resize.keyboard.factor;
					this.keyboard.x = (renderer.width - this.keyboard.width) / 2;
					this.keyboard.y = (renderer.height - this.keyboard.height) / 2 + 40;
				}
				break;
			case this.phases.two:
				// react to controls
				if (keydown[keys.any]) {
					this.resize.keyboard.factor -= deltaTime * 0.6;

					if (this.resize.keyboard.factor <= this.resize.limits.keyboard) {
						this.resize.keyboard.factor = this.resize.limits.keyboard;
						this.phase = this.phases.code;
					}

					this.keyboard.width = this.resize.keyboard.width * this.resize.keyboard.factor;
					this.keyboard.height = this.resize.keyboard.height * this.resize.keyboard.factor;
					this.keyboard.x = (renderer.width - this.keyboard.width) / 2;
					this.keyboard.y = (renderer.height - this.keyboard.height) / 2 + 40;

					var growth = 18 * 4;

					if (this.code.texture.frame.height < 668) {
						this.code.texture.frame = new PIXI.Rectangle(0, 0, this.code.texture.frame.width, this.code.texture.frame.height + growth);
					} else {
						this.code.texture.frame = new PIXI.Rectangle(0, this.code.texture.frame.y + growth, this.code.texture.frame.width, this.code.texture.frame.height);
					}

					keydown[keys.any] = false;
				}
				break;
			case this.phases.code:
				if (!this.timers.tablet) {
					this.desk.removeChild(this.code);
					this.objects.removeChild(this.keyboard);
					this.objects.addChild(this.tablet);

					this.resize.tablet.factor = this.resize.limits.tablet;
					this.resize.tablet.width = this.tablet.width;
					this.resize.tablet.height = this.tablet.height;

					this.tablet.width = this.resize.tablet.width * this.resize.tablet.factor;
					this.tablet.height = this.resize.tablet.height * this.resize.tablet.factor;
					this.tablet.x = (renderer.width - this.tablet.width) / 2;
					this.tablet.y = (renderer.height - this.tablet.height) / 2 + 35;

					this.timers.tablet = this.timers.limits.tablet;

					this.WaitFor(2);
				} else if (this.timers.tablet >= 0) {
					this.timers.tablet -= deltaTime;

					if (this.timers.tablet <= 0) {
						this.timers.tablet = 0;
						mouse.moved = false;
						this.phase = this.phases.three;
					}

					this.resize.tablet.factor = this.resize.limits.tablet + (1 - this.resize.limits.tablet) * (this.timers.limits.tablet - this.timers.tablet) / this.timers.limits.tablet;

					this.tablet.width = this.resize.tablet.width * this.resize.tablet.factor;
					this.tablet.height = this.resize.tablet.height * this.resize.tablet.factor;
					this.tablet.x = (renderer.width - this.tablet.width) / 2;
					this.tablet.y = (renderer.height - this.tablet.height) / 2 + 35;
				}
				break;
			case this.phases.three:
				// react to controls
				if (mouse.moved) {
					if (mouse.left) {
						this.resize.tablet.factor -= deltaTime * 0.1;

						if (this.resize.tablet.factor <= this.resize.limits.tablet) {
							this.resize.tablet.factor = this.resize.limits.tablet;
							this.desk.removeChild(this.drawings[this.currentDrawing]);
							this.phase = this.phases.draw;
						}

						this.tablet.width = this.resize.tablet.width * this.resize.tablet.factor;
						this.tablet.height = this.resize.tablet.height * this.resize.tablet.factor;
						this.tablet.x = (renderer.width - this.tablet.width) / 2;
						this.tablet.y = (renderer.height - this.tablet.height) / 2 + 35;

						var drawingIndex = Math.floor(this.moveCount / 110);

						if (drawingIndex < this.drawingsData.length) {
							var drawing = this.drawingsData[drawingIndex];
							var resizeFactor = (this.display.width - 40) / renderer.width;
							var position = {x : Math.round(mouse.x * resizeFactor), y : Math.round(mouse.y * resizeFactor)};
							drawing.push(position);

							if (drawingIndex !== this.currentDrawing) {
								this.currentDrawing = drawingIndex;
								this.drawings[drawingIndex] = new PIXI.Graphics();
								this.drawings[drawingIndex].moveTo(position.x, position.y);

								if (this.currentDrawing > 0) {
									this.desk.removeChild(this.drawings[drawingIndex - 1]);
								}

								this.desk.addChild(this.drawings[drawingIndex]);
								this.desk.swapChildren(this.drawings[drawingIndex], this.screen);
								this.drawings[drawingIndex].x = this.display.x + 20;
								this.drawings[drawingIndex].y = this.display.y + 20;
							} else {
								this.drawings[drawingIndex].beginFill(0x000000, 0);
								this.drawings[drawingIndex].lineStyle(5, 0xcccccc, 1);
								this.drawings[drawingIndex].lineTo(position.x, position.y);
								this.drawings[drawingIndex].endFill();
							}
						}

						this.moveCount += 1;

					} else {
						if (this.currentDrawing >= 0) {
							var drawingIndex = Math.floor(this.moveCount / 110);
							var resizeFactor = (this.display.width - 40) / renderer.width;
							var position = {x : Math.round(mouse.x * resizeFactor), y : Math.round(mouse.y * resizeFactor)};
							this.drawings[this.currentDrawing].moveTo(position.x, position.y);
						}
					}

					mouse.moved = false;
				}
				break;
			case this.phases.draw:
				// timer
				if (!this.timers.screen) {
					this.objects.removeChild(this.tablet);
					this.desk.removeChild(this.table);

					this.screen.x = 0;
					this.screen.y = 0;
					this.display.x = this.screen.x + 51;
					this.display.y = this.screen.y + 70;

					this.resize.desk.width = this.screen.width;
					this.resize.desk.height = this.screen.height;
					this.desk.width = this.resize.desk.width * this.resize.desk.factor;
					this.desk.height = this.resize.desk.height * this.resize.desk.factor
					this.desk.x = (renderer.width - this.desk.width) / 2;
					this.desk.y = (renderer.height - (this.desk.height * 0)) / 2 + 10;

					this.player.Stand();

					this.resize.player.width = this.player.current.width / this.resize.limits.player;
					this.resize.player.height = this.player.current.height / this.resize.limits.player;

					this.timers.screen = this.timers.limits.screen;
				} else if (this.timers.screen >= 0) {
					this.timers.screen -= deltaTime;

					if (this.timers.screen <= 0) {
						this.timers.screen = 0;
						this.phase = this.phases.play;
						// this.phase = this.phases.credits;
					}

					this.resize.desk.factor = this.resize.limits.desk + (0.6 - this.resize.limits.desk) * (this.timers.limits.screen - this.timers.screen) / this.timers.limits.screen;

					this.desk.width = this.resize.desk.width * this.resize.desk.factor;
					this.desk.height = this.resize.desk.height * this.resize.desk.factor
					this.desk.x = (renderer.width - this.desk.width) / 2 + 250 * (this.timers.limits.screen - this.timers.screen) / this.timers.limits.screen;
					this.desk.y = 10;

					this.resize.player.factor = this.resize.limits.player + (1 - this.resize.limits.player) * (this.timers.limits.screen - this.timers.screen) / this.timers.limits.screen;

					this.player.current.width = this.resize.player.width * this.resize.player.factor;
					this.player.current.height = this.resize.player.height * this.resize.player.factor
					this.player.current.x = (renderer.width - this.player.current.width) / 2 - (renderer.width / 2 - 250) * (this.timers.limits.screen - this.timers.screen) / this.timers.limits.screen;
					this.player.current.y = (renderer.height - this.player.current.height);
				}
				break;
			case this.phases.play:
				// timer
				if (!this.timers.play) {
					this.currentDrawing = -1;
					this.timers.play = this.timers.limits.play;
				} else if (this.timers.play >= 0) {
					this.timers.play -= deltaTime;

					if (this.timers.play <= 0) {
						this.timers.play = 0;
						this.desk.removeChild(this.drawings[this.currentDrawing]);
						this.phase = this.phases.credits;
					}

					var currentDrawing = (this.drawings.length - 1) - (Math.floor(this.timers.play) % this.drawings.length);
					
					if (this.currentDrawing !== currentDrawing) {
						if (this.currentDrawing >= 0) {
							this.desk.removeChild(this.drawings[this.currentDrawing]);
						}

						this.desk.addChild(this.drawings[currentDrawing]);
						this.desk.swapChildren(this.drawings[currentDrawing], this.screen);
						this.drawings[currentDrawing].x = this.display.x + 20;
						this.drawings[currentDrawing].y = this.display.y + 20;
						
						this.currentDrawing = currentDrawing;
					}
				}
				break;
			case this.phases.credits:
				// set credits screen
				var credit = new PIXI.Text('Made by MaxguN\n\nThanks for playing!', {fontFamily : 'Arial', fontSize: 72, fill : 0xEEEEEE, align : 'center'});
				credit.position = new PIXI.Point(this.display.x + (this.display.width - credit.width) / 2, this.display.y + (this.display.height - credit.height) / 2);
				this.desk.addChild(credit);
				this.desk.swapChildren(credit, this.screen);
				this.phase = this.phases.end
				break;
			case this.phases.end:
				// deadend
				break;
			default:
				// add player
				if (this.timeout === null) {
					// this.timeout = setTimeout(function () {
						this.phase = this.phases.init;
					// }, 2000);
				}
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