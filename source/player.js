function Player(x, y, level) {
	var self = this;
	
	this.human = PIXI.Sprite.fromImage('textures/human.png');
	this.chair = PIXI.Sprite.fromImage('textures/chair.png');

	this.level = level;

	this.Init();
}

Player.prototype.Init = function () {
	var self = this;

	this.level.dynamic.addChild(this.human);
}

Player.prototype.Sit = function () {
	this.level.dynamic.removeChild(this.human);
	this.level.dynamic.addChild(this.chair);
}

Player.prototype.Stand = function () {
	this.level.dynamic.removeChild(this.chair);	
	this.level.dynamic.addChild(this.human);
}

Player.prototype.Tick = function (length) {
	if (this.isLoaded) {


		if (!this.locked && !this.exploding) {
			var delta = GetDirection();
			
			if (IsMoving()) {
				this.rotation = Math.PI / 2 - Math.acos(delta.x) * (delta.y ? -Math.sign(delta.y) : 1);
			}

			if (keydown[keys.shift]) {
				if (!this.diving && !this.surfacing) {
					if (this.underwater) {
						this.SwitchToAnim('surface');
						this.surfacing = true;
						this.on('endAnimation', function () {
							this.SwitchToAnim('idle');
							this.surfacing = false;
							this.underwater = false;
							this.currentSpeed = this.speed_surface;
						}, this);
					} else {
						this.SwitchToAnim('dive');
						this.diving = true;
						this.on('endAnimation', function () {
							this.SwitchToAnim('idle-underwater');
							this.diving = false;
							this.underwater = true;
							this.currentSpeed = this.speed_underwater;
						}, this);
					}

					keydown[keys.shift] = false;
				}
			}

			delta.x *= this.currentSpeed * length;
			delta.y *= this.currentSpeed * length;

			delta = this.Collides(delta, length);

			if (delta.x || delta.y) {
				if (!this.diving && !this.surfacing) {
					if (this.underwater) {
						this.SwitchToAnim('move-underwater');

						this.energy -= length;
						this.air += length;

						if (this.air > this.airCapacity) {
							this.air = this.airCapacity;
						}

						if (this.energy <= 0) {
							this.energy = 0;
							this.surface();
						}
					} else {
						this.SwitchToAnim('move');

						this.energy += length * 2;
						this.air += length * 16;

						if (this.energy > this.energyCapacity) {
							this.energy = this.energyCapacity;
						}
						if (this.air > this.airCapacity) {
							this.air = this.airCapacity;
						}
					}
				}
			} else {
				if (!this.diving && !this.surfacing) {
					if (this.underwater) {
						this.SwitchToAnim('idle-underwater');

						this.air -= length;
						if (this.air <= 0) {
							this.air = 0;
							this.surface();
						}
					} else {
						this.SwitchToAnim('idle');

						this.energy += length * 4;
						this.air += length * 16;

						if (this.energy > this.energyCapacity) {
							this.energy = this.energyCapacity;
						}
						if (this.air > this.airCapacity) {
							this.air = this.airCapacity;
						}
					}
				}
			}

			this.x += delta.x;
			this.y += delta.y;

			this.currentAnimation.rotation = this.rotation;

			this.currentAnimation.position.x = this.x;
			this.currentAnimation.position.y = this.y;
			this.colliderShape.x = this.x;
			this.colliderShape.y = this.y;
			this.triggerShape.x = this.x;
			this.triggerShape.y = this.y;

			this.level.UpdateCamera(new PIXI.Point(this.x, this.y));

			if (keydown[keys.space]) {
				this.Interact();
				keydown[keys.space] = false;
				return;
			}

			if (keydown[keys.r]) {
				this.Radar(length);
			} else {
				this.Radar(length, true);
			}

			if (keydown[keys.i]) {
				this.Inventory();
				keydown[keys.i] = false;
			}
		} else {
			if (this.underwater) {
				if (!this.diving && !this.surfacing) {
					this.SwitchToAnim('idle-underwater');
				}

				if (this.air > 0) {
					this.air -= length;
					if (this.air <= 0) {
						this.air = 0;
						this.surface();
					}
				}
			}

			if (keydown[keys.i] && this.inventory.IsOpened()) {
				this.Inventory();
				keydown[keys.i] = false;
			}
		}
	}
}