function showFrame(name){
  $('.frame').removeClass('active');
  $('#'+name).addClass('active');
  if (name == 'note') {
    setTimeout(function(){
      showFrame('video-sample');
    }, 4000)
  }
  if (name == 'video-sample') {
    setTimeout(function(){
      var video = $('#video-sample video')[0];
      video.play();
      $('#video-sample .screen-red').fadeOut();
      video.onended = function() {
        showFrame('are-you-ready');
      };
    }, 4000)
  }
}

$(function() {
  var startFrame = 'city-chose';
  
  if (localStorage.getItem('city')) {
    startFrame = 'id-competitor';
    var city_id = localStorage.getItem('city');
    $('#city-chose-selector').val(city_id);
  }
  
  //id-competitor
  $('#id-competitor input').on('keyup', function(){
    var all_input = true;
    $('#id-competitor input').each(function(){
      if ($(this).val()==''){
        all_input = false;
      }
    });
    if (all_input == true) {
      $('#id-competitor button').removeAttr('disabled');
    }
  })
  
  function saveLocal(data){
    console.log(data);
    var _id = localStorage.length+1;
    localStorage.setItem(_id, data);
    console.log(localStorage);
  }
  
  function captureSuccess() {
    //alert('успех');
    showFrame('end');
    setTimeout(function(){
      getVideosInfo(function(yad_name){
        console.log('FINAL!!')
        console.log(yad_name, $('.main-form').serialize()+'&'+$.param({
          yad_name: yad_name
        }));
        serialized = $('.main-form').serialize()+'&'+$.param({
          yad_name: yad_name
        });
        /*_t = setTimeout(function(){
          saveLocal(serialized)
          showFrame('real-end');
        }, 5000);*/
        $.ajax({
          type: 'POST',
          url: 'http://common.dev.grapheme.ru/admin/marlboro/get_info',
          data: serialized,
          success: function(data){
            console.log(data);
            if (data.status == true) {
              //clearTimeout(_t);
            } else {
              saveLocal(serialized)
            }
            showFrame('real-end');
          },
          error: function(data){
            console.log(data);
            saveLocal(serialized);
            showFrame('real-end');
          }
        });
      });
    }, 1000)
  }
  
  function captureError() {
    //alert('ошибка');
  }
  
  function captureVideo() {
    // Launch device video recording application,
    // allowing user to capture up to 2 video clips
    navigator.device.capture.captureVideo(captureSuccess, captureError, {
      limit: 2,
      duration: 30,
      destinationType : Camera.DestinationType.FILE_URI,
      cameraDirection:Camera.Direction.FRONT,
      sourceType: Camera.PictureSourceType.CAMERA,
      mediaType: Camera.MediaType.VIDEO,
      saveToPhotoAlbum: true
    });
  }
  
  function do_sync(){
    //var _all = localStorage.length;
    var _all = 0;
    var _c = 0;
    var _l = localStorage.length;
    var _keys = Object.keys(localStorage);
    if (_keys.length <= 1) {
      navigator.notification.alert('Нет записей для синхронизации.', function(){}, 'Red Race');
      //alert('Нет записей для синхронизации.')
    }
    $.each(_keys, function(index, key){
      console.log(key, index, 1, 'key');
      if (key!='city') {
        $.ajax({
          type: 'POST',
          url: 'http://common.dev.grapheme.ru/admin/marlboro/get_info',
          data: localStorage.getItem(key),
          success: function(data){
            console.log(data.status, 'status');
            if(data.status == true) {
              console.log(key, 2, 'key');
              localStorage.removeItem(key);
              _c = _c+1;
              if (_c == _l-1) {
                navigator.notification.alert('Синхронизировано '+_c+' записей.', function(){}, 'Red Race');
                //alert('Синхронизировано '+_c+' записей.');
              }
            }
          }
        });
      }
    })
    /*for (var key in localStorage){
      
      if (key!='city') {
        $.ajax({
          type: 'POST',
          url: 'http://common.dev.grapheme.ru/admin/marlboro/get_info',
          data: localStorage.getItem(key),
          success: function(data){
            console.log(data.status, 'status');
            if(data.status == true) {
              console.log(key, 2, 'key');
              localStorage.removeItem(key);
              _c = _c+1;
              if (_c == _l-1) {
                alert('Синхронизировано '+_c+' записей.');
              }
            }
          }
        });
      }
    }*/
    //alert('Синхронизировано '+_all+' записей.');
  }
  
  $('a.sync').click(function(){
    do_sync();
  });
  
  function showFrame(name){
    $('.frame').removeClass('active');
    $('#'+name).addClass('active'); 
    if (name == 'note') {
      //setTimeout(function(){
        //showFrame('video-sample');
      //}, 4000)
    }
    if (name == 'video-sample') {
      setTimeout(function(){
        var video = $('#video-sample video')[0];
        video.play();
        $('#video-sample .screen-red').fadeOut();
        video.onended = function() {
          showFrame('are-you-ready');
        };
      }, 4000)
    }
  }
  
  showFrame(startFrame);
  
  $('button, .btn').click(function(e){
    e.preventDefault();
    var href = $(this).attr('data-href');
    showFrame(href);
  });
  
  $('#are-you-ready a.start-rec').click(function(e){
    e.preventDefault();
    captureVideo();
  });
  
  $('#city-chose button').click(function(){
    var city_id = $('#city-chose-selector').val();
    localStorage.setItem('city', city_id);
  });
  
  $('.chose-city').click(function(e){
    e.preventDefault();
    showFrame('city-chose');
  });
  
  function getAllVideos(callback) {
    navigator.assetslib.getAllPhotos(
      function(data){
        //console.log(data)
        callback(data);
      }, 
      function(data){
        console.log(data)
      }
    )
  }
  
  function getVideosUrl(videos){
    var videos_urls = [];
    $.each(videos, function(index, value){
      videos_urls.push(value.url);
    });
    return videos_urls
  }
  
  function parseRawTimestamp(raw){
    raw = raw.split('T');
    var date = raw[0];
    var time = raw[1].split('+')[0];
    
    var raw_date = date.split('-');
    
    var year = raw_date[0];
    var month = raw_date[1];
    var day = raw_date[2];
    
    var raw_time = time.split(':');
    
    var hours = raw_time[0];
    var minutes = raw_time[1];
    var seconds = raw_time[2];
    
    //console.log(year, month, day, hours, minutes, seconds);
    dateObj = new Date(year, month, day, hours, minutes, seconds )
    //console.log(dateObj);
    
    return {
      dateObj: dateObj,
      year: year,
      month: month,
      day: day,
      hours: hours,
      minutes: minutes,
      seconds: seconds
    }
  }
  
  function sortByDate(array){
    array.sort(function(a,b){
      return b.dateObj - a.dateObj;
    });
    return array;
  }
  
  function generateYandexDiskName(date) {
    s = date.year+'-'+date.month+'-'+date.day+' '+
      date.hours+'-'+date.minutes+'-'+date.seconds+'.MOV';
    return s
  }
  
  function getVideosInfo(callback){
    getAllVideos(function(data){
      var videos = data;
      var url_list = getVideosUrl(videos);
      navigator.assetslib.getPhotoMetadata(url_list, function(data){
        date_arr = [];
        //console.log(data, 1)
        
        $.each(data, function(index, value){
          //console.log(value.date, 2);
          date_arr.push(parseRawTimestamp(value.date));
        });
        
        //console.log(sortByDate(date_arr), 'sorted')
        var sorted_arr = sortByDate(date_arr);
        var last_date = sorted_arr[0];
        //alert(last_date.dateObj);
        console.log(last_date, 'final');
        var yad_name = generateYandexDiskName(last_date);
        console.log(yad_name);
        callback(yad_name);
      }, function(data){
        console.log(data, 3);
      })
    });
  }
  $("input[name='patronymic']").mask("+7 (999) 999-9999");
});
/*
var list;
navigator.assetslib.getAllPhotos(function(data){console.log(data);list=data}, function(data){console.log(data)})

navigator.assetslib.getPhotoMetadata([list[0].url], function(data){console.log(data)}, function(data){console.log(data)})*/