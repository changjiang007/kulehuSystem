(function($){var reEscape=new RegExp('(\\'+['/','.','*','+','?','|','(',')','[',']','{','}','\\'].join('|\\')+')','g');function fnFormatResult(value,data,currentValue){var pattern='('+currentValue.replace(reEscape,'\\$1')+')';return value.replace(new RegExp(pattern,'gi'),'<strong>$1<\/strong>');}
$("#keyword-input").bind({focus:function(){if(this.value==""){addCookieSuggest();}else{q=this.value;}}})
function Autocomplete(el,options){this.el=$(el);this.el.attr('autocomplete','off');this.suggestions=[];this.data=[];this.badQueries=[];this.selectedIndex=-1;this.currentValue=this.el.val();this.intervalId=0;this.cachedResponse=[];this.onChangeInterval=null;this.ignoreValueChange=false;this.serviceUrl=options.serviceUrl;this.isOuter=options.isOuter;this.isLocal=false;this.options={autoSubmit:false,minChars:1,maxHeight:476,deferRequestBy:0,width:0,highlight:true,params:{},fnFormatResult:fnFormatResult,delimiter:null,zIndex:9999};this.initialize();this.setOptions(options);}
$.fn.autocomplete=function(options){return new Autocomplete(this.get(0)||$('<input />'),options);};Autocomplete.prototype={killerFn:null,initialize:function(){var me,uid,autocompleteElId;me=this;uid=Math.floor(Math.random()*0x100000).toString(16);autocompleteElId='Autocomplete_'+uid;this.killerFn=function(e){if($(e.target).parents('.autocomplete').size()===0){me.killSuggestions();me.disableKillerFn();}};if(!this.options.width){this.options.width=this.el.parent().width()-2;}
this.mainContainerId='AutocompleteContainter_'+uid;$('<div id="'+this.mainContainerId+'" style="position:absolute;z-index:9999999;"><div class="autocomplete-w1"><div class="autocomplete" id="'+autocompleteElId+'" style="display:none; width:310px;"></div></div></div>').appendTo('body');this.container=$('#'+autocompleteElId);this.fixPosition();if(window.opera){this.el.keypress(function(e){me.onKeyPress(e);});}else{this.el.keydown(function(e){me.onKeyPress(e);});}
this.el.keyup(function(e){me.onKeyUp(e);});this.el.blur(function(){me.enableKillerFn();});this.el.focus(function(){me.fixPosition();});this.changeTypeName();},setOptions:function(options){var o=this.options;$.extend(o,options);if(o.lookup){this.isLocal=true;if($.isArray(o.lookup)){o.lookup={suggestions:o.lookup,data:[]};}}
$('#'+this.mainContainerId).css({zIndex:o.zIndex});this.container.css({maxHeight:o.maxHeight+'px',width:o.width});},clearCache:function(){this.cachedResponse=[];this.badQueries=[];},disable:function(){this.disabled=true;},enable:function(){this.disabled=false;},fixPosition:function(){var offset=this.el.offset();$('#'+this.mainContainerId).css({top:(offset.top+this.el.innerHeight()+4)+'px',left:offset.left+'px'});},enableKillerFn:function(){var me=this;$(document).bind('click',me.killerFn);},disableKillerFn:function(){var me=this;$(document).unbind('click',me.killerFn);},killSuggestions:function(){var me=this;this.stopKillSuggestions();this.intervalId=window.setInterval(function(){me.hide();me.stopKillSuggestions();},300);},stopKillSuggestions:function(){window.clearInterval(this.intervalId);},onKeyPress:function(e){if(this.disabled||!this.enabled){return;}
switch(e.keyCode){case 27:this.el.val(this.currentValue);this.hide();break;case 9:case 13:if(this.selectedIndex===-1){this.hide();return;}
this.select(this.selectedIndex);if(e.keyCode===9){return;}
break;case 38:this.moveUp();break;case 40:this.moveDown();break;default:return;}
e.stopImmediatePropagation();e.preventDefault();},onKeyUp:function(e){if(this.disabled){return;}
switch(e.keyCode){case 38:case 40:return;}
clearInterval(this.onChangeInterval);if(this.currentValue!==this.el.val()){if(this.options.deferRequestBy>0){var me=this;this.onChangeInterval=setInterval(function(){me.onValueChange();},this.options.deferRequestBy);}else{this.onValueChange();}}},onValueChange:function(){clearInterval(this.onChangeInterval);this.currentValue=this.el.val();var q=this.getQuery(this.currentValue);this.selectedIndex=-1;if(this.ignoreValueChange){this.ignoreValueChange=false;return;}
if(q===''||q.length<this.options.minChars){this.hide();}else{this.getSuggestions(q);}},getQuery:function(val){var d,arr;d=this.options.delimiter;if(!d){return $.trim(val);}
arr=val.split(d);return $.trim(arr[arr.length-1]);},getSuggestionsLocal:function(q){var ret,arr,len,val,i;arr=this.options.lookup;len=arr.suggestions.length;ret={suggestions:[],data:[]};q=q.toLowerCase();for(i=0;i<len;i++){val=arr.suggestions[i];if(val.toLowerCase().indexOf(q)===0){ret.suggestions.push(val);ret.data.push(arr.data[i]);}}
return ret;},getSuggestions:function(q){var cr,me;cr=this.isLocal?this.getSuggestionsLocal(q):this.cachedResponse[q];if(cr&&$.isArray(cr.suggestions)){this.suggestions=cr.suggestions;this.data=cr.data;this.suggest();}else if(!this.isBadQuery(q)){me=this;me.options.params.query=q;var t=this.isAllProduct();me.options.params.type=t;if(this.isOuter){var url=this.serviceUrl+"?query="+q+"&t="+t+"&format=json&jsoncallback=?";$.getJSON(url,function(json){me.processResponse(json);});}else{$.get(this.serviceUrl,me.options.params,function(txt){me.processResponse(txt);},'text');}}},isBadQuery:function(q){var i=this.badQueries.length;while(i--){if(q.indexOf(this.badQueries[i])===0){return true;}}
return false;},hide:function(){this.enabled=false;this.selectedIndex=-1;this.container.hide();},suggest:function(){if(this.suggestions.length===0){this.hide();return;}
var me,len,div,f,v,i,s,mOver,mClick;me=this;len=this.suggestions.length;f=this.options.fnFormatResult;v=this.getQuery(this.currentValue);mOver=function(xi){return function(){me.activate(xi);};};mClick=function(xi){return function(){}};this.container.hide().empty();var prod_type=this.isAllProduct();for(i=0;i<len;i++){s=this.suggestions[i];if(prod_type==""&&s.type==0){if(i==0){div=$((me.selectedIndex===i?'<div class="selected resultbox"':'<div class="resultbox"')+' title="'+s.key_word+'"><a href="'+s.keyUrl+'" target="_self"><div class="left1">'+f(s.key_word,this.data[i].key_word,v)+'</div><div class="right">'+'约'+s.product_count+'个结果'+'</div></a></div>');}else{div=$((me.selectedIndex===i?'<div class="selected resultbox"':'<div class="resultbox"')+' title="'+s.key_word+'"><a href="'+s.keyUrl+'" target="_self"><div class="left2"> 查看</div><div class="left3"> '+f(s.key_word,this.data[i].key_word,v)+'</div><div class="left4">'+s.product_type+'</div><div class="right">'+'约'+s.product_count+'个结果'+'</div></a></div>');}}else{div=$((me.selectedIndex===i?'<div class="selected resultbox"':'<div class="resultbox"')+' title="'+s.key_word+'"><a href="'+s.keyUrl+'" target="_self"><div class="left1">'+f(s.key_word,this.data[i].key_word,v)+'</div><div class="right">'+'约'+s.product_count+'个结果'+'</div></a></div>');}
div.mouseover(mOver(i));div.click(mClick(i));this.container.append(div);}
this.enabled=true;this.container.show();},processResponse:function(text){var response;if(this.isOuter){response=text;}else{try{response=eval('('+text+')');}catch(err){return;}}
if(!$.isArray(response.data)){response.data=[];}
if(!this.options.noCache){this.cachedResponse[response.query]=response;if(response.suggestions.length===0){this.badQueries.push(response.query);}}
if(response.query===this.getQuery(this.currentValue)){this.suggestions=response.suggestions;this.data=response.data;this.suggest();}},activate:function(index){var divs,activeItem;divs=this.container.children();if(this.selectedIndex!==-1&&divs.length>this.selectedIndex){$(divs.get(this.selectedIndex)).removeClass("selected");}
this.selectedIndex=index;if(this.selectedIndex!==-1&&divs.length>this.selectedIndex){activeItem=divs.get(this.selectedIndex);$(activeItem).addClass('selected');}
return activeItem;},deactivate:function(div,index){div.className='resultbox';if(this.selectedIndex===index){this.selectedIndex=-1;}},select:function(i){var selectedValue,f;selectedValue=this.suggestions[i].key_word;if(selectedValue){this.el.val(selectedValue);if(this.options.autoSubmit){f=this.el.parents('form');if(f.length>0){f.get(0).submit();}}
this.ignoreValueChange=true;this.hide();this.onSelect(i);}},moveUp:function(){if(this.selectedIndex===-1){return;}
if(this.selectedIndex===0){this.container.children().get(0).className='resultbox';this.selectedIndex=-1;this.el.val(this.currentValue);return;}
this.adjustScroll(this.selectedIndex-1);},moveDown:function(){if(this.selectedIndex===(this.suggestions.length-1)){return;}
this.adjustScroll(this.selectedIndex+1);},adjustScroll:function(i){var activeItem,offsetTop,upperBound,lowerBound;activeItem=this.activate(i);offsetTop=activeItem.offsetTop;upperBound=this.container.scrollTop();lowerBound=upperBound+this.options.maxHeight-25;if(offsetTop<upperBound){this.container.scrollTop(offsetTop);}else if(offsetTop>lowerBound){this.container.scrollTop(offsetTop-this.options.maxHeight+25);}
this.el.val(this.getValue(this.suggestions[i].key_word));},onSelect:function(i){var me,fn,s,d;me=this;fn=me.options.onSelect;s=me.suggestions[i].key_word;d=me.data[i].key_word;me.el.val(me.getValue(s));if($.isFunction(fn)){fn(i);}},getValue:function(value){var del,currVal,arr,me;me=this;del=me.options.delimiter;if(!del){return value;}
currVal=me.currentValue;arr=currVal.split(del);if(arr.length===1){return value;}
return currVal.substr(0,currVal.length-arr[arr.length-1].length)+value;},isAllProduct:function(){var typename=this.el.attr("data");return typename;},changeTypeName:function(){var me=this;$("#typename").mouseover(function(){$(".tn_search_bar").css("display","block");$("#spic").css("background","url(http://img1.tuniucdn.com/site/images/index/up.jpg) center right no-repeat");});$("#typename").mouseout(function(){$(".tn_search_bar").css("display","none");$("#spic").css("background","url(http://img1.tuniucdn.com/site/images/index/down.jpg) center right no-repeat");})
$("#typename").find(".type_s").click(function(){me.clearCache();$(this).siblings().show();var temp=$(this).index();var s=$(this).text();var t=$("#typename span").text();var keyword=$("#keyword-input");$("#typename span").text(s);if($.trim(s)=="所有产品"){keyword.attr("data","");}else if($.trim(s)=="跟团游"){keyword.attr("data",1);}else if($.trim(s)=="自助游"){keyword.attr("data",2);}else if($.trim(s)=="酒店"){keyword.attr("data",3);}else if($.trim(s)=="机票"){keyword.attr("data",4);}else if($.trim(s)=="团队游"){keyword.attr("data",5);}else if($.trim(s)=="景点门票"){keyword.attr("data",6);}else if($.trim(s)=="保险"){keyword.attr("data",7);}else if($.trim(s)=="自驾游"){keyword.attr("data",8);}else if($.trim(s)=="签证"){keyword.attr("data",9);}else if($.trim(s)=="邮轮"){keyword.attr("data",10);}else if($.trim(s)=="火车票"){keyword.attr("data",11);}
$("#typename .tn_search_bar").hide();$(this).hide();});}};}(jQuery));;$(function($){watchFunction();});function mousehover(){$(".list_suggest").hover(function(){var prevTrIndex=$("#prevTrIndex").val();if(prevTrIndex>0){$("#list_suggest_"+prevTrIndex).removeClass("hover");}
$(this).addClass("hover");var num=$(this).prop("id").split("list_suggest_");$("#prevTrIndex").val(num[1]);},function(){$(this).removeClass("hover");});$("#autoCompleteDivNew").hover(function(){$(".tn_s_input").data("overSuggest",true);},function(){$(".tn_s_input").data("overSuggest",false);$("#autoCompleteDivNew").remove();});};function mouseClick(){$(".search_record_delete").click(function(){var q=$(this).prev().text();mainUrl=getUrl();var url=mainUrl+"/remove_cookie?query="+q
+"&format=json&jsoncallback=?";$.getJSON(url);setTimeout("$('#keyword-input').focus()",500);});$(".search_record").click(function(){var q=$(this).text();$("#keyword-input").val(q);$("#autoCompleteDivNew").remove();$("#route_search").submit();});}
function clickTr(currTrIndex){var prevTrIndex=$("#prevTrIndex").val();if(currTrIndex>0){$("#list_suggest_"+currTrIndex).addClass("hover");}
if(prevTrIndex>0){$("#list_suggest_"+prevTrIndex).removeClass("hover");}
$("#prevTrIndex").val(currTrIndex);};function replaceValue(num){$("#keyword-input").val($("#search_record_"+num).text());}
function addCookieSuggest(){$("#autoCompleteDivNew").remove();if($("#keyword-input").val()==''){mainUrl=getUrl();var url=mainUrl+"/search_cookie?format=json&jsoncallback=?";$.getJSON(url,function(json){$("#autoCompleteDivNew").remove();if(json.length>0&&$("#keyword-input").is(":focus")){$("<div class='autoCompleteDivNew' id='autoCompleteDivNew'><input type='hidden' name='prevTrIndex' id='prevTrIndex' value='0' />"
+"<input type='hidden' name='preValue' id='preValue' value='"
+$("#keyword-input").val()
+"'/></div>").appendTo($("#keyword-input").parent());for(var i=0;i<json.length;i++){$("<div class='list_suggest' id='list_suggest_"
+(i+1)
+"'><div class='search_record' id='search_record_"
+(i+1)
+"'>"
+json[i]
+"</div><div class='search_record_delete'>删除</div></div>").appendTo($("#autoCompleteDivNew"));}
mousehover();mouseClick();}});}}
function addSearchCookie(){mainUrl=getUrl();var q=encodeURI($("#keyword-input").val());var url=mainUrl+"/add_cookie?query="+q
+"&format=json&jsoncallback=?";$.getJSON(url);}
function addSearchCookies(q){mainUrl=getUrl();var url=mainUrl+"/add_cookie?query="+encodeURI(q)
+"&format=json&jsoncallback=?";$.getJSON(url);}
function getUrl(){var host=window.location.host;var hostList=host.split(".");hostList.splice(0,1,'http://s');var url=hostList.join(".");return url;}
function watchFunction(){$("#keyword-input").keydown(function(event){var trSize=$(".list_suggest").size();var prevTrIndex=parseInt($("#prevTrIndex").val());if(event.keyCode==38&&$("#preValue").val()==''){if(prevTrIndex==0){replaceValue(trSize);clickTr(trSize);}else if(prevTrIndex==1){$("#keyword-input").val($("#preValue").val());clickTr(prevTrIndex-1);}else{replaceValue(prevTrIndex-1);clickTr(prevTrIndex-1);}
return false;}else if(event.keyCode==40&&$("#preValue").val()==''){if(prevTrIndex==trSize){$("#keyword-input").val($("#preValue").val());clickTr(0);}else{replaceValue(prevTrIndex+1);clickTr(prevTrIndex+1);}
return false;}else if((event.keyCode==37||event.keyCode==39)&&$("#preValue").val()==''){$("#autoCompleteDivNew").remove();}else if(event.keyCode==13&&$("#preValue").val()==''){replaceValue(prevTrIndex);$("#autoCompleteDivNew").remove();$("#route_search").submit();}});$("#keyword-input").data("suggst",$("#keyword-input").val());$("#keyword-input").bind({focus:function(){if(this.value==$("#keyword-input").data("suggst")){this.value="";}
this.style.color="#000";addCookieSuggest();},blur:function(){if(this.value==""){this.value=$("#keyword-input").data("suggst");this.style.color="#999";}
if(!$(".tn_s_input").data("overSuggest")){$("#autoCompleteDivNew").remove();}}});if($.browser.msie){$("#keyword-input").keyup(function(event){var keyCode=event.keyCode;if($.browser.msie&&((keyCode>=48&&keyCode<=57)||(keyCode>=65&&keyCode<=90)||(keyCode>=96&&keyCode<=105)||keyCode==46||keyCode==8)){addCookieSuggest();}});}else{$("#keyword-input").bind({'input propertychange':function(){addCookieSuggest();}});}
$("#route_search").submit(function(){var base_url=getUrl();var q=$('#keyword-input').val();q=$.trim(q);if(q==null||q==''||q=='请输入目的地或编号'){window.location.href=base_url;}else{$('#q').val(q);$('#route_search').attr("target",'_self');$('#check_route_hi').html('');}});$(".resultbox").live('click',function(){return false;});$(".resultbox").live('click',function(){link=$(this).children(":first").attr('href');$("#keyword-input").val($(this).attr('title'));addSearchCookie();setTimeout("jumpOut()",700);});}
function jumpOut(){window.location.href=link;}
function searchTip(){var autocomplete_options,autocomplete_a;var host=window.location.host;var hostList=host.split(".");hostList.splice(0,1,'http://s');var base_url=hostList.join(".");var complex=$("#from_action").val();$('#keyword-input').change(function(){$('#st').val(1);});autocomplete_options={serviceUrl:base_url+'/suggest',onSelect:autocomplete_onselect,isOuter:true};autocomplete_a=$('#keyword-input').autocomplete(autocomplete_options);function autocomplete_onselect(i){var autocomplete=$(".autocomplete-w1").find(".resultbox");var autocomplete_href=autocomplete.eq(i).find("a").attr("href");window.open(autocomplete_href,"_self");}
$("#keyword-input").keyup(function(){if($(this).val()!=''){$("#q").val($(this).val());}});}
var submit;function delay(e){submit=false;if(navigator.userAgent.indexOf("Firefox")>0){if(e&&e.preventDefault){e.preventDefault();}}
addSearchCookie();setTimeout("do_route_search()",700);return submit;}
function do_route_search(){var q=$('#keyword-input').val();q=$.trim(q);if(q==null||q==''||q=='请输入目的地或编号'){window.location.href=base_url;}else{if(!isNaN(q)){q=Math.abs(q);$('#route_search').attr("action",'http://www.tuniu.com/main.php');$('#route_search').attr("target",'_blank');$('#check_route_hi').html('<input type="hidden" value="check_route_id" name="do"/><input type="hidden" value="'+q+'" name="r_id" id="check_route_r_id"/>');document.forms["route_search"].submit();submit=true;}else{var type=$("#keyword-input").attr('data');var base_url='http://s.tuniu.com';var action='search_complex';if(type==1){action='search_route';}else if(type==2){action='search_package';}else if(type==3){action='search_hotel';}else if(type==6){action='search_ticket';}else if(type==12){action='search_cruise';}
var url=base_url+"/"+action;$('#route_search').attr('action',url);document.forms["route_search"].submit();$('#check_route_hi').html('');submit=true;}}}
$(function(){searchTip();});