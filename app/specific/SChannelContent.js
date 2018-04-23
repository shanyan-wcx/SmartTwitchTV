//Variable initialization
var SChannelContent_cursorY = 0;
var SChannelContent_cursorX = 0;
var SChannelContent_dataEnded = false;
var SChannelContent_itemsCount = 0;
var SChannelContent_imgMatrix = '';
var SChannelContent_imgMatrixId = '';
var SChannelContent_loadingData = false;
var SChannelContent_loadingDataTry = 0;
var SChannelContent_loadingDataTryMax = 10;
var SChannelContent_loadingDataTimeout = 3500;
var SChannelContent_itemsCountOffset = 0;
var SChannelContent_LastClickFinish = true;
var SChannelContent_keyClickDelayTime = 25;
var SChannelContent_skipImg = false;
var SChannelContent_UserChannels = false;
var SChannelContent_TargetName;
var SChannelContent_ids = ['scc_thumbdiv', 'scc_img', 'scc_infodiv', 'scc_name', 'scc_createdon', 'scc_game', 'scc_viwers', 'scc_duration', 'scc_cell', 'sccempty_'];
var SChannelContent_status = false;
var SChannelContent_lastselectedChannel = '';
//Variable initialization end

function SChannelContent_init() {
    Main_Go = Main_SChannelContent;
    if (SChannelContent_lastselectedChannel !== Main_selectedChannel) SChannelContent_status = false;
    Main_cleanTopLabel();
    document.getElementById('top_bar_user').innerHTML = Main_selectedChannelDisplayname;
    document.getElementById('top_bar_game').innerHTML = STR_CHANNEL_CONT;
    document.getElementById('id_agame_name').innerHTML = '';
    document.body.addEventListener("keydown", SChannelContent_handleKeyDown, false);
    AddCode_PlayRequest = false;
    if (SChannelContent_status) {
        Main_ScrollHelper(SChannelContent_ids[0], SChannelContent_cursorY, SChannelContent_cursorX, Main_SChannelContent, Main_ScrollOffSetMinusVideo, Main_ScrollOffSetVideo, false);
        SChannelContent_checkUser();
    } else SChannelContent_StartLoad();
}

function SChannelContent_exit() {
    Main_RestoreTopLabel();
    document.body.removeEventListener("keydown", SChannelContent_handleKeyDown);
}

function SChannelContent_StartLoad() {
    Main_HideWarningDialog();
    SChannelContent_lastselectedChannel = Main_selectedChannel;
    SChannelContent_status = false;
    SChannelContent_skipImg = false;
    Main_ScrollHelperBlank('blank_focus');
    Main_showLoadDialog();
    var table = document.getElementById('stream_table_search_channel_a');
    while (table.firstChild) table.removeChild(table.firstChild);
    SChannelContent_itemsCountOffset = 0;
    SChannelContent_itemsCount = 0;
    SChannelContent_cursorX = 0;
    SChannelContent_cursorY = 0;
    SChannelContent_dataEnded = false;
    SChannelContent_TargetName = undefined;
    SChannelContent_loadDataPrepare();
    SChannelContent_loadDataRequest();
}

function SChannelContent_loadDataPrepare() {
    SChannelContent_imgMatrix = [];
    SChannelContent_imgMatrixId = [];
    SChannelContent_loadingData = true;
    SChannelContent_loadingDataTry = 0;
    SChannelContent_loadingDataTimeout = 3500;
}

function SChannelContent_loadDataRequest() {
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", 'https://api.twitch.tv/kraken/streams/' + encodeURIComponent(SChannelContent_TargetName !== undefined ? SChannelContent_TargetName : Main_selectedChannel) + '?' + Math.round(Math.random() * 1e7), true);
        xmlHttp.timeout = SChannelContent_loadingDataTimeout;
        xmlHttp.setRequestHeader('Client-ID', Main_clientId);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    if (JSON.parse(xmlHttp.responseText).stream !== null) SChannelContent_loadDataSuccess(xmlHttp.responseText);
                    else {
                        SChannelContent_loadDataPrepare();
                        SChannelContent_loadDataCheckHost();
                    }
                    return;
                } else {
                    SChannelContent_loadDataError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        SChannelContent_loadDataError();
    }
}

