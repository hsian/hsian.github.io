/**
 *  2015-10
 *  @author Hsian
 *  the game realwill upup 
 */

(function(window,document){

    'use strict';
    //document element
    var $gameBg = HTML.query('.game-bg')[0],
        //$welcome = HTML.query('.welcome')[0],
        //$welImg = $welcome.query('img'),
        $gameImg = HTML.query('#game-warp'),
        $endPage = HTML.query('#end'),
        //$play = HTML.query('#play'),
        $gameView = HTML.query('#game-view'),
        $scoreEle = HTML.query('#score'),
        $again = HTML.query('#again'),
        $ctrlSound = HTML.query('.ctrl-sound')[0],
        $hint = HTML.query('.hint-popup')[0],

    //global
        ctx = $gameView.getContext('2d'),
        clientWidth = !isDevice ? pcWidth : window.innerWidth ,
        clientHeight = !isDevice ? pcHeight : window.innerHeight,
        img,            //挂件背景的图片
        wgtArr = [],    //挂件数组
        wgtMargin = 50, //挂件高度差
        wgtSame = 0,    //挂件连续不出现的数次
        allMove = 0,    // 运动的所有高度
        keyHeight = {   //关卡高度
            'easy' : 1000,
            'normal' : 1500,
            'hard' : 2000
        },
        /*keyHeight = {   //关卡高度
            'easy' : 0,
            'normal' : 0,
            'hard' : 0
        },*/
        moveArr = [],
        viewMargin = 0,
        p = null,       //人物
        wgtType = 0,
        score = 0,      //分数
        changeP = false,//人物切换
        pMove = false,  //人物是否移动到挂件
        PO,             //人物信息
        changeOff = true, //是否切换背景
        changeInow = 1, //切换的次数
        gameViewWidth,
        gameViewHeight,

        vx,
        pvx = clientWidth / 2,
        vy = -8,            //速度
        gravity = 0.2,     //重力
        lastWgt = null,
        moveOff = true,
        moveH = 0,
        lastHeight =  $gameView.height - 43 - 90 / (640 / clientWidth),
        wgtO,
        life = true,
        soundOff = true,    //声音默认播放
        soundstatus = true, //声音状态
        mySound1,mySound2,mySound3,mySound4;
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  
    //onload
    window.onload = function(){ 
        loadSounds();
        setCanvas();
        window.onresize = setCanvas;
        initialize();    
    };

    //sounds load
    function loadSounds(){
        mySound1 = new buzz.sound("./audio/bg_01.mp3");
        mySound2 = new buzz.sound("./audio/bg_02.mp3");
        mySound3 = new buzz.sound("./audio/bg_03.mp3");
        mySound4 = new buzz.sound("./audio/bg_04.mp3");
        var mySoundGroup = new buzz.group([ 
                mySound1, 
                mySound2, 
                mySound3,
                mySound4
            ]);
        mySoundGroup.load();
    };

    function setCanvas(){
        $gameView.setAttribute('height',clientHeight);
        $gameView.setAttribute('width',clientWidth);
        var viewCss = "; height:"+clientHeight+"px;";
        $gameView.style.cssText += viewCss;
        gameViewWidth = $gameView.width;
        gameViewHeight = $gameView.height;
        //base
        //$welcome.style.height = 1200 * clientWidth / 640 + 'px';
        if(!isDevice){
            $endPage.style.height = 568 + 'px';
        }else{
            $endPage.style.height = 1200 * clientWidth / 640 + 'px';
        } 
        $gameBg.style.height = clientHeight + 'px';
        $gameImg.style.height = clientHeight + 'px';
        $gameImg.style.backgroundPositionY = -(2347 * clientWidth / 640 - clientHeight) + 'px';
        //设置rem
        document.documentElement.style.fontSize = clientWidth / 10 + 'px';
    };

    //初始化函数
    function initialize(){
        //求第一次底下的间隔
        viewMargin = gameViewHeight % wgtMargin;
        // show widget 
        loadWidget();   
        ctrlSpeed();        
        //$play.addEventListener(eventClick,beginGame,false);
        $again.addEventListener(eventClick,againGame,false);
        $ctrlSound.addEventListener(eventClick,changeSounds,false);
    };

    /*function nextSection(event){
        $welcome.hide();
    };*/

    function beginGame(event){
        window.scrollTo(0,0);
        againGame();
    };

    //控制声音
    function changeSounds(){ 
        if(soundOff){
            this.style.backgroundImage = 'url("img/bg_sound_on.png")';
            return soundOff = false;
        }       
        if(!soundOff){
            this.style.backgroundImage = 'url("img/bg_sound_off.png")';
            return soundOff = true;
        }
    };

    //加载挂件图片
    function loadWidget(){
        img = new Image();
        img.src = "img/cs_jmp.png";
        img.onload = function(){ 
            showPerson();
            PO = p.o;
            ctrlScroll();    
            if(isDevice || isWeixin){
                 $hint.show();
                setTimeout(function(){
                    $hint.hide();
                    beginGame(); 
                },1500); 
            }else{
                beginGame(); 
            }            
        };
    };

    //生成挂件
    function generate_Widget(img){
        var row = parseInt(gameViewHeight / wgtMargin);
        var wgtItem = null;
        var x,y;
        var wgtW = 38; //挂件的宽度
        for(var  i = 0; i < row; i++){
            x = parseInt(Math.random() * (gameViewWidth - 50));
            y = wgtMargin * i;
            wgtItem =  new widget({
                'img' : img,
                'type' : parseInt(Math.random() * 4 + 1),
                'x' : x,
                'y' : y,
                'margin' : wgtMargin
            });
            wgtItem.draw(ctx);
            wgtArr.push(wgtItem);
        };
    };

    //挂件移动速度
    var wgtSpeed = 3; 
    function stageMove(num){
        var timer = null;
        var wgtItem = null;
        var isStop = 0;
        var isFade = false;
        var random = 0; 
        var isMove = false;  
            
        //分数控制
        ctrlScore(num);
        //背景控制
        changeBg();
        //timer =setInterval(function(){
        _timer();
        function _timer(){
            //约值 num ，isStop 难判断相等 
            if (num - isStop < 3) { 
                clearInterval(timer);
                return false;
            };
            isStop += wgtSpeed;
            allMove += wgtSpeed;        
            window.requestAnimationFrame(_timer, $gameView);
            ctx.clearRect(0,0,gameViewWidth,gameViewHeight);            
            for(var i = 0; i <  wgtArr.length ; i++){
                wgtArr[i].o.y += wgtSpeed;;
                var y = wgtArr[i].o.y;                    
                if(wgtArr[i].o.y > (gameViewHeight - viewMargin)){
                    viewMargin *= 0.95; //差距慢慢缩小
                    //isMove = wgtType >= 5 ? false : ctrlMove(isMove,7);
                    //第一关
                    if(keyHeight.normal > allMove > keyHeight.easy){
                        isFade = ctrlKey(isFade,5);  //7是隐藏的挂件出现概率 越大出现的概率越小
                    }
                    //第二关
                    if( keyHeight.hard > allMove > keyHeight.normal){
                        isFade = ctrlKey(isFade,4);
                        isMove = ctrlMove(isMove,7);
                    }
                    //第三关
                    if(allMove > keyHeight.hard){
                        isFade = ctrlKey(isFade,3);
                        isMove = ctrlMove(isMove,5);
                    }
                    wgtArr.splice(i,1);
                    if(Math.random() > 0.95){
                        wgtType = parseInt(Math.random() * 5 + 5);
                    }else{
                        wgtType = parseInt(Math.random() * 4 + 1);
                    }                      
                    if(!isFade){
                        wgtItem = new widget({
                            'img' : img,
                            'type' : wgtType,
                            'x' : parseInt(Math.random() * (gameViewWidth - 50)),
                            'y' : 0 ,
                            'margin' : wgtMargin,
                            'isFade' : isFade,
                            'isMove' : isMove
                        });
                        wgtItem.draw(ctx);
                        //是否滚动                  
                        if(isMove){
                            moveArr.push(wgtItem);
                        }
                    }else{
                        wgtItem = new widget({
                            'img' : img,
                            'x' : -50,
                            'y' : 0
                        });
                    }
                    wgtArr.unshift(wgtItem);
                }else{
                    wgtArr[i].draw(ctx);    
                }
            }
            if(vy < 0){
                //上升时候人物切换
                p.draw(ctx,30,78)
            }else{
                 //掉下来时候人物切换
                p.draw(ctx,0,78)
                changeP = false;
            }
        //},1000 / 60)
        }
    };

    function ctrlKey (isFade,num){
        //随机控制挂件是否显示
        var random = Math.random() * 10;
        isFade = random > num ? true : false;
        wgtSame = isFade ? ++wgtSame : (--wgtSame < 0 ? 0 : wgtSame);
        if(wgtSame >= 2){
            wgtSame = 0;
            isFade = false;
        }
        return isFade;
    };

    function ctrlMove(isMove,num){
        //随机控制挂件是否左右滚动
        var result = (Math.random() * 10) - num;
        return isMove = result <= 0 ? true : false;
    };

    //处理左右滚动的挂件
    function ctrlScroll(){
        var vx = 3;//速度向量
        var  fps = 30;
        setTimeout(function(){ //setTimeout帧率不准确
        //window.requestAnimationFrame(ctrlScroll, gameView);
            ctrlScroll();
            if(moveArr.length < 0){ return false;}
            for(var i = 0; i < moveArr.length ; i++){
                wgtO = moveArr[i].o;
                ctx.clearRect(0,wgtO.y,gameViewWidth,wgtO.h);
                if(moveArr[i].iNow != 1){
                    moveArr[i].iNow = 0;
                }       
                if(wgtO.x >= gameViewWidth - wgtO.w){
                    wgtO.vx = -vx
                }else if(wgtO.x <= 0){
                    wgtO.vx = vx;
                }else if(!moveArr[i].iNow){
                    wgtO.vx = vx;
                    moveArr[i].iNow++;
                }       

                wgtO.x += wgtO.vx; 
                moveArr[i].draw(ctx)
            }
            if(vy < 0){
                //上升时候人物切换
                p.draw(ctx,30,78)
            }else{
                 //掉下来时候人物切换
                p.draw(ctx,0,78)
                changeP = false;
            }  
        },1000 / fps)      
    };

    //人物
    function showPerson(){
        p = new person({
            'img' : img,
            'x' : gameViewWidth / 2,
            'y' : gameViewHeight - 50 - 90 / (640 / clientWidth)
        })  
        p.draw(ctx,0,78);   
    };

    

    //人物跳跃
    function jump(iNow){
        //判断是否结束
        if(!life){ 
            soundOff == true ? mySound2.play() : mySound2.pause();
            return false;
        }   
        if(PO.y > gameViewHeight){
            gameOver()
        }
       
        vy += gravity;
        vy = vy > 11 ? 11 : vy;
        //运动
        PO.y += vy; 
        PO.x = pvx;     
        window.requestAnimationFrame(jump, $gameView);
        ctx.clearRect(0, 0, gameViewWidth, gameViewHeight);  
        for(var i = 0; i < wgtArr.length; i++){
             wgtArr[i].draw(ctx);
        }
        if(vy < 0){
            //上升时候人物切换
            p.draw(ctx,30,78)
        }else{
             //掉下来时候人物切换
            p.draw(ctx,0,78)
            changeP = false;
        }       
        //碰撞检测
        if(vy >= 0 ){



            if(!pMove){
                if(PO.y + 60 >= gameViewHeight - 90 / (640 / clientWidth)){
                    vy = -8;
                    //踩到挂件的声音
                    soundOff == true ? mySound1.play() : mySound1.pause();
                }
            }
            for(var j = 0; j < wgtArr.length; j++){ 
                wgtO = wgtArr[j].o;
                //此处为减少计算全部替换成数字 43..
                if(wgtO.y > PO.y + PO.h - 8 && wgtO.y - (PO.y + PO.h) < 3){
                    if(wgtO.x + 3 < PO.x + 25  && wgtO.x+wgtO.w -3 > PO.x ){                    
                        //挂件移动的高度
                        moveH = parseInt(gameViewHeight * 2/3 - PO.h - PO.y);
                        moveH = moveH > 0 ? moveH : 0;
                        if(lastWgt != wgtArr[j] && PO.y < gameViewHeight / 2){
                            stageMove(moveH);
                            vy = wgtO.w == 34 ? -8 : -6;
                        }else{
                            vy = wgtO.w == 34 ? -10 : -8;
                        }

                        //已移动到挂件上
                        pMove = true;
                        lastWgt = wgtArr[j];
                        lastHeight = PO.y

                        //踩到挂件的声音
                        mySound1.stop()
                        soundOff == true ? mySound1.play() : mySound1.pause();
                    }
                }
            }
        }   
    };

    //控制方向和速度
    function ctrlSpeed(){
        //小薇的一半
        var pHalf = 20;
        var pcMarginSide = !isDevice ? (window.innerWidth - 320) / 2 : 1;
        $gameView.addEventListener(eventClick,function(event){
            !isDevice ? 1 : event.preventDefault();//阻止触摸时浏览器的缩放、滚动条滚动
            pvx = !isDevice ? event.pageX - pHalf - pcMarginSide : event.targetTouches[0].pageX - pHalf;         
        },false);
        $gameView.addEventListener(eventMove,function(event){
            !isDevice ? 1 : event.preventDefault();
            pvx = !isDevice ? event.pageX - pHalf - pcMarginSide : event.targetTouches[0].pageX - pHalf;     
        },false);
        $gameView.addEventListener(eventEnd,function(event){
            !isDevice ? 1 : event.preventDefault();//阻止触摸时浏览器的缩放、滚动条滚动          
        },false);
    };

    function ctrlBg(){
        return false;
    };

    function changeBg(){
        if(score > 1000 * changeInow){
            changeOff = true;
            changeOff == true && ctrlBg(5);
            changeOff = false;
            changeInow++;
        }
    };

    //分数
    function ctrlScore(num){
        score +=num;
        $scoreEle.innerHTML = score ;
    };

    //游戏失败
    function gameOver(){      
        life = false;
        ctx.clearRect(0,0,gameViewWidth,gameViewHeight);
        endScore.innerHTML = score + 'm';
        //存储数据
        handleData.set(score);
        $endPage.style.display = 'block';
        $endPage.style.zIndex = 5;
        //声音延时
        setTimeout(function(){
            soundOff == true ? mySound3.play() : mySound3.pause();
        },2000)      
    };

    //重置游戏
    function againGame(){
        window.scrollTo(0,0);
        $endPage.style.zIndex = 1;
        $endPage.style.display = 'none';
        $scoreEle.innerHTML = 0;
        life = true;
        pMove = false;
        score = 0;
        allMove = 0;
        wgtArr = [];
        moveArr = [];
        generate_Widget(img); 
        pvx = gameViewWidth / 2;
        PO.y = gameViewHeight - 60 - 90 / (640 / clientWidth);
        jump();
    };


    /**
     * release.js////////////
     */
    
    //element
    var relBtn = document.getElementById('showScore');
    var rankPage = document.getElementById('rank-page');
    var rankUl = document.getElementById('rank-list');
    var rankClose = document.getElementById('rank-page-close');
    var rankPop = document.getElementById('rank-popup');
    var endPage = document.getElementById('end');
    var rankPopClose = document.getElementById('rank-popup-close');
    var rankMsg = document.getElementById('rank-msg');
    var data,res;
    var isRank = false;



    rankPopClose.addEventListener(eventClick,function(){
        event.preventDefault();
        rankPop.style.left = '5000px';
    },false);
    //分数提交
    relBtn.addEventListener(eventClick,releaseScore,false);

    function releaseScore(){        
        var score = handleData.get();
        Ajax.request('/temp/upup/scoreInsert.php',{
            method : 'POST',
            data : {'score' : score,'nickname' : user_Nickname},
            success : function(xhr){
                data = xhr.responseText;
                showHint(score,data);
                showAll(score); 
                endPage.style.display = 'none';
                rankPage.style.display = 'block';
            }
        })       
    }

    function showRank(data,score){
        var _html = ''
        
        for(var i = 0; i < data.length; i++){
            if(isRank && score == data[i]['score']){
                _html += '<li class="current"><span>'+ (i+1) +'</span><span>'+ data[i]['nickname'] +'</span><span>'+ data[i]['score'] +'</span></li>';
                isRank = false;
            }else{
                _html += '<li><span>'+ (i+1) +'</span><span>'+ data[i]['nickname'] +'</span><span>'+ data[i]['score'] +'</span></li>'; 
            }
        }
        rankUl.innerHTML = _html;
    }

    function showAll(score){
        Ajax.request('/temp/upup/scoreAll.php',{
            method : 'POST',
            data : {'score' : score},
            success : function(xhr){
                data = xhr.responseText;
                data = eval(data);
                showRank(data,score);
            }
        })
    }

    function showHint(score,rank){      
        //排行榜高亮
        if(rank < 100){
            isRank = true;
        }
        //提示
        var _html = '<p>你的分数是<span>' + score+'</span></p>';
        if(score){
            _html += '<p>目前排在第<span>' + rank+'</span>位</p>';
        }
        rankMsg.innerHTML = _html; 
    }
    rankClose.addEventListener(eventClick,closeRank,false);

    function closeRank(){       
        rankPage.style.display = 'none';
        endPage.style.display = 'block';
        //wel.style.display = 'block';
        rankPop.style.left = '10%';
    }

}(window,document))