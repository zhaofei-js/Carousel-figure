/**
 * Created by sym on 2016/10/26.
 */
;(function (){
    // callback : 回调函数，当运动到达终点之后要执行的函数
    function animate(ele,target,duration,callback){
        duration = duration || 2000;
        var interval = 10;
        var time = 0;
        var begin ={};
        var change = {};
        var effect = {
            Linear : function(t,b,c,d){
                return b + t/d*c;
            }
        };
        for(var key in target){
            begin[key] = utils.css(ele,key);
            change[key] = target[key] - begin[key];
        }
        ele.timer && window.clearInterval(ele.timer); //前面条件成立时执行后面代码
        ele.timer = window.setInterval(function(){
            time += interval;
            if(time >= duration){
                window.clearInterval(ele.timer);
                utils.css(ele,target);
                if(typeof callback === 'function'){
                    callback.call(ele); //callback函数在这里执行 函数中的this是window
                    // 把回调函数中的this修改成运动的那个元素(ele)
                }
                return;
            }
            for(var key in change){
                if(change[key]){
                    var val = effect.Linear(time,begin[key],change[key],duration);
                    utils.css(ele,key,val);
                }
            }
        },interval)
    }
    window.animate = animate; //把这个私有函数animate添加到全局的animate属性上，这是主动暴露接口
})();

