//Variable initialization
var Chat_LoadGlobal = false;
var Chat_loadingDataTry = 0;
var Chat_Messages = [];
var Chat_MessagesNext = [];
var Chat_loadingDataTryMax = 10;
var Chat_addlines;
var Chat_next = null;
var Chat_loadChatId;
var Chat_loadChatNextId;
var Chat_loadChatOffsetId;
var Chat_offset = 0;
var defaultColors = ["#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50", "#9ACD32", "#FF4500", "#6BC81E", "#DAA520", "#D2691E", "#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"];
var Chat_div;
var Chat_Position = 0;
//Variable initialization end

//This js is a adaptation of https://www.nightdev.com/kapchat/ functions
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOMContentLoaded");
    Chat_loadBadgesGlobal();
});

function Chat_Preinit() {
    console.log("DOMContentLoaded");
    Chat_div = document.getElementById('chat_box');
    Chat_loadBadgesGlobal();
}

function Chat_Init() {
    console.log("DOMContentLoaded");
    if (!Chat_LoadGlobal) Chat_loadBadgesGlobal();
    Chat_Clear();
    Main_ready(Chat_loadBadgesChannel);
}

function transformBadges(sets) {
    return Object.keys(sets).map(function(b) {
        var badge = sets[b];
        badge.type = b;
        badge.versions = Object.keys(sets[b].versions).map(function(v) {
            var version = sets[b].versions[v];
            version.type = v;
            return version;
        });
        return badge;
    });
}

function tagCSS(type, version, url, addToHead) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.' + type + '-' + version + ' { background-image: url("' + url.replace('http:', 'https:') + '"); }';
    if (addToHead) document.head.appendChild(style);
    else Chat_div.appendChild(style);
}

function Chat_loadBadgesGlobal() {
    console.log("Chat_loadBadgesGlobal");
    Chat_loadingDataTry = 0;
    Chat_LoadGlobal = false;
    Chat_loadBadgesGlobalRequest();
}

function Chat_loadBadgesGlobalRequest() {
    console.log("Chat_loadBadgesGlobalRequest");
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", 'https://badges.twitch.tv/v1/badges/global/display', true);
        xmlHttp.timeout = 10000;
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    Chat_loadBadgesGlobalSuccess(xmlHttp.responseText);
                    return;
                } else {
                    Chat_loadBadgesGlobalError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        Chat_loadBadgesGlobalError();
    }
}

function Chat_loadBadgesGlobalError() {
    console.log("Chat_loadBadgesGlobalError");
    Chat_loadingDataTry++;
    if (Chat_loadingDataTry < Chat_loadingDataTryMax) Chat_loadBadgesGlobalRequest();
    else Chat_LoadGlobal = false;
}

function Chat_loadBadgesGlobalSuccess(responseText) {
    console.log("Chat_loadBadgesGlobalSuccess");

    transformBadges(JSON.parse(responseText).badge_sets).forEach(function(badge) {
        badge.versions.forEach(function(version) {
            tagCSS(badge.type, version.type, version.image_url_4x, true);
        });
    });
    Chat_LoadGlobal = true;
}

function Chat_loadBadgesChannel() {
    console.log("Chat_loadBadgesChannel");
    Chat_loadingDataTry = 0;
    Chat_loadBadgesChannelRequest();
}

function Chat_loadBadgesChannelRequest() {
    console.log("Chat_loadBadgesChannelRequest");
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", 'https://badges.twitch.tv/v1/badges/channels/' + Main_selectedChannel_id + '/display', true);
        xmlHttp.timeout = 10000;
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    Chat_loadBadgesChannelSuccess(xmlHttp.responseText);
                    return;
                } else {
                    Chat_loadBadgesChannelError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        Chat_loadBadgesChannelError();
    }
}

function Chat_loadBadgesChannelError() {
    console.log("Chat_loadBadgesChannelError");
    Chat_loadingDataTry++;
    if (Chat_loadingDataTry < Chat_loadingDataTryMax) Chat_loadBadgesChannelRequest();
    else window.setTimeout(Chat_loadBadgesChannelRequest, 2500);
}

function Chat_loadBadgesChannelSuccess(responseText) {
    console.log("Chat_loadBadgesChannelSuccess");

    transformBadges(JSON.parse(responseText).badge_sets).forEach(function(badge) {
        badge.versions.forEach(function(version) {
            tagCSS(badge.type, version.type, version.image_url_4x, false);
        });
    });
    Chat_loadChat();
}

function Chat_loadChat() {
    console.log("Chat_loadChat");
    Chat_loadingDataTry = 0;
    Chat_loadChatRequest();
}

function Chat_loadChatRequest() {
    console.log("Chat_loadChatRequest");
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", 'https://api.twitch.tv/v5/videos/' + ChannelVod_vodId +
            '/comments?client_id=' + Main_clientId, true);
        xmlHttp.timeout = 10000;
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    Chat_loadChatSuccess(xmlHttp.responseText);
                    return;
                } else {
                    Chat_loadChatError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        Chat_loadChatError();
    }
}

function Chat_loadChatError() {
    console.log("Chat_loadChatError");
    Chat_loadingDataTry++;
    if (Chat_loadingDataTry < Chat_loadingDataTryMax) Chat_loadChatRequest();
    else Chat_loadChatId = window.setTimeout(Chat_loadChatRequest, 2500);
}

