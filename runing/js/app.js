(function(window,undefined){

	//global variable
	//class
	var run,role,fullbg,barrier,
	    km = 0,
        canvas_w, canvas_h,
        RAFid,
        touchstart = 'ontouchstart' in document ? 'touchstart' : 'click';

    var btnStart = $('#start-game'),
        btnStop = $('#stop-game'),
        btnContinue = $('#continue'),
        btnSubList = $('#btn-sublist'),
        countDown = $('#count-down');

	run = {
		initialize : function(){
			var self = this;
            this.view = null;
            this.ctx = null;
            this.RAFid = 0;
            this.isStop = false;
            this.over = true;       
            //over time
            this.time = 10; 
            this.currentTime = 0;
            this.timer = null;
            this.countDown = this.time;

			(function(){
				var view = self.view = document.getElementById('view');
				var ctx = self.ctx = view.getContext('2d');
                var aaa = 2;
                canvas_w = view.width;
                canvas_h = view.height;
                //start      
                self.again();
                btnStart.on(touchstart,function(){   
                    if(self.over){
                        return (function(){ 
                            self.again(); 
                            self.start();
                            self.over = false;
                            self.countTime();
                            btnSubList.show();
                        }());
                    };                       
                });
				btnStop.on(touchstart,function(){
                    self.stop();
                    btnStop.hide();
                    btnContinue.show();
                    //like hover
                    /*return function(){
                        this.isStop = this.isStop == false ? true : false;
                        if(this.isStop){
                            this.stop();
                            btnStop.val('000')
                        }else{
                            this.start();
                        }     
                    }.call(self); */     
                });
                btnContinue.on(touchstart,function(){
                    self.start();
                    self.countTime();
                    btnContinue.hide();
                    btnStop.show();
                });
			}());
		},
        countTime : function(){
            var self = this;
            var count = parseInt(countDown.html());
            self.timer = setInterval(function(){
                ++self.currentTime;
                countDown.html(--count);
            },1000);
        },
        stop : function(){
                clearInterval(this.timer);
                !!RAFid && window.cancelAnimationFrame(RAFid);
        },
        end : function(){
            this.over = true;
            this.stop();
            //alert("the end, you Death,km=" + km);
            btnSubList.hide();
            this.send();
        },
        //frame loop
        start : function(){
            var self = run;
            var touch;
            RAFid = Tools.RAF(self.start,self.view);
            Tools.clean(self.ctx,self.view);      
            touch = Tools.touch(role,barrier);
            role.setFps = touch ? 10 : 5;
            barrier.speed = touch ? 0.5 : 2;
            km = touch ? km : km+1;
            barrier.move();
            role.move();
            if(self.currentTime == self.time){
                self.end();
            }
        },
        again : function(){
            //notice order
            // initialize barrier and role
            barrier.start(this.ctx);
            role.start(this.ctx);
            this.currentTime = 0;
            km = 0;
            countDown.html(this.time);
        },
        send : function(){
            $.ajax({
                type : 'post',
                data : {'score' : km},
                url : '/temp/runing/appendScore.php',
                //dataType : 'json',
                success : function(data){
                    if(data == 0){
                        alert("3 times has been finished,pleace share with your friends");
                        btnStart.hide();
                    }else if(data == 999){
                        alert('help complate, score =' + km);
                        $('#share-notice').html('');
                    }else{
                        alert('end');
                        run.addScore();
                    }
                },
                error : function(e){
                    alert('error');
                }
            });
        },
        addScore : function(){     
            var scoreCol = document.getElementById('score');
            var countCol = document.getElementById('count');
            var score = scoreCol.innerHTML;
            var count = countCol.innerHTML;
            scoreCol.innerHTML = parseInt(score) + km;
            countCol.innerHTML = parseInt(count) - 1;
        }
	},

	barrier = {

		_initialize : function(ctx){
            this._ctx = ctx;
            this.speed = 2;
            this._x = canvas_w;
            this._y = 200;
            this._l = 0;
            this._w = 38;
            this._h = 36;
            this._off = false;
            this._loop = 0; //loop count
            this._img = null;
            this._barCount = 5;
			var self = this;
			var img = this._img = Tools.createImg(this.manifest.img);
			img.onload = function(){
				return !function(){
					Tools.draw(img,0,0,this._w,this._h,canvas_w,this._y,this._ctx)
				}.call(self)
			}
		},

		move : function(){
            if(this._off) return;
			this._x -= this.speed;
            //to border
            if(this._x === -this._w){
                //barrier loop
                this._loop === this._barCount - 1 ? this._loop = 0 :  ++this._loop;
                this._x = canvas_w;
                this._l = this._loop * this._w;                
            }
			Tools.draw(this._img,this._l,0,this._w,this._h,this._x,200,this._ctx)
		},
		start : function(ctx){
			this._initialize(ctx);
		},
		stop : function(){
             this._off = true;
		},
		manifest : {
			img : './img/pic_barrier.png'
		}
	}

	//running character
	role = {

		_initialize : function(ctx){
            this._ctx = ctx;
            this._frame = 3; 
            this._x = 50;
            this._y = 200;
            this._l = 0;
            this._w = 26;
            this._h = 38;
            this._img = null;
            this._off = false;
            this._imgx = 0;
            this.setFps = 5;
            this._Fpsx = 0;
            this._isJump = false;
            this._par = false;
            var self = this;
            var img = this._img = Tools.createImg(this.manifest.img);
            //load image
            img.onload = function(){
                return function(){
                    Tools.draw(img,0,0,this._w,this._h,this._x,this._y,this._ctx)
                }.call(self)
            }
            //event handle
            $(run.view).on(touchstart,function(){
                 return function(){
                    this._par = false;
                    !this._isJump ? this.jump() : '';
                 }.call(self)                        
            });         
		},

		move : function(){     
            if(!this._frame || this._off) return; 
            if(this._Fpsx >= this.setFps){
                this._l = this._imgx * this._w;
                this._Fpsx = 0;
            }
            this._Fpsx++;
            Tools.draw(this._img,this._l,0,this._w,this._h,this._x,this._y,this._ctx)
            this._imgx = this._imgx === this._frame - 1 ? 0 : ++this._imgx;
            //jump
            !!this.hasOwnProperty('_jumpRun') ?  this._jumpRun() : '';
		},

		jump : function(){
            //change this._y control height
            var targetY = 110;
            var largerY = Math.abs(this._y - targetY);
            var minScope = 14; // control drop scope
            var easing = 0.07;
            //var friction = 0.5;
            var dy = 0;
            var vy = 0;
            var drop = false;
            var stop = false;

            (this._jumpRun = function(){
                this._isJump = true;
                if(this._par){ return;};
                dy = targetY - this._y;
                stop = Math.abs(dy) - 3 >= largerY ? true : false;
                if(stop && drop){
                    this._isJump = false;
                    this._par = true;
                }
                drop = Math.abs(dy) < minScope ?  true : !!stop ? false : drop ;
                vy = !drop ? dy * easing : dy * easing * -1;
                this._y += vy;
            })();     
		},
		start : function(ctx){
            this._initialize(ctx);
		},
        stop : function(){
            this._off = true;
        },
        manifest : {
            img : './img/pic_role.png'
        }
	};

	fullbg = {

	};

	Tools = {
		createImg : function(src){
			var img = new Image();
			img.src = src;
			return img;
		},
		draw : function(img,l,t,w,h,x,y,ctx){		
				ctx.drawImage(img,l,t,w,h, x, y ,w,h);			
		},
		RAF : function(fn,canvas){
			return (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame)(fn,canvas);
		},
		clean : function(ctx,canvas){
			return ctx.clearRect(0, 0, canvas.width, canvas.height);
		},
        touch : function(A,B){
            return function(){
                try{
                    return A._x + A._w > B._x && A._x < B._x + B._w && A._y + A._h - 5 > B._y && A._y < B._y + B._h;
                }catch(e){} 
            }();
        }
	};

	run.initialize();

})(window,undefined);