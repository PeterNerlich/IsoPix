var img, coord;
var canvas = {
	image: {
		e: null,
		ctx: null
	},
	editor: {
		e: null,
		ctx: null
	}
};
var size = 9.237604307034013;
var mode = 'horizontal';
var grid = true;

var sqrt3 = Math.sqrt(3);
var input = {
	mouse: {
		left: false,
		right: false,
		shift: false,
		alt: false,
		layerX: null,
		layerY: null
	},
	key: []
};
var colorBuffer = '#000';

function pick(x,y,ctx) {
	var data = ctx.getImageData(x, y, 1, 1).data;
	return {
		r: data[0], g: data[1], b: data[2], a: data[3]
	};
}

function update() {
	// inputs
	var triangle = getTriangle(input.mouse.layerX,input.mouse.layerY,size);
	if (input.mouse.layerX !== null && input.mouse.layerY !== null) {
		var px = pick(triangle.x,triangle.y,canvas.image.ctx);
	}
		/*canvas.editor.ctx.fillStyle = 'rgba(100,100,100,0.8)';
		canvas.editor.ctx.fillRect(e.layerX-22,e.layerY-2,40,2);
		canvas.editor.ctx.fillRect(e.layerX-2,e.layerY-22,2,40);
		canvas.editor.ctx.font="20px Mono";
		canvas.editor.ctx.fillText(e.layerX+':'+e.layerY, e.layerX+3, e.layerY-6);
		canvas.editor.ctx.fillText('▲ '+triangle.x+':'+triangle.y, e.layerX+3, e.layerY+15);
		canvas.editor.ctx.fillText('temp: '+triangle.temp, e.layerX+3, e.layerY+35);*/
	if (input.mouse.left) {
		if (input.mouse.shiftKey) {
			canvas.image.ctx.clearRect(triangle.x,triangle.y,1,1);
		} else {
			canvas.editor.ctx.fillStyle = colorBuffer;
			canvas.image.ctx.fillRect(triangle.x,triangle.y,1,1);
		}
	} else if (input.mouse.right) {
		canvas.image.ctx.fillStyle = 'rgba('+px.r+','+px.g+','+px.b+','+px.a+')';
	}
	updateCells();
	if (input.mouse.layerX !== null && input.mouse.layerY !== null) {
		drawShape(
			canvas.editor.ctx,
			getCoordinates(triangle.x,triangle.y,size,false),
			'rgba('+(255-px.r)+','+(255-px.g)+','+(255-px.b)+',0.7)'
		);
	}
}

