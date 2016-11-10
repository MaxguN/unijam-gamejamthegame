function Animator(x, y, container) {
	this.x = x;
	this.y = y;

	this.tiles = [];
	this.tilesets = [];
	this.animations = [];
	this.currentAnimation = null;
	this.currentAnimationName = '';
	this.mirrored = false;
	this.isDisplayed = true;
	this.currentState = 0;

	this.container = container;

	this.isLoaded = false;

	this.listeners = {};
}

Animator.prototype.Init = function (data) {
	var self = this;

	data.tilesets.forEach(function (tileset, set) {
		var stateTiles = [];
		var index;
		var texture = new Image();
		texture.src = 'textures/' + tileset.file

		this.tilesets[set] = {
			baseTexture : new PIXI.BaseTexture(texture),
			width : tileset.tilewidth,
			height : tileset.tileheight
		};

		this.tiles[0] = [];
		stateTiles = this.tiles[0];

		for (var i = 0; i < tileset.imagewidth; i += tileset.tilewidth) {
			if (data.stateful) {
				this.tiles[i / tileset.tilewidth] = [];
				stateTiles = this.tiles[this.tiles.length - 1];
			}
			for (var j = 0; j < tileset.imageheight; j += tileset.tileheight) {
				if (data.stateful) {
					index = tileset.firstgid + j / tileset.tileheight;
				} else {
					index = tileset.firstgid + j / tileset.tileheight + i / tileset.tilewidth * (tileset.imageheight / tileset.tileheight);
				}
				
				stateTiles[index] = {
					texture : new PIXI.Texture(this.tilesets[set].baseTexture, new PIXI.Rectangle(i, j, tileset.tilewidth, tileset.tileheight)),
					set : set
				};
			}
		}

	}, this);

	var textureSet = [];
	var stateCount = 1;

	if (data.stateful) {
		stateCount = data.states;
	}

	for (var state = 0; state < stateCount; state += 1) {
		this.animations[state] = {};

		for (var animation in data.animations) {
			textureSet = [];

			data.animations[animation].frames.forEach(function (frame) {
				var currentTexture = this.tiles[state][frame.tile].texture;
				currentTexture.points = frame.points;
				textureSet.push(currentTexture);
			}, this);

			this.animations[state][animation] = new PIXI.extras.MovieClip(textureSet);
			this.animations[state][animation].animationSpeed = data.animations[animation].speed / 100;
			this.animations[state][animation].loop = data.animations[animation].loop;
			this.animations[state][animation].pivot = new PIXI.Point(this.animations[state][animation].width / 2, this.animations[state][animation].height / 2);
		}
	}

	this.currentAnimation = this.animations[this.currentState][data.default];
	this.currentAnimationName = data.default;
	this.currentAnimation.position = new PIXI.Point(this.x, this.y);
	this.currentAnimation.play();

	if (this.isDisplayed) {
		this.container.addChild(this.currentAnimation);
	}

	this.loaded();
}

Animator.prototype.on = function (eventType, callback, self) {
	// console.log(eventType, callback, self)
	if (!this.listeners[eventType]) {
		this.listeners[eventType] = [];
	}

	this.listeners[eventType].push({func : callback, object : self});
}

Animator.prototype.off = function(eventType, callback) {
	var indexes = [];

	if (!this.listeners[eventType]) {
		this.listeners[eventType] = [];
	}

	this.listeners[eventType].forEach(function (listener, index) {
		if (listener.func === callback) {
			indexes.unshift(index);
		}
	}, this);

	indexes.forEach(function (index) {
		this.listeners[eventType].splice(index, 1);
	}, this);
}

Animator.prototype.loaded = function () {
	this.isLoaded = true;

	if (this.listeners['load']) {
		this.listeners['load'].forEach(function (callback) {
			callback.func.call(callback.object);
		}, this);
	}
}

Animator.prototype.GetCenter = function () {
	var center = new PIXI.Point(this.x, this.y);

	if (this.mirrored) {
		center.x -= this.currentAnimation.width / 2;
	} else {
		center.x += this.currentAnimation.width / 2;
	}

	center.y -= this.currentAnimation.height / 2;

	return center;
}

Animator.prototype.GetRectangle = function () {
	if (this.currentAnimation) {
		return new PIXI.Rectangle(this.x - this.currentAnimation.pivot.x, this.y - this.currentAnimation.pivot.y, this.currentAnimation.width, this.currentAnimation.height);
	} else {
		return new PIXI.Rectangle(this.x, this.y, 0, 0);
	}
}

Animator.prototype.MoveTo = function (x, y) {
	this.x = x;
	this.y = y;

	this.currentAnimation.x = x;
	this.currentAnimation.y = y;
}

Animator.prototype.Hide = function () {
	if (this.isDisplayed) {
		this.container.removeChild(this.currentAnimation);
		this.isDisplayed = false;
	}
}

Animator.prototype.Display = function () {
	if (!this.isDisplayed) {
		this.container.addChild(this.currentAnimation);
		this.isDisplayed = true;
	}
}

Animator.prototype.UpdateAnim = function (animation, mirror) {
	if (this.animations[this.currentState] && this.animations[this.currentState][animation]) {
		if (this.animations[this.currentState][animation] !== this.currentAnimation || mirror !== this.mirrored) {
			if (this.isDisplayed) {
				this.container.removeChild(this.currentAnimation);
			}

			this.currentAnimation = this.animations[this.currentState][animation];
			this.currentAnimationName = animation;
			this.currentAnimation.position = new PIXI.Point(this.x, this.y);

			this.MirrorAnim(mirror);

			this.currentAnimation.play();

			if (this.isDisplayed) {
				this.container.addChild(this.currentAnimation);
			}
		}
	}
}

Animator.prototype.SwitchToAnim = function (animation, mirror) {
	mirror = !(!mirror);

	// console.log('Switch to ', animation)

	this.UpdateAnim(animation, mirror);
}

Animator.prototype.MirrorAnim = function (mirror) {
	mirror = !(!mirror);

	if (mirror) {
		if (!this.mirrored) {
			this.x += this.currentAnimation.width;
		}

		this.currentAnimation.scale.x = -1
	} else {
		if (this.mirrored) {
			this.x -= this.currentAnimation.width;
		}

		this.currentAnimation.scale.x = 1;
	}

	this.mirrored = mirror;
}

Animator.prototype.Erase = function () {
	if (this.currentAnimation) {
		this.container.removeChild(this.currentAnimation);		
	}
}

Animator.prototype.Tick = function () {
	if (this.listeners.endAnimation && this.listeners.endAnimation.length) {
		if (!this.currentAnimation.playing) {
			// console.log('not playing')
			this.listeners.endAnimation.forEach(function (callback) {
				callback.func.call(callback.object);
			});

			delete this.listeners.endAnimation;
		} else {
			// console.log('playing')
		}
	}
}