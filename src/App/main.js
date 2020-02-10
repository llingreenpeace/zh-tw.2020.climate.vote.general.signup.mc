import './all.css'
import './main.css'

// import * as $ from 'jquery'
// import jquery_validation from 'jquery-validation'
// import Cookies from 'js-cookie'
// import autosize from 'autosize'
// import anime from 'animejs/lib/anime.es.js';
// import Highcharts from 'highcharts';

import "./static/plugins.1.js"
import "./static/plugins.2.js"

const {$, anime, autosize, Cookies, Highcharts} = window

var base_url = 'https://dev.do2.documentonready.com/greenpeace-ipcc/';
var options_id = 'en__field_supporter_questions_288643';
var free_text_id = 'en__field_supporter_questions_288644';
var email_optin_id = 'en__field_supporter_questions_2738';
var nro_data_ok_id = '';

var resultData = []

$(() => {
	console.log('DOM.ready')
})

// $.extend($.validator.messages, {
// 	required: "此項為必填",
// });

$(function () {
	$('.next-btn').click(function () {
		console.log('Vote');

		// $('#voting .option .vote-btn.checked').each(function(k,v) {
		// 	var title = $(v).data('title');
		// 	console.log(title);
		// 	ga('send', 'event', 'ipcc_reason', 'vote', title);
		// });

		// fbq('track', 'ViewContent', {
		// 	content_name: '2018-ipcc',
		// 	content_category: 'IPCCVoteForReasons'
		// });

	});

})