function updateCells(from,to) {
	if (typeof from === 'undefined') {
		from = [0,0];
		to = [img.width-1,img.height-1];
	}
	if (typeof to === 'undefined') {
		to = from;
	}
	if (typeof from !== 'object' || typeof to !== 'object') {
		return false;
	}
	to[0]++;
	to[1]++;
	//adjust sizes
	if (mode == 'vertical') {
		canvas.editor.e.width = img.width*size*0.5 + 0.5*size;
		canvas.editor.e.height = img.height*size*sqrt3*0.5;
	} else if (mode == 'horizontal') {
		canvas.editor.e.width = img.width*size*sqrt3*0.5;
		canvas.editor.e.height = img.height*size*0.5 + 0.5*size;
	}

	//drawing
	if (from == [0,0] && to == [img.width,img.height]) {
		canvas.editor.ctx.clearRect(0,0,canvas.editor.e.width,canvas.editor.e.height);
	}
	for (var i = from[0]; i < to[0]; i++) {
		for (var o = from[1]; o < to[1]; o++) {
			var px = pick(i,o,canvas.image.ctx);
			var path = new Path2D();
			if (grid/* || i+1 == to[0] || o+1 == to[1]*/) {
				drawShape(
					canvas.editor.ctx,
					getCoordinates(i,o,size,false),
					'rgba('+px.r+','+px.g+','+px.b+','+px.a+')',
					path
				);
			} else {
				drawShape(
					canvas.editor.ctx,
					getCoordinates(i,o,size,true),
					'rgba('+px.r+','+px.g+','+px.b+','+px.a+')',
					path
				);
			}
			canvas.editor.ctx.fill(path);
		}
	}
}
var key = null;
window.onload = function() {
	canvas.image.e = document.getElementById('c_image');
	canvas.image.ctx = canvas.image.e.getContext('2d');
	canvas.editor.e = document.getElementById('c_editor');
	canvas.editor.ctx = canvas.editor.e.getContext('2d');

	img = new Image();
	img.src = 'img/Download.png';
	img.onload = function() {
		canvas.image.e.width = img.width;
		canvas.image.e.height = img.height;
		canvas.image.ctx = canvas.image.e.getContext('2d');
		canvas.editor.ctx = canvas.editor.e.getContext('2d');
		canvas.image.ctx.drawImage(img, 0, 0);
		img.style.display = 'none';
		canvas.image.ctx.imageSmoothingEnabled = false;
		canvas.editor.ctx.imageSmoothingEnabled = false;
		update();
	};

	canvas.editor.e.addEventListener('mousemove', function(e){
		e.preventDefault();
		input.mouse.layerX = e.offsetX;
		input.mouse.layerY = e.offsetY;
		input.mouse.shiftKey = e.shiftKey;
		input.mouse.altKey = e.altKey;
		update();
	}, false);
	canvas.editor.e.addEventListener('mousedown', function(e){
		e.preventDefault();
		input.mouse.layerX = e.layerX;
		input.mouse.layerY = e.layerY;
		input.mouse.shiftKey = e.shiftKey;
		input.mouse.altKey = e.altKey;
		if (e.button === 0 || e.button === 1) {
			input.mouse.left = true;
		} else if (e.button === 2) {
			input.mouse.right = true;
		}
		key = e;
		update();
	}, false);
	canvas.editor.e.addEventListener('mouseup', function(e){
		e.preventDefault();
		input.mouse.layerX = e.layerX;
		input.mouse.layerY = e.layerY;
		input.mouse.shiftKey = e.shiftKey;
		input.mouse.altKey = e.altKey;
		if (e.button === 0 || e.button === 1) {
			input.mouse.left = false;
		} else if (e.button === 2) {
			input.mouse.right = false;
		}
		update();
	}, false);
	canvas.editor.e.addEventListener('contextmenu', function(e) {
		if (e.button === 2) {
			e.preventDefault();
			return false;
		}
	}, false);
	canvas.editor.e.addEventListener('mouseout', function(e){
		e.preventDefault();
		input.mouse.layerX = null;
		input.mouse.layerY = null;
		input.mouse.left = false;
		input.mouse.right = false;
		input.mouse.shiftKey = false;
		input.mouse.altKey = false;
		update();
	}, false);
};

function drawShape(ctx,val,color,path) {
	if (typeof val !== 'object' && val.length > 1) {
		return false;
	}
	if (typeof color === 'string') {
		ctx.fillStyle = color;
	}
	if (typeof path === 'undefined') {
		path = false;
	}
	if (path == false) {
		path = new Path2D();
		path.moveTo(val[0].x, val[0].y);
		for (var i = 1; i < val.length; i++) {
			path.lineTo(val[i].x, val[i].y);
		}
		ctx.fill(path);
	} else {
		path.moveTo(val[0].x, val[0].y);
		for (var i = 1; i < val.length; i++) {
			path.lineTo(val[i].x, val[i].y);
		}
	}
}

function getCoordinates(x,y,size,overlap) {
	if (x != Math.round(x) || y != Math.round(y)) {
		return false;
	}
	if (typeof overlap === 'undefined') {
		overlap = false;
	}
	if (mode == 'vertical') {
		if ((x+y)%2 == 0) {
			return [
				{
					x: 0.5*size + x*size/2,
					y: 0 + sqrt3*y*size/2
				},
				{
					x: 0 + x*size/2,
					y: sqrt3*size/2 + sqrt3*y*size/2
				},
				{
					x: size + x*size/2,
					y: sqrt3*size/2 + sqrt3*y*size/2
				}
			];
		} else {
			return [
				{
					x: 0 + x*size/2,
					y: 0 + sqrt3*y*size/2
				},
				{
					x: size + x*size/2,
					y: 0 + sqrt3*y*size/2
				},
				{
					x: 0.5*size + x*size/2,
					y: sqrt3*size/2 + sqrt3*y*size/2
				},
			];
		}
	} else if (mode == 'horizontal') {
		if ((x+y)%2 == 0) {
			if (overlap) {
				return [
					{
						x: 0 + sqrt3*x*size/2,
						y: 0.5*size + y*size/2
					},
					{
						x: sqrt3*size/2 + sqrt3*x*size/2,
						y: 0 + y*size/2
					},
						{
							x: 1 + sqrt3*size/2 + sqrt3*x*size/2,
							y: 0 + y*size/2
						},
						{
							x: 1 + sqrt3*size/2 + sqrt3*x*size/2,
							y: 1 + size + y*size/2
						},
					{
						x: 0 + sqrt3*x*size/2,
						y: 1 + 0.5*size + y*size/2
					}
				];
			} else {
				return [
					{
						x: 0 + sqrt3*x*size/2,
						y: 0.5*size + y*size/2
					},
					{
						x: sqrt3*size/2 + sqrt3*x*size/2,
						y: 0 + y*size/2
					},
					{
						x: sqrt3*size/2 + sqrt3*x*size/2,
						y: size + y*size/2
					}
				];
			}
		} else {
			if (overlap) {
				return [
					{
						x: 0 + sqrt3*x*size/2,
						y: 0 + y*size/2
					},
					{
						x: 0 + sqrt3*x*size/2,
						y: size + y*size/2
					},
						{
							x: 0 + sqrt3*x*size/2,
							y: 1 + size + y*size/2
						},
						{
							x: 1 + sqrt3*size/2 + sqrt3*x*size/2,
							y: 1 + 0.5*size + y*size/2
						},
					{
						x: sqrt3*size/2 + sqrt3*x*size/2,
						y: 0.5*size + y*size/2
					},
				];
			} else {
				return [
					{
						x: 0 + sqrt3*x*size/2,
						y: 0 + y*size/2
					},
					{
						x: 0 + sqrt3*x*size/2,
						y: size + y*size/2
					},
					{
						x: sqrt3*size/2 + sqrt3*x*size/2,
						y: 0.5*size + y*size/2
					},
				];
			}
		}
	}
}

function getTriangle(x,y,size) {
	if (x != Math.round(x) || y != Math.round(y)) {
		return false;
	}
	if (mode == 'horizontal') {
		// pattern:
		// ▶◀▶◀▶◀▶◀▶◀▶◀
		// ◀▶◀▶◀▶◀▶◀▶◀▶
		// check vertical lines first
		var ix = Math.floor(x / (size*sqrt3*0.5));
		var iy = Math.floor((y - 0.5*size) / (size*0.5))+1;
		var temp = '';
		if (iy <= 0) {
			iy = 0;
		} else if ( iy >= canvas.image.e.height) {
			iy = canvas.image.e.height;
		} else {
			var tempx = (x % (size*sqrt3*0.5)) / (size*sqrt3*0.5);
			var tempy = (((size + y)*2) % size) / size;
			if ((ix+iy)%2 == 0) {
				if ((tempx+tempy)/2 < 0.5) {
					iy--;
				}
				temp = ((tempx+tempy)/2 < 0.5) ? 'ober' : 'unter';
			} else {
				if ((1-tempx+tempy)/2 < 0.5) {
					iy--;
				}
				temp = ((1-tempx+tempy)/2 < 0.5) ? 'ober' : 'unter';
			}
		}
		return {
			x: ix,
			y: iy,
			temp: temp
		};
	} else if (mode == 'vertical') {
		// pattern:
		// ▲▼▲▼▲▼▲▼▲▼▲▼
		// ▼▲▼▲▼▲▼▲▼▲▼▲
		// check horizontal lines first
		var iy = Math.floor(y / (size*sqrt3*0.5));
		var ix = Math.floor((x - 0.5*size) / (size*0.5))+1;
		var temp = '';
		if (ix <= 0) {
			ix = 0;
		} else if ( ix >= canvas.image.e.width) {
			ix = canvas.image.e.width;
		} else {
			var tempy = (y % (size*sqrt3*0.5)) / (size*sqrt3*0.5);
			var tempx = (((size + x)*2) % size) / size;
			if ((ix+iy)%2 == 0) {
				if ((tempx+tempy)/2 > 0.5) {
					ix--;
				}
				temp = ((tempx+tempy)/2 > 0.5) ? 'ober' : 'unter';
			} else {
				if ((1-tempx+tempy)/2 > 0.5) {
					ix--;
				}
				temp = ((1-tempx+tempy)/2 > 0.5) ? 'ober' : 'unter';
			}
		}
		return {
			x: ix,
			y: iy,
			temp: temp
		};
	}
}