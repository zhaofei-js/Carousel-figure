/**
 * Created by sym on 2016/10/26.
 */
/*
*   1、先准备要操作的dom元素
* */
//最外层
var banner = utils.getElesByClass('banner')[0];
// 包含n张图片的盒子
var bannerInner = utils.getElesByClass('bannerInner',banner)[0];
//获取所有的图片
var imgs = bannerInner.getElementsByTagName('img');
// 获取焦点圆圈
var focusList = utils.children(banner,'ul')[0];
// 获取所有焦点
var lis = focusList.getElementsByTagName('li');
// 左按钮
var left = utils.getElesByClass('left',banner)[0];
var right = utils.getElesByClass('right',banner)[0];

/*
*   2、获取数据
* */
;(function getData(){
    var xhr = new XMLHttpRequest();
    // 在data.txt拼接一个随机数是为了不读取本地304缓存，保证每次请求的url都不同
    xhr.open('get','data.txt?_='+Math.random(),false); //timeStamp
    xhr.onreadystatechange = function (){
        if(xhr.readyState == 4 && xhr.status == 200){
            window.data = utils.jsonParse(xhr.responseText);
        }
    };
    xhr.send(null);
})();
/*
*   3、绑定数据
* */
;(function bindData(){
    if(window.data){
        var str = '';   // 给img拼接使用
        var str1 = ''; // 给li拼接
        for(var i=0; i<data.length; i++){
            // 每循环一次需要拼接一张图片出来
            str += '<div><img src="" relSrc="' + data[i].src + '"/></div>';
            str1 += i == 0 ? '<li class="selected"></li>' : '<li></li>';
        }
        str += '<div><img src="" relSrc="' + data[0].src + '"/></div>';
        //在末尾增加一张图片，为了图片在轮播的时候保证无缝连接的
        utils.css(bannerInner,'width',1000*(data.length+1));//由于多了一张图片。但是bannerInner宽度不够，所以需要重新设置宽度，这个宽度其实就是获取来的数据的length+1
        bannerInner.innerHTML = str;
        focusList.innerHTML = str1;

    }
})();

/*
*   4、图片延迟加载 (图片有效性验证) => 其实也就是src这个属性的值一定要去加载一个有效值
* */
/*;(function imgsLoad(){
    for(var i=0; i<imgs.length; i++){
        // 这些图片的src的值都在relSrc这个自定义属性上,验证成功之后赋值给src属性
        var curImg = imgs[i]; //当前即将要被加载的
        var tempImg = document.createElement('img');
        tempImg.index = i;
        tempImg.src = curImg.getAttribute('relSrc'); //临时图片去加载
        tempImg.onload = function (){
            imgs[this.index].src = this.src;
            工具.css( imgs[this.index],'display','block');
            animate( imgs[this.index],{opacity:1},2000);
        };
        tempImg = null;
    }
})();*/
;(function imgsLoad(){
    for(var i=0; i<imgs.length; i++){
        // 这些图片的src的值都在relSrc这个自定义属性上,验证成功之后赋值给src属性
        (function (i){
            var curImg = imgs[i]; //当前即将要被加载的
            var tempImg = document.createElement('img');
            tempImg.index = i;
            tempImg.src = curImg.getAttribute('relSrc'); //临时图片去加载
            tempImg.onload = function (){
                curImg.src = this.src;
                utils.css( curImg,'display','block');
                animate( curImg,{opacity:1},2000);
            };
            tempImg = null;
        })(i);

    }
})();

// 5、轮播图开始
var timer = window.setInterval(autoMove,1000);//这个定时器负责多久更换一次图片
var step = 0; //默认第一张显示
function autoMove(){ //这个方法就是负责轮播的
    if(step === data.length){ //说明是最后一张 也就是第五张图片了
        step=0;
        utils.css(bannerInner,'left',0);
    }
    step++; // 0=>1 那么step++之后的值就是我下一次要运动到的终点，也就是下一张图片的索引
    animate(bannerInner,{left:step*-1000},500); // 500ms必须小于timer这个定时器间隔
    focusAlign();
}

function focusAlign(){ //让焦点和轮播的图对齐
    var tempStep = step;
    tempStep = tempStep === lis.length ? 0 : step;
    for(var i=0; i<lis.length; i++){
        //i === step ? 工具.addClass(lis[i],'selected') : 工具.removeClass(lis[i],'selected');
        lis[i].className = i === tempStep ? 'selected' : '';
    }
}

// 6、给banner绑定事件
banner.onmouseover = function(){
    window.clearInterval(timer); //鼠标悬停清空定时器
    utils.css(left,'display','block');
    utils.css(right,'display','block');
};
banner.onmouseout = function(){
    timer = window.setInterval(autoMove,1000); //鼠标离开继续启动定时器开始轮播。必须要给timer重新赋值,保证下次悬停的时候还能找到这个定时器
/*    工具.css(left,'display','none');
    工具.css(right,'display','none');*/
    left.style.display = right.style.display = 'none';
};

//点击左右按钮切换图片
left.onclick = function(){
    if(step === 0){
        step = data.length; // 4
        utils.css(bannerInner,'left',step*-1000); //直接设置到这个位置
    }
    step--;
    animate(bannerInner,{left:step*-1000},500);
    focusAlign();
};
right.onclick = autoMove;

// 给焦点圈绑定点击事件，当点击的时候切换到对应焦点的图片
;(function bindEvent(){
    for(var i=0; i<lis.length; i++){ //每个焦点框都需要绑定
        var curLi = lis[i];
        curLi.index = i; //给每一个li都要添加一个自定义属性来保存索引，当点击的时候通过this.index来获取这个索引，并且step值就是这个索引
        curLi.onclick = function(){
          /*  if(step === data.length){ //如果点击的那一刻的step是最后一张(看起来是第一张),那么先把整个bannerInner移动到0的位置，然后再去运动到点击焦点对应的那个图的位置
                工具.css(bannerInner,'left',0);
            }*/
            step === data.length && utils.css(bannerInner,'left',0);
            step = this.index; //保证下次轮播还可以从当前点击的这个位置开始
            //工具.css(bannerInner,'left',step*-1000);
            animate(bannerInner,{left:step*-1000},500);
            focusAlign();
        }
    }
})();