function SChannelContent_loadDataError() {
    SChannelContent_loadingDataTry++;
    if (SChannelContent_loadingDataTry < SChannelContent_loadingDataTryMax) {
        SChannelContent_loadingDataTimeout += (SChannelContent_loadingDataTry < 5) ? 250 : 3500;
        SChannelContent_loadDataRequest();
    } else SChannelContent_loadDataSuccess(null);
}

function SChannelContent_loadDataCheckHost() {
    try {

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", 'http://tmi.twitch.tv/hosts?include_logins=1&host=' + encodeURIComponent(Main_selectedChannel_id) + '&' + Math.round(Math.random() * 1e7), true);
        xmlHttp.timeout = SChannelContent_loadingDataTimeout;
        xmlHttp.setRequestHeader('Client-ID', Main_clientId);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    SChannelContent_CheckHost(xmlHttp.responseText);
                    return;
                } else SChannelContent_loadDataCheckHostError();
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        SChannelContent_loadDataCheckHostError();
    }
}

function SChannelContent_loadDataCheckHostError() {
    SChannelContent_loadingDataTry++;
    if (SChannelContent_loadingDataTry < SChannelContent_loadingDataTryMax) {
        SChannelContent_loadingDataTimeout += 3500;
        SChannelContent_loadDataCheckHost();
    } else SChannelContent_loadDataSuccess(null);
}

function SChannelContent_CheckHost(responseText) {
    var response = JSON.parse(responseText);
    SChannelContent_TargetName = response.hosts[0].target_login;
    if (SChannelContent_TargetName !== undefined) {
        SChannelContent_loadDataPrepare();
        SChannelContent_loadDataRequest();
    } else SChannelContent_loadDataSuccess(null);
}

function SChannelContent_loadDataSuccess(responseText) {
    var row = document.createElement('tr');
    var coloumn_id = 0;

    if (responseText !== null) {
        var response = JSON.parse(responseText);
        if (response.stream !== null) {
            var hosting = SChannelContent_TargetName !== undefined ? Main_selectedChannelDisplayname + STR_USER_HOSTING : '';
            var stream = response.stream;
            row.appendChild(SChannelContent_createCell('0_' + coloumn_id, stream.channel.name, stream.preview.template,
                stream.channel.status, stream.game, Main_is_playlist(JSON.stringify(stream.stream_type)) +
                hosting + stream.channel.display_name, Main_addCommas(stream.viewers) + STR_VIEWER,
                Main_videoqualitylang(stream.video_height, stream.average_fps, stream.channel.language)));
            coloumn_id++;
        } else SChannelContent_skipImg = true;
    } else SChannelContent_skipImg = true;

    row.appendChild(SChannelContent_createChannelCell('0_' + coloumn_id, Main_selectedChannelDisplayname, Main_selectedChannelDisplayname + STR_PAST_BROA, IMG_BLUR_VIDEO1_16));
    coloumn_id++;
    row.appendChild(SChannelContent_createChannelCell('0_' + coloumn_id, Main_selectedChannelDisplayname, Main_selectedChannelDisplayname + STR_CLIPS, IMG_BLUR_VIDEO2_16));

    if (coloumn_id < 2) {
        coloumn_id++;
        row.appendChild(Main_createEmptyCell(SChannelContent_ids[9] + '0_' + coloumn_id));
    }

    document.getElementById("stream_table_search_channel_a").appendChild(row);

    row = document.createElement('tr');
    row.appendChild(SChannelContent_createFallow('1_0', Main_selectedChannelDisplayname, Main_selectedChannelDisplayname, Main_selectedChannelLogo));
    document.getElementById("stream_table_search_channel_a").appendChild(row);

    SChannelContent_loadDataSuccessFinish();
}