function Chat_loadChatSuccess(responseText) {
    console.log("Chat_loadChatSuccess");
    responseText = JSON.parse(responseText);
    var div, mmessage, next_bool = (Chat_next === null);

    if (next_bool) {
        div = '&nbsp;';
        Chat_MessageVector(div, 0);
    }

    Chat_next = responseText._next;

    responseText.comments.forEach(function(comments) {
        div = '';
        mmessage = comments.message;

        //Add badges
        if (mmessage.hasOwnProperty('user_badges')) {
            mmessage.user_badges.forEach(function(badges) {
                div += '<span class="' + badges._id + '-' + badges.version + ' tag"></span>';
            });
        }

        //Add nick
        div += '<span class="nick" style="color: ' + defaultColors[(comments.commenter.display_name).charCodeAt(0) % 15] + ';">' + comments.commenter.display_name + '</span>&#58;&nbsp;';

        //Add mesage
        div += '<span class="message">';
        mmessage.fragments.forEach(function(fragments) {
            if (fragments.hasOwnProperty('emoticon')) div += '<img class="emoticon" src="https://static-cdn.jtvnw.net/emoticons/v1/' + fragments.emoticon.emoticon_id + '/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/' + fragments.emoticon.emoticon_id + '/2.0 2x, https://static-cdn.jtvnw.net/emoticons/v1/' + fragments.emoticon.emoticon_id + '/3.0 4x">';
            else div += fragments.text;
        });
        div += '</span>';
        if (next_bool) Chat_MessageVector(div, comments.content_offset_seconds);
        else Chat_MessageVectorNext(div, comments.content_offset_seconds);
    });
    if (next_bool) {
        Chat_Play();
        Chat_loadChatNext();
    }
}

function Chat_MessageVector(message, time) {
    Chat_Messages.push({
        'time': Math.floor(time),
        'message': message
    });
}

function Chat_MessageVectorNext(message, time) {
    Chat_MessagesNext.push({
        'time': Math.floor(time),
        'message': message
    });
}

function Chat_Play() {
    Chat_addlines = window.setInterval(function() {
        Main_Addline();
        Chat_div.scrollTop = Chat_div.scrollHeight;
    }, 250);
}

function Chat_Pause() {
    window.clearInterval(Chat_addlines);
    window.clearInterval(Chat_loadChatId);
    window.clearInterval(Chat_loadChatNextId);
    window.clearInterval(Chat_loadChatOffsetId);
}

function Chat_Clear() {
    // on exit cleanup the div
    Main_empty('chat_box');
    Chat_Pause();
    Chat_next = null;
    Chat_Messages = [];
    Chat_MessagesNext = [];
    Chat_Position = 0;
}

function Main_Addline() {
    var elem, i;
    if (Chat_Position < (Chat_Messages.length - 1)) {
        for (i = Chat_Position; i < Chat_Messages.length; i++, Chat_Position++) {
            if (Chat_Messages[i].time < (PlayVod_currentTime / 1000)) {
                elem = document.createElement('div');
                elem.className = 'chat_line';
                elem.innerHTML = Chat_Messages[i].message;

                Chat_div.appendChild(elem);
            } else {
                break;
            }
        }
    } else {

        Chat_Pause();
        Chat_Messages = Chat_MessagesNext.slice();
        Chat_Position = 0;
        Chat_Play();
        Chat_MessagesNext = [];

        Chat_loadChatNext();

        //delete old lines out of view
        var linesToDelete = document.getElementsByClassName("chat_line");
        if ((linesToDelete.length - 100) > 0) {
            for (i = 0; i < (linesToDelete.length - 100); i++) {
                linesToDelete[0].parentNode.removeChild(linesToDelete[0]);
            }
        }
        Chat_div.scrollTop = Chat_div.scrollHeight;
    }
}

function Chat_loadChatNext() {
    console.log("Chat_loadChatNext");
    Chat_loadingDataTry = 0;
    Chat_loadChatNextRequest();
}

function Chat_loadChatNextRequest() {
    console.log("Chat_loadChatNextRequest");
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", 'https://api.twitch.tv/v5/videos/' + ChannelVod_vodId +
            '/comments?client_id=' + Main_clientId + (Chat_next !== null ? '&cursor=' + Chat_next : ''), true);
        xmlHttp.timeout = 10000;
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    Chat_loadChatSuccess(xmlHttp.responseText);
                    return;
                } else {
                    Chat_loadChatNextError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        Chat_loadChatNextError();
    }
}

function Chat_loadChatNextError() {
    console.log("Chat_loadChatNextError");
    Chat_loadingDataTry++;
    if (Chat_loadingDataTry < Chat_loadingDataTryMax) Chat_loadChatNextRequest();
    else Chat_loadChatNextId = window.setTimeout(Chat_loadChatNextRequest, 2500);
}

function Chat_loadChatOffset(offset) {
    console.log("Chat_loadChatOffset");
    Chat_Clear();
    Chat_offset = offset;
    Chat_loadingDataTry = 0;
    Chat_loadChatOffsetRequest();
}

function Chat_loadChatOffsetRequest() {
    console.log("Chat_loadChatOffsetRequest");
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", 'https://api.twitch.tv/v5/videos/' + ChannelVod_vodId +
            '/comments?client_id=' + Main_clientId + '&content_offset_seconds=' + Chat_offset, true);
        xmlHttp.timeout = 10000;
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    Chat_loadChatSuccess(xmlHttp.responseText);
                    return;
                } else {
                    Chat_loadChatOffsetError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        Chat_loadChatOffsetError();
    }
}

function Chat_loadChatOffsetError() {
    console.log("Chat_loadChatOffsetError");
    Chat_loadingDataTry++;
    if (Chat_loadingDataTry < Chat_loadingDataTryMax) Chat_loadChatOffsetRequest();
    else Chat_loadChatOffsetId = window.setTimeout(Chat_loadChatOffsetRequest, 2500);
}