$(function(){
	var scrollTo= function(t, s){
	  $("html, body").stop().animate({scrollTop:t}, s, 'swing', function() { });
	},
	pageHandler = {
		goTo: function(to, from){
			this.hide(to,from);
		},
		hide: function(to, from){
			if(from == '#voting'){
				votingPage.hide().then(() => {pageHandler.show(to, from)})
			}
			else if(from == '#form'){
				formPage.hide().then(() => {pageHandler.show(to, from)})
			}
			else{
				pageHandler.show(to, from)
			}
		},
		show: function(to, from){
			$(to).addClass('in');
			$(from).removeClass('active');
			if(to == '#voting'){
				votingPage.show().then(() => {$(to).addClass('active').removeClass('in');})
			}
			else if(to == '#form'){
				formPage.show().then(() => {$(to).addClass('active').removeClass('in');})
			}
			else{
				$(to).addClass('active').removeClass('in');
			}
			scrollTo(0,0);
		}
	},
	votingPage = {
		count: 0,
		active: false,
		$container: null,
		istyping: false,
		init: function(){
			var _ = this;

			_.$container = $('#voting');
			_.$container.find('.option .vote-btn').click(function(e){
				e.preventDefault();
				e.stopPropagation();
				if($(this).hasClass('checked')){
					$(this).removeClass('checked');
					if(_.count<=3){
						_.$container.find('.options').removeClass('full');
					}
					_.count--;
				}
				else{
					if(_.count >=2){
						_.$container.find('.options').addClass('full');
					}
					if(_.count<3){
						$(this).addClass('checked');
						_.count++;
					}
				}
				if(_.count >0){
					_.$container.find('.next-btn').addClass('show').find('.count').text(_.count);
				}
				else{
					_.$container.find('.next-btn').removeClass('show').find('.count').text(_.count);
				}
			}).end().find('#details .vote').click(function(e){
				if(_.count >= 3 && !$(this).find('.vote-btn').hasClass('checked')) return;
				$(this).find('.vote-btn').toggleClass('checked');
				$('#'+$(this).data('option')+' .vote-btn').trigger('click');

			}).end().find('.readmore').click(function(e){
				e.preventDefault();
				_.showDetail($(this).parents('.option:first'));

			}).end().find('#overlay, #details .close-btn').click(function(e){
				e.preventDefault();
				_.$container.removeClass('detail');
			}).end().find('.option').click(function(e){
				e.preventDefault();
				_.showDetail($(this));
			});
			_.$container.find('.next-btn').click(function(e){
				e.preventDefault();

				$('#voting .option .vote-btn.checked').each(function(k,v) {
					var title = $(v).data('title')
					window.dataLayer.push({'event': title});
				});

				pageHandler.goTo('#form', '#voting');
			}).end().find('.typing-btn').click(function(e){
				e.preventDefault();
				_.showTyping();
			});
			autosize($('#typing-panel textarea').get(0));
			$('#type-next-btn').click(function(e){
				e.preventDefault();
				var text = $.trim($('#typing-panel textarea').val());
				if(text !== ''){
					_.resetTyping();
					$('#'+free_text_id).val(text);
					window.dataLayer.push({'custom_vote': text});
					pageHandler.goTo('#form', '#voting');
				}
				else{
					alert('please enter your #ReasonsForHope');
					$('#typing-panel textarea').focus();
				}
			});
			var keys = [192, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 189, 187, 8, 9, 16, 17, 18, 91, 32, 93, 18, 37, 40, 39, 38, 188, 190, 191, 186, 222, 16, 13, 219, 221, 220];
			$('body').keyup(function(e) {
				if(!votingPage.active) return;
				if(e.keyCode == 27 && _.istyping){
					_.resetTyping();
				}
				else if(!_.istyping && keys.indexOf(e.keyCode) == -1){
					_.showTyping();
				}
			});
			$('#typing-panel .close-btn').bind('click', function(e){
				e.preventDefault();
				_.resetTyping();
			});
			$('#typing-panel textarea').bind('input', function(){
				var val =  $(this).val();
				val = val.replace(/^\s+/g, "");//$.trim($(this).val());
				if(_.istyping && val.length >200){
					$('#typing-panel textarea').val(val.substring(0,200));
				}
				else{
					$('#typing-panel textarea').val(val);
				}
			});
		},
		resetTyping: function(){
			$('body').removeClass('typing');
			this.istyping = false;
		},
		showTyping: function(){
			$('body').addClass('typing');
			$('#typing-panel textarea').focus();
			this.istyping = true;
		},
		showDetail: function($option){
			var $detail = $('#details'), _ = this;
			$detail.find('.img').css('backgroundImage', 'url('+$option.data('img')+')').find('h2').text($option.find('.title').text()).end().end().find('.content').html($option.find('.desc').html()).end().find('.vote').data('option', $option.attr('id')).find('.vote-btn').toggleClass('checked', $option.find('.vote-btn').hasClass('checked'));
			_.$container.addClass('detail');
			setTimeout(function(){
				$('#detail').animate({scrollTop:0}, 0);
			}, 500);
		},
		show: function(){
			return new Promise((resolve, reject) => {
			var votingTimeline = anime.timeline({
				easing: 'easeOutQuart',
				complete: function(anim) {
				  votingPage.active = true;
				  $('body').removeClass('intro');
			      resolve();
			    }
			});

			votingTimeline
			  .add({
			    targets: '#voting',
			    opacity: 1,
			    duration: 200
			  }).add({
			    targets: '#voting .sp-title .word',
			    translateY: [30, 0],
			    rotate: ['.02turn', '-0turn'],
			    opacity:[0,1],
			    duration: 700,
			    delay: function(el, i, l) {
			      return (i * 25);
			    },
			    offset: 0,
			  })
			  .add({
			    targets: '#voting .left-col .out',
			    translateY: [60, 0],
			    opacity:[0,1],
			    duration: 700,
			    delay: function(el, i, l) {
			      return 300+(i * 25);
			    },
			    offset: '-=850' // Starts 600ms before the previous animation ends
			  })
			  .add({
			    targets: '#voting .options .out',
				  translateY: [90, 0],
				  opacity:[0,1],
				  delay: function(el, i, l) {
				    return (i * 115);
				  },
			    offset: '-=550' // Starts 800ms before the previous animation ends
			  }).add({
			    targets: '#voting .option .title',
				  translateY: [30, 0],
				  opacity: [0, 1],
				  duration: 700,
				  delay: function(el, i, l) {
				    return (i * 115);
				  },
			      offset: 750 // Starts 800ms before the previous animation ends
			  });

			});
		},
		hide: function(){
			return new Promise((resolve, reject) => {
				votingPage.active = false;
				 anime({
				  targets: '#voting',
				  opacity: [1, 0],
				  easing: 'easeInOutExpo',
				  duration: 400,
				  complete: function(){
				  	resolve();
				  }
				});
			});
		}
	},
	formPage = {
		$container: null,
		map_init: false,
		init: function(){
			var _ = this;
			_.$container = $('#form');
			_.$container.find('input, select').bind('change blur', function(){
				if($(this).attr('id') == 'fake_optin') {
					if(document.getElementById('fake_optin').checked){
						$('#local_optin_wrapper').show();
					} else {
						$('#local_optin_wrapper').hide();
					}
				}
				if($(this).val() !== ''){
					console.log('filled');
					$(this).addClass('filled');
				}
				else{
					$(this).removeClass('filled');
				}
			});
			_.$container.find('button').click(function(e){
				e.preventDefault();
				$("#fake-form").submit();
			}).end().find('.back-btn').click(function(e){
				e.preventDefault();
				pageHandler.goTo('#voting', '#form');
			});
			$.validator.addMethod( //override email with django email validator regex - fringe cases: "user@admin.state.in..us" or "name@website.a"
		        'email',
		        function(value, element){
		            return this.optional(element) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/i.test(value);
		        },
		        'Please enter valid email.'
		    );
			$("#fake-form").validate({
				errorPlacement: function(error, element) {
					element.parents("div.form-field:first").after( error );
				},
				submitHandler: function(form) {
					// do other things for a valid form
					var temp = [];
					window.dataLayer.push({'event': 'petitionSignup'});
					$('#voting .option .vote-btn.checked').each(function(k,v) {
						var id = $(v).data('id');
						temp.push(id);
					});
					Cookies.set('checked_options', temp);
					$('#'+options_id).val(temp.join());
					$('#en__field_supporter_firstName').val($('#fake_supporter_firstName').val());
					$('#en__field_supporter_lastName').val($('#fake_supporter_lastName').val());
					$('#en__field_supporter_emailAddress').val($('#fake_supporter_emailAddress').val());
					$('#en__field_supporter_country').val($('#fake_supporter_country').val());

					if(document.getElementById('fake_optin').checked) {
						$('#'+email_optin_id).prop( "checked", true );
					} else {
						$('#'+email_optin_id).prop( "checked", false );
					}
					if($('#fake_local_optin').length>0 && document.getElementById('fake_local_optin').checked) {
						$('#'+nro_data_ok_id).prop( "checked", true ).prop("disabled", false);
					} else {
						$('#'+nro_data_ok_id).prop( "checked", false );
					}
					$("form.en__component--page").submit();
				},
				invalidHandler: function(event, validator) {
					// 'this' refers to the form
					var errors = validator.numberOfInvalids();
					if (errors) {
						var message = errors == 1
							? 'You missed 1 field. It has been highlighted'
							: 'You missed ' + errors + ' fields. They have been highlighted';
						alert(message);
						$("div.error").show();
					} else {
						$("div.error").hide();
					}
				}
			});
		},
		init_iframe: function(){
			if(this.map_init) return;
			var $el = $('#map iframe');
			$el.attr('src', $el.data('src'));
			this.map_init = true;
		},
		show: function(){
			return new Promise((resolve, reject) => {
			var formTL = anime.timeline({
				easing: 'easeOutQuart',
				complete: function(anim) {
				  formPage.init_iframe();
			      resolve();
			    }
			});

			formTL
			  .add({
			    targets: '#form',
			    opacity: [0, 1],
			    duration: 200
			  })
			  .add({
			    targets: '#form .sp-title .word',
			    translateY: [30, 0],
			    rotate: ['.02turn', '-0turn'],
			    opacity:[0,1],
			    duration: 700,
			    delay: function(el, i, l) {
			      return (i * 25);
			    },
			    offset: 0,
			  })
			  .add({
			    targets: '#form .left-col .out',
			    translateY: [60, 0],
			    opacity:[0,1],
			    duration: 700,
			    delay: function(el, i, l) {
			      return 300+(i * 25);
			    },
			    offset: '-=850' // Starts 600ms before the previous animation ends
			  });

			});
		},
		hide: function(){
			return new Promise((resolve, reject) => {
				anime({
				  targets: '#form',
				  opacity: [1, 0],
				  easing: 'easeInOutExpo',
				  duration: 400,
				  complete: function(){
				  	resolve();
				  }
				});
			});
		}
	},
	resultPage = {
		init: function(){
			$('body').removeClass('intro');
			var checked_options = Cookies.getJSON('checked_options');
			if(typeof(checked_options) != "undefined") {
				for(var i=0; i<checked_options.length; i++){
					resultData[checked_options[i]][2] = true;
					resultData[checked_options[i]][3] = true;
				};
			} else {
				resultData[0][2] = true;
				resultData[0][3] = true;
			}
			Highcharts.chart('chart', {
			    chart: {
			        plotBackgroundColor: null,
			        plotBorderWidth: null,
			        plotShadow: false,
			        type: 'pie',
			        spacing: [0, 0,0,0]
			    },
			    title: {
			        text: ''
			    },
			    tooltip: {
			        borderWidth: 0,
			        borderRadius: 0,
			        pointFormat: '',
			        followPointer: true
			    },
			    plotOptions: {
			        series: {

			        },
			        pie: {
			            allowPointSelect: true,
			            cursor: 'pointer',
			            dataLabels: {
			                enabled: true,
			                softConnector: false,
			                format: '{point.percentage:.1f}%',
			                distance: -40,
			                filter: {
			                  property: 'percentage',
			                  operator: '>',
			                  value: 4
			                },
			                style: {
			                  fontSize: '15px',
			                  color: '#fff'
			                }
			            }
			        }
			    },
			    series: [{
			        name: 'Reasons for Hope on climate change',
			        colorByPoint: true,
			        keys: [
			            'name', 'y', 'sliced', 'selected', 'color.pattern.image', 'color.pattern.aspectRatio'
			        ],
			        states: {
		                hover: {
		            		halo: false
		                }
		            },
			        data: resultData,
			    }]
			});
		    this.show();
		},
		show: function(){
			return new Promise((resolve, reject) => {
			var formTL = anime.timeline({
				easing: 'easeOutQuart',
				complete: function(anim) {
			      resolve();
			    }
			});

			formTL
			  .add({
			    targets: '#result .sp-title .word',
			    translateY: [30, 0],
			    rotate: ['.02turn', '-0turn'],
			    opacity:1,
			    duration: 700,
			    delay: function(el, i, l) {
			      return (i * 25);
			    },
			  })
			  .add({
			    targets: '#result .left-col .out',
			    translateY: [60, 0],
			    opacity:[0,1],
			    duration: 700,
			    delay: function(el, i, l) {
			      return 300+(i * 25);
			    },
			    offset: '-=850' // Starts 600ms before the previous animation ends
			  });

			});
		}
	},
	introPage = {
		introTL: null,
		active: true,
		init: function(){
			var _ = this;
			_.resize();
			$('body').on('touchmove', function(e){
				return (_.active)? false: true;
			});
			$('#skip').click(function(e){
				e.preventDefault();
				_.introTL.seek(_.introTL.duration);
				pageHandler.goTo('#voting', '#intro');
			});
			_.show();
		},
		resize: function(){
			$('body').css('height', $(window).height());
		},
		show: function(){
			var _ = this;
			return new Promise((resolve, reject) => {
			_.introTL = anime.timeline({
				easing: 'easeOutQuart',
				complete: function(anim) {
				  _.active = false;
			      resolve();
			    }
			});
			$('#pause').click(function(){_.introTL.pause(); });
			$('#play').click(function(){_.introTL.play();});
			var m = 400;
			_.introTL
			  .add({
			    targets: '#globe',
			    scale: [.85, 1],
			    opacity:{
			    	value: [0,1],
			    	duration: 2300
			    },
			    duration: 7500+m,
			  }).add({
			    targets: '#globe .after',
			    opacity: 1,
			    duration: 9000+m,
			    offset: 2400
			  }).add({
			    targets: '#intro .f1 .out',
			    // translateY: [30, 0],
			    opacity:[0,1],
			    duration: 800,
			    delay: function(el, i, l) {
			      return 300+(i * 1005);
			    },
			    offset: 100 // Starts 600ms before the previous animation ends
			  }).add({
			    targets: '#intro .f1 .out',
			    opacity:0,
			    duration: 400,
			    delay: function(el, i, l) {
			      return 300+(i * 505);
			    },
			    offset: 2300+m // Starts 600ms before the previous animation ends
			  }).add({
			    targets: '#bg1 > .out',
			    opacity:[0,.8],
			    duration: 5800,
			    delay: function(el, i, l) {
			      return 300+(i * 300);
			    },
			    offset: 2600+m
			  })
			  .add({
			    targets: '#intro .f2 .out',
			    // translateY: [30, 0],
			    opacity:[0,1],
			    duration: 800,
			    delay: function(el, i, l) {
			      return 300+(i * 1005);
			    },
			    offset: 2960+m // Starts 600ms before the previous animation ends
			  }).add({
			    targets: '#bg1',
			    // translateY: [30, 0],
			    opacity:[1,0],
			    duration: 4000,
			    offset: 5860+m+m // Starts 600ms before the previous animation ends
			  }).add({
			    targets: '#intro .f2 .out',
			    // translateY: [30, 0],
			    opacity:[1,0],
			    duration: 400,
			    delay: function(el, i, l) {
			      return 300+(i * 505);
			    },
			    offset: 6560+m+m // Starts 600ms before the previous animation ends
			  }).add({
			    targets: '#green-bg',
			    // translateY: [30, 0],
			    opacity: 1,
			    duration: 4000,
			    offset: 5860+m+m // Starts 600ms before the previous animation ends
			  }).add({
			    targets: '#intro .f3 .out',
			    // translateY: [30, 0],
			    opacity:1,
			    duration: 800,
			    delay: function(el, i, l) {
			      return 300+(i * 1505);
			    },
			    complete: function(){
			    	$('#bg2').css('display', 'block');
			    	setTimeout(function(){
			    		$('#bg2').addClass('show');
			    		$('#green-bg').addClass('hide');
			    	}, 1300);
			    },
			    offset: 6920+m+m // Starts 600ms before the previous animation ends
			  }).add({
			    targets: '#intro .f3 .out',
			    // translateY: [30, 0],
			    opacity:0,
			    duration: 800,
			    offset: 10620+m+m // Starts 600ms before the previous animation ends
			  })
			  .add({
			    targets: '#intro .f4 .out',
			    // translateY: [30, 0],
			    opacity:1,
			    duration: 800,
			    delay: function(el, i, l) {
			      return 300+(i * 1505);
			    },
			    offset: 10880+m+m+m // Starts 600ms before the previous animation ends
			  }).add({
			    targets: '#green-bg2',
			    // translateY: [30, 0],
			    opacity: 1,
			    complete: function(){
			    	pageHandler.goTo('#voting', '#intro');
			    },
			    duration: 4000+m,
			    offset: 14880+m+m // Starts 600ms before the previous animation ends
			  })


			});
		}
	};
	if($('#voting').length == 1){
		votingPage.init();
		formPage.init();
	}
	$(window).load(function(){
		scrollTo(0,0);
		setTimeout(function(){
			scrollTo(0,0);
			if($('#intro').length == 1) introPage.init();
			if($('#result').length == 1) {
				$.getJSON("https://dev.do2.documentonready.com/greenpeace-ipcc/result.php?callback=?", function(data) {
					// console.log(data);
					for(var i = 0 ; i<data.length ; i++) {
						resultData[i][1] = data[i];
					}
					resultPage.init();
				});
			}
			// $('body').removeClass('intro');
			// $('#voting').addClass('in');
			// pageHandler.goTo('#voting', '#intro');

		}, 400);
	}).resize(function(){
		if(introPage.active) introPage.resize();
	});
});