//TODO revise this functions there is too many
function SChannelContent_createCell(id, channel_name, preview_thumbnail, stream_title, stream_game, channel_display_name, viwers, quality) {
    preview_thumbnail = preview_thumbnail.replace("{width}x{height}", Main_VideoSize);

    SChannelContent_imgMatrix.push(preview_thumbnail);
    SChannelContent_imgMatrixId.push(SChannelContent_ids[1] + id);

    Main_td = document.createElement('td');
    Main_td.setAttribute('id', SChannelContent_ids[8] + id);
    Main_td.setAttribute('data-channelname', channel_name);
    Main_td.className = 'stream_cell';
    Main_td.innerHTML = '<div id="' + SChannelContent_ids[0] + id + '" class="stream_thumbnail_video" ><img id="' +
        SChannelContent_ids[1] + id + '" class="stream_img"></div>' +
        '<div id="' + SChannelContent_ids[2] + id + '" class="stream_text">' +
        '<div id="' + SChannelContent_ids[3] + id + '" class="stream_channel">' + channel_display_name + '</div>' +
        '<div id="' + SChannelContent_ids[4] + id + '"class="stream_info">' + stream_title + '</div>' +
        '<div id="' + SChannelContent_ids[5] + id + '"class="stream_info">' + stream_game + '</div>' +
        '<div id="' + SChannelContent_ids[6] + id + '"class="stream_info_games" style="width: 50%; display: inline-block;">' +
        '<i class="icon-circle" style="color: ' +
        (SChannelContent_TargetName !== undefined ? '#FED000' : 'red') + '; font-size: 100%; aria-hidden="true"></i> ' + STR_SPACE + viwers + '</div>' +
        '<div id="' + SChannelContent_ids[7] + id +
        '"class="stream_info" style="width:35%; float: right; display: inline-block;">' + quality + '</div></div>';

    return Main_td;
}

function SChannelContent_createChannelCell(id, user_name, stream_type, preview_thumbnail) {
    SChannelContent_imgMatrix.push(preview_thumbnail);
    SChannelContent_imgMatrixId.push(SChannelContent_ids[1] + id);

    Main_td = document.createElement('td');
    Main_td.setAttribute('id', SChannelContent_ids[8] + id);
    Main_td.setAttribute('data-channelname', user_name);
    Main_td.className = 'stream_cell';
    Main_td.innerHTML = '<div id="' + SChannelContent_ids[0] + id + '" class="stream_thumbnail_video" ><img id="' + SChannelContent_ids[1] +
        id + '" class="stream_img"></div>' +
        '<div id="' + SChannelContent_ids[2] + id + '" class="stream_text">' +
        '<div id="' + SChannelContent_ids[3] + id + '" class="stream_channel">' + stream_type + '</div>' +
        '<div id="' + SChannelContent_ids[4] + id + '"class="stream_info hide"></div>' +
        '<div id="' + SChannelContent_ids[5] + id + '"class="stream_info hide"></div>' +
        '<div id="' + SChannelContent_ids[6] + id + '"class="stream_info hide" ></div>' +
        '<div id="' + SChannelContent_ids[7] + id + '"class="stream_info hide"></div></div>';

    return Main_td;
}

function SChannelContent_createFallow(id, user_name, stream_type, preview_thumbnail) {
    SChannelContent_imgMatrix.push(preview_thumbnail);
    SChannelContent_imgMatrixId.push(SChannelContent_ids[1] + id);

    Main_td = document.createElement('td');
    Main_td.setAttribute('id', SChannelContent_ids[8] + id);
    Main_td.setAttribute('data-channelname', user_name);
    Main_td.className = 'stream_cell';
    Main_td.innerHTML = '<div id="' + SChannelContent_ids[0] + id +
        '" class="stream_thumbnail_video" ><div id="schannel_cont_heart" style="position: absolute; top: 5%; left: 6%;"></div><img id="' +
        SChannelContent_ids[1] + id + '" class="stream_img_fallow"></div>' +
        '<div id="' + SChannelContent_ids[2] + id + '" class="stream_text">' +
        '<div id="' + SChannelContent_ids[3] + id + '" class="stream_channel">' + stream_type + '</div>' +
        '<div id="' + SChannelContent_ids[4] + id + '"class="stream_info hide"></div>' +
        '<div id="' + SChannelContent_ids[5] + id + '"class="stream_info">' + Main_addCommas(Main_selectedChannelViews) +
        STR_VIEWS + '</div>' +
        '<div id="' + SChannelContent_ids[6] + id + '"class="stream_info" >' + Main_addCommas(Main_selectedChannelFallower) + STR_FALLOWERS + '</div>' +
        '<div id="' + SChannelContent_ids[7] + id + '"class="stream_info hide"></div></div>';

    return Main_td;
}

