/**
 * ajax数据提交和渲染
 */

    alert('11');
(function(window){
    alert('11');
    alert(relBtn,eventClick);
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
        Ajax.request('/temp/upup/appendScore.php',{
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
        Ajax.request('/temp/upup/scoreRank.php',{
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

}(window))




