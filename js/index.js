function $(selector) {
    return document.querySelector(selector)
}

function $$(selector) {
    return document.querySelectorAll(selector)
}



//request data
var xhr = new XMLHttpRequest()
xhr.open('GET', '/musicPlayer/json/songlist.json', true)
xhr.send()
xhr.addEventListener('load', function() {
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
        getSongs(JSON.parse(xhr.responseText))
    } else {
        console.log('暂时无法加载')
    }
})
xhr.addEventListener('error', function() {
    console.log('network error')
})

var songObj = new Audio()
var currentPlaying = 0
var playList = []
var random = false

function getSongs(songList) {
    playList = songList
    createSongList(songList)
    loadSong()
}

function createSongList() {
    playList.forEach(function(song, index) {
        var songObj = new Audio(song.url)
        var music = document.createElement('li')
        var name = document.createElement('span')
        var author = document.createElement('span')
        var duringTime = document.createElement('span')
        music.classList.add('music')
        name.classList.add('name')
        name.innerText = song.title
        author.classList.add('author')
        author.innerText = song.author
        duringTime.classList.add('during-time')
        duringTime.innerText = song.duration
        music.appendChild(name)
        music.appendChild(author)
        music.appendChild(duringTime)
        $('.music-list').appendChild(music)
    })
}

function loadSong() {
    songObj.src = playList[currentPlaying].url
    $('.cover-bg').style.backgroundImage = 'url("' + playList[currentPlaying].cover + '")' //注意引号的处理，原文件可能含单引号或双引号,引起错误
    $('.player .cover img').src = playList[currentPlaying].cover
    simpleFadeIn($('.cover-bg'))
    simpleFadeIn($('.player .cover img'))
    $('.detail .title').innerText = playList[currentPlaying].title
    $('.detail .author').innerText = playList[currentPlaying].author
    $('.detail .album').innerText = playList[currentPlaying].album
    $('.detail .index').innerText = currentPlaying + 1
    $('.detail .list').innerText = playList.length
    $('.detail').style.opacity = 1
    addActive()
}


songObj.addEventListener('ended', loadNextSong)

$('.controls').addEventListener('click', function(ev) {
    switch (true) {
        case (ev.target.classList.contains('icon-play')):
            songObj.play()
            ev.target.classList.remove('icon-play')
            ev.target.classList.add('icon-pause')
            break
        case (ev.target.classList.contains('icon-pause')):
            songObj.pause()
            ev.target.classList.remove('icon-pause')
            ev.target.classList.add('icon-play')
            break
        case (ev.target.classList.contains('icon-next')):
            var playBtn = $('#play-btn .iconfont')
            if (playBtn.classList.contains('icon-play')) {
                playBtn.classList.remove('icon-play')
                playBtn.classList.add('icon-pause')
            }
            if (random === false) {
                loadNextSong()
            } else {
                loadRandom()
            }
            break
        case (ev.target.classList.contains('icon-previous')):
            var playBtn = $('#play-btn .iconfont')
            if (playBtn.classList.contains('icon-play')) {
                playBtn.classList.remove('icon-play')
                playBtn.classList.add('icon-pause')
            }
            if (random === false) {
                loadPreviousSong()
            } else {
                loadRandom()
            }
            break
        case (ev.target.classList.contains('icon-random')):
            if (random === false) {
                random = true
                songObj.removeEventListener('ended', loadNextSong)
                songObj.addEventListener('ended', loadRandom)
            } else {
                random = false
                songObj.removeEventListener('ended', loadRandom)
                songObj.addEventListener('ended', loadNextSong)
            }
            $('.icon-random').classList.toggle('active')
            break
        case (ev.target.classList.contains('icon-loop')):
            if (ev.target.classList.contains('active')) {
                songObj.loop = false
            } else {
                songObj.loop = true
            }
            ev.target.classList.toggle('active')
    }
})

$('.music-list').addEventListener('dblclick', function(ev) {
    if ($('#play-btn .iconfont').classList.contains('icon-play')) {
        $('#play-btn .iconfont').classList.remove('icon-play')
        $('#play-btn .iconfont').classList.add('icon-pause')
    }
    var songNodes = $('.music-list').children
    target = ev.target.tagName === 'LI' ? ev.target : ev.target.parentNode
    removeActive()
    currentPlaying = getChildrenIndex(target)
    loadSong()
    songObj.play()
})

$('.player .bar').addEventListener('click', function(ev) {
    var percentage = ev.offsetX / parseInt(getComputedStyle(this).width)
    $('.progress-bar').style.width = percentage * 100 + '%'
    songObj.currentTime = percentage * songObj.duration
})

songObj.addEventListener('timeupdate', function() {
    setTimeout(function() {
        updateProgress()
        setTimeout(arguments.callee, 1000)
    }, 1000)
})



function loadNextSong() {
    removeActive()
    currentPlaying++
    currentPlaying %= playList.length
    loadSong()
    songObj.play()
}

function loadPreviousSong() {
    removeActive()
    currentPlaying--
    currentPlaying = (currentPlaying + playList.length) % playList.length
    loadSong(playList)
    songObj.play()
}
function loadRandom() {
    removeActive()
    oldCurrentPlaying = currentPlaying
    currentPlaying = Math.floor(Math.random() * playList.length)
    if (oldCurrentPlaying === currentPlaying) {
        currentPlaying++
    }
    currentPlaying %= playList.length
    loadSong()
    songObj.play()
}

function removeActive() {
    var song = $('.music-list').children[currentPlaying]
    song.classList.remove('active')
}

function addActive() {
    var song = $('.music-list').children[currentPlaying]
    song.classList.add('active')
}


function updateProgress() {
    var percentage = (songObj.currentTime / songObj.duration) * 100 + '%'
    $('.bar .progress-bar').style.width = percentage
    $('.detail .time').innerText = getCurrentTime()
}



function getCurrentTime() {
    var currentTime = songObj.currentTime
    var minutes = String(Math.floor(currentTime / 60))
    var seconds = String(Math.floor(currentTime % 60))
    minutes = minutes.length === 1 ? '0' + minutes : minutes
    seconds = seconds.length === 1 ? '0' + seconds : seconds
    return minutes + ':' + seconds
}

function simpleFadeIn(node, step, opacityFin) {
    var opacityNow = 0
    opacityFin = opacityFin || 1
    step = step || 0.02
    node.style.opacity = 0
    node.style.display = 'block'

    function _fadeIn() {
        if (opacityNow < opacityFin) {
            node.style.opacity = opacityNow + step
            opacityNow += step
            requestAnimationFrame(_fadeIn)
        }
    }
    _fadeIn()
}

function simpleFadeOut(node, step) {
    var opacityFin = 0
    var opacityNow = 1
    step = step || 0.02

    function _fadeOut() {
        if (opacityNow > opacityFin) {
            node.style.opacity = opacityNow - step
            opacityNow -= step
            requestAnimationFrame(_fadeOut)
        } else {
            node.style.display = 'none'
        }
    }
    _fadeOut()
}

function getChildrenIndex(Node) {
    var index = 0;
    while (Node = Node.previousElementSibling) {
        index++;
    }
    return index;
}
// function simpleFadeIn(node,step){
//     node.style.opacity = 0
//     node.style.display = 'block'
//     function show(){
//       if(node.style.opacity < 1){
//         node.style.opacity  += step
//         requestAnimationFrame(show)
//       }
//     }
//     show()
// }//次函数只会执行一次