function SChannelContent_setFallow() {
    if (AddCode_IsFallowing) {
        document.getElementById("schannel_cont_heart").innerHTML = '<i class="icon-heart" style="color: #00b300; font-size: 1200%; text-shadow: #FFFFFF 0px 0px 10px, #FFFFFF 0px 0px 10px, #FFFFFF 0px 0px 8px;"></i>';
        document.getElementById(SChannelContent_ids[3] + "1_0").innerHTML = Main_selectedChannelDisplayname + STR_FALLOWING;
    } else {
        document.getElementById("schannel_cont_heart").innerHTML = '<i class="icon-heart-o" style="color: #FFFFFF; font-size: 1200%; text-shadow: #000000 0px 0px 10px, #000000 0px 0px 10px, #000000 0px 0px 8px;"></i>';
        if (Main_UserName !== '') document.getElementById(SChannelContent_ids[3] + "1_0").innerHTML = Main_selectedChannelDisplayname + STR_FALLOW;
        else document.getElementById(SChannelContent_ids[3] + "1_0").innerHTML = Main_selectedChannelDisplayname + STR_CANT_FALLOW;
    }
}

function SChannelContent_loadDataSuccessFinish() {
    $(document).ready(function() {
        if (!SChannelContent_status) {
            Main_HideLoadDialog();
            SChannelContent_status = true;
            SChannelContent_addFocus();
            Main_ScrollHelper(SChannelContent_ids[0], SChannelContent_cursorY, SChannelContent_cursorX, Main_SChannelContent, Main_ScrollOffSetMinusVideo, Main_ScrollOffSetVideo, false);
        }
        SChannelContent_checkUser();
        Main_LoadImages(SChannelContent_imgMatrix, SChannelContent_imgMatrixId, IMG_404_VIDEO);
        SChannelContent_loadingData = false;
    });
}

function SChannelContent_checkUser() {
    if (SChannelContent_UserChannels) SChannelContent_setFallow();
    else if (Main_UserName !== '') {
        AddCode_userChannel = Main_selectedChannel_id;
        AddCode_PlayRequest = false;
        AddCode_CheckFallow();
    } else {
        AddCode_IsFallowing = false;
        SChannelContent_setFallow();
    }
}

function SChannelContent_addFocus() {
    var id = SChannelContent_cursorY + '_' + (!SChannelContent_cursorY ? SChannelContent_cursorX : 0);
    document.getElementById(SChannelContent_ids[0] + id).classList.add(Main_classThumb);
    document.getElementById(SChannelContent_ids[2] + id).classList.add(Main_classText);
    document.getElementById(SChannelContent_ids[3] + id).classList.add(Main_classInfo);
    document.getElementById(SChannelContent_ids[4] + id).classList.add(Main_classInfo);
    document.getElementById(SChannelContent_ids[5] + id).classList.add(Main_classInfo);
    document.getElementById(SChannelContent_ids[6] + id).classList.add(Main_classInfo);
    document.getElementById(SChannelContent_ids[7] + id).classList.add(Main_classInfo);
}

function SChannelContent_removeFocus() {
    Main_removeFocusVideoArray(SChannelContent_cursorY + '_' + (!SChannelContent_cursorY ? SChannelContent_cursorX : 0), SChannelContent_ids);
}

function SChannelContent_keyClickDelay() {
    SChannelContent_LastClickFinish = true;
}

