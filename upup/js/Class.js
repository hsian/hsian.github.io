/**
 * class person
 */
function person(parm){
	this.options = {
		'img' : null,
		'l' : 0,
		't' : 78,
		'w' : 30,
		'h' : 53,
		'x' : 0,
		'y' : 0,
	}
	this.o = objectExtend(this.options, parm)
};

var o,w,h,x,y;
person.prototype.draw = function(ctx,l,t){
	o = this.o;
	w = o.w;
	h = o.h;
	x = o.x;
	y = o.y;	
	ctx.drawImage(o.img,l,t,w,h, x, y ,w,h);
};

/**
 * class widget
 */
function widget(parm){	
	this.options = {
		'w' : 50,
		'h' : 24,
		'x' : 0,
		'y' : 0,
		'margin' : 0,
		'type' : 1,
		'isFade' : false, //是否消失
		'isMove' : false, //是否移动
		'isForce' : false, //是否加速（高度）
		'vx' : 1 //速度向量
	}
	var o = this.o = objectExtend(this.options, parm)
	//挂件绘制
	/*function _drawImg(w,h,x,y){
		//挂件是否显示
		if(o.isFade){
			return false;
		}

		ctx.drawImage(img,129,0,w,h,x,y,w,h);
	}*/
};

widget.prototype.draw = function(ctx){
		var o = this.o;
		var w,h;
		//挂件类型
		switch(o.type){
			case 1:
				w = o.w = 50;
				h = o.h = 24;
				ctx.drawImage(o.img,0,0,w,h, o.x, o.y ,w,h);
				break;

			case 2:
				w = o.w = 50;
				h = o.h = 24;
				ctx.drawImage(o.img,50,0,w,h, o.x, o.y ,w,h);
				break;
			case 3:
				w = o.w =50;
				h = o.h = 24;
				ctx.drawImage(o.img,100,0,w,h, o.x, o.y ,w,h);
				break;
			case 4:
				w = o.w = 50;
				h = o.h = 24;
				ctx.drawImage(o.img,150,0,w,h, o.x, o.y ,w,h);
				break;
			case 5:
				w = o.w = 34;
				h = o.h = 41;
				ctx.drawImage(o.img,0,29,w,h, o.x, o.y ,w,h);
				break;

			case 6:
				w = o.w = 34;
				h = o.h = 41;
				ctx.drawImage(o.img,34,29,w,h, o.x, o.y ,w,h);
				break;
			case 7:
				w = o.w = 34;
				h = o.h = 41;
				ctx.drawImage(o.img,68,29,w,h, o.x, o.y ,w,h);
				break;
			case 8:
				w = o.w = 34;
				h = o.h = 41;
				ctx.drawImage(o.img,102,29,w,h, o.x, o.y ,w,h);
				break;
			case 9:
				w = o.w = 34;
				h = o.h = 41;
				ctx.drawImage(o.img,136,29,w,h, o.x, o.y ,w,h);
				break;
		}
};