function SChannelContent_keyEnter() {
    if (SChannelContent_cursorY) {
        if (AddCode_OauthToken !== '') {
            AddCode_PlayRequest = false;
            AddCode_userChannel = Main_selectedChannel_id;
            if (AddCode_IsFallowing) AddCode_UnFallow();
            else AddCode_Fallow();
        } else {
            Main_showWarningDialog(STR_NOKEY_WARN);
            window.setTimeout(Main_HideWarningDialog, 2000);
        }
    } else {
        document.body.removeEventListener("keydown", SChannelContent_handleKeyDown);
        var value = (!SChannelContent_skipImg ? 0 : 1);
        if (SChannelContent_cursorX === (0 - value)) {
            Play_selectedChannel = document.getElementById(SChannelContent_ids[8] + SChannelContent_cursorY +
                '_' + SChannelContent_cursorX).getAttribute('data-channelname');
            Play_selectedChannelDisplayname = document.getElementById(SChannelContent_ids[3] + SChannelContent_cursorY +
                '_' + SChannelContent_cursorX).textContent;
            if (Play_selectedChannelDisplayname.indexOf(STR_USER_HOSTING) !== -1) Play_selectedChannelDisplayname = Play_selectedChannelDisplayname.split(STR_USER_HOSTING)[1];
            Main_openStream();
        } else if (SChannelContent_cursorX === (1 - value)) Svod_init();
        else if (SChannelContent_cursorX === (2 - value)) Sclip_init();
    }
}

function SChannelContent_handleKeyDown(event) {
    if (SChannelContent_loadingData) {
        event.preventDefault();
        return;
    } else if (!SChannelContent_LastClickFinish) {
        event.preventDefault();
        return;
    } else {
        SChannelContent_LastClickFinish = false;
        window.setTimeout(SChannelContent_keyClickDelay, SChannelContent_keyClickDelayTime);
    }

    switch (event.keyCode) {
        case KEY_RETURN:
            if (Main_isAboutDialogShown()) Main_HideAboutDialog();
            else if (Main_isControlsDialogShown()) Main_HideControlsDialog();
            else {
                if (Main_Before === Main_Svod || Main_Before === Main_Sclip || Main_Before === Main_SChannelContent) {
                    Main_Go = SChannels_isLastSChannels ? Main_SChannels : Main_UserChannels;
                    SChannels_isLastSChannels = false;
                } else Main_Go = Main_Before;
                SChannelContent_exit();
                Main_SwitchScreen();
            }
            break;
        case KEY_LEFT:
            SChannelContent_removeFocus();
            SChannelContent_cursorX--;
            if (SChannelContent_cursorX < 0) SChannelContent_cursorX = (!SChannelContent_skipImg ? 2 : 1);
            SChannelContent_addFocus();
            break;
        case KEY_RIGHT:
            SChannelContent_removeFocus();
            SChannelContent_cursorX++;
            if (SChannelContent_cursorX > (!SChannelContent_skipImg ? 2 : 1)) SChannelContent_cursorX = 0;
            SChannelContent_addFocus();
            break;
        case KEY_UP:
        case KEY_DOWN:
            SChannelContent_removeFocus();
            SChannelContent_cursorY = !SChannelContent_cursorY ? 1 : 0;
            SChannelContent_addFocus();
            break;
        case KEY_INFO:
        case KEY_CHANNELGUIDE:
            SChannelContent_StartLoad();
            break;
        case KEY_PLAY:
        case KEY_PAUSE:
        case KEY_PLAYPAUSE:
        case KEY_ENTER:
            SChannelContent_keyEnter();
            break;
        case KEY_RED:
            Main_showAboutDialog();
            break;
        case KEY_GREEN:
            SChannelContent_exit();
            Main_GoLive();
            break;
        case KEY_YELLOW:
            Main_showControlsDialog();
            break;
        case KEY_BLUE:
            Main_BeforeSearch = Main_SChannelContent;
            Main_Go = Main_Search;
            Main_RestoreTopLabel();
            document.body.removeEventListener("keydown", SChannelContent_handleKeyDown);
            Main_SwitchScreen();
            break;
        default:
            break;
    }
}