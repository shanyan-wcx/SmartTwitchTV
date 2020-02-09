var UserLiveFeedobj_loadErrorCallback;

//Global
var UserLiveFeedobj_AGamesPos = 0;
var UserLiveFeedobj_GamesPos = 1;
var UserLiveFeedobj_FeaturedPos = 2;
var UserLiveFeedobj_CurrentGamePos = 3;
var UserLiveFeedobj_LivePos = 4;
//User
var UserLiveFeedobj_UserLivePos = 5;
var UserLiveFeedobj_UserHostPos = 6;
var UserLiveFeedobj_UserGamesPos = 7;
var UserLiveFeedobj_UserAGamesPos = 8;

var UserLiveFeed_FeedPosX = UserLiveFeedobj_UserLivePos;//Default pos
var UserLiveFeedobj_MAX = UserLiveFeedobj_UserGamesPos;
var UserLiveFeedobj_MAX_No_user = UserLiveFeedobj_LivePos;

function UserLiveFeedobj_StartDefault(pos) {
    if (UserLiveFeed_status[pos]) {
        if (UserLiveFeed_ThumbNull(pos + '_' + UserLiveFeed_FeedPosY[pos], UserLiveFeed_ids[0]))
            UserLiveFeed_LastPos[pos] = JSON.parse(document.getElementById(UserLiveFeed_ids[8] + pos + '_' + UserLiveFeed_FeedPosY[pos]).getAttribute(Main_DataAttribute))[6];
    } else {
        UserSidePannel_LastPos[pos] = null;
        UserLiveFeed_LastPos[pos] = null;
    }

    UserLiveFeed_ImgObj[pos] = [];
    UserLiveFeed_itemsCount[pos] = 0;
    Main_empty(UserLiveFeed_obj[pos].div);
    UserLiveFeed_status[pos] = false;
    document.getElementById(UserLiveFeed_obj[pos].div).style.left = "0.125em";
    UserLiveFeed_FeedPosY[pos] = 0;
    UserLiveFeed_idObject[pos] = {};

    Main_updateclock();
    Main_ShowElement('dialog_loading_side_feed');
    if (UserLiveFeed_isFeedShow()) {
        Main_RemoveClass(UserLiveFeed_obj[pos].div,
            pos === UserLiveFeedobj_UserLivePos ? 'opacity_zero' : 'hide');
    }
}

function UserLiveFeedobj_CheckToken() {
    if (UserLiveFeed_status[UserLiveFeed_FeedPosX]) {
        if (UserLiveFeed_ThumbNull(Sidepannel_PosFeed, UserLiveFeed_side_ids[0]))
            UserSidePannel_LastPos[UserLiveFeedobj_UserLivePos] = JSON.parse(document.getElementById(UserLiveFeed_side_ids[8] + Sidepannel_PosFeed).getAttribute(Main_DataAttribute))[6];
    }
    UserLiveFeed_ImgSideObj = [];
    UserLiveFeed_PreloadImgs = [];
    Sidepannel_PosFeed = 0;
    Main_empty('side_panel_holder');
    document.getElementById('side_panel_warn').style.display = 'none';
    Main_HideElement('side_panel_feed_thumb');
    UserLiveFeed_loadChannelOffsset = 0;
    UserLiveFeed_followerChannels = '';

    UserLiveFeedobj_StartDefault(UserLiveFeedobj_UserLivePos);

    UserLiveFeed_token = AddUser_UsernameArray[0].access_token;
    if (UserLiveFeed_token) {
        UserLiveFeed_token = Main_OAuth + UserLiveFeed_token;
        UserLiveFeedobj_loadChannelUserLive();
    } else {
        UserLiveFeedobj_loadDataPrepare();
        UserLiveFeed_token = null;
        UserLiveFeedobj_loadChannels();
    }
}

function UserLiveFeedobj_loadDataPrepare() {
    UserLiveFeed_loadingData = true;
    UserLiveFeed_loadingDataTry = 0;
    UserLiveFeed_loadingDataTimeout = 3500;
}

function UserLiveFeedobj_loadChannels() {
    var theUrl = Main_kraken_api + 'users/' + encodeURIComponent(AddUser_UsernameArray[0].id) +
        '/follows/channels?limit=100&offset=' + UserLiveFeed_loadChannelOffsset + '&sortby=created_at' + Main_TwithcV5Flag;

    UserLiveFeedobj_loadErrorCallback = UserLiveFeedobj_loadChannels;

    if (Main_IsNotBrowser && UserLiveFeed_isFeedShow()) BaseAndroidhttpGet(theUrl, UserLiveFeed_loadingDataTimeout, 2, null, UserLiveFeedobj_loadChannelLive, UserLiveFeedobj_loadDataError);
    else BasexmlHttpGet(theUrl, UserLiveFeed_loadingDataTimeout, 2, null, UserLiveFeedobj_loadChannelLive, UserLiveFeedobj_loadDataError);
}

function UserLiveFeedobj_loadDataError() {
    UserLiveFeed_loadingDataTry++;
    if (UserLiveFeed_loadingDataTry < UserLiveFeed_loadingDataTryMax) {
        UserLiveFeed_loadingDataTimeout += 500;
        UserLiveFeedobj_loadErrorCallback();
    } else {
        UserLiveFeed_loadingData = false;
        UserLiveFeed_Showloading(false);
        Main_HideElement('dialog_loading_side_feed');

        if (UserLiveFeed_isFeedShow()) {
            Main_innerHTML(UserLiveFeed_obj[UserLiveFeed_FeedPosX].div,
                '<div style="color: #FFFFFF;text-align: center;vertical-align: middle;margin-bottom: 7%;font-size: 150%;"> ' + STR_REFRESH_PROBLEM + '</div>');
        }
    }
}

function UserLiveFeedobj_loadChannelLive(responseText) {
    var response = JSON.parse(responseText).follows,
        response_items = response.length;

    if (response_items) { // response_items here is not always 99 because banned channels, so check until it is 0
        var ChannelTemp = '',
            x = 0;

        for (x; x < response_items; x++) {
            ChannelTemp = response[x].channel._id + ',';
            if (!Main_A_includes_B(UserLiveFeed_followerChannels, ChannelTemp)) UserLiveFeed_followerChannels += ChannelTemp;
        }

        UserLiveFeed_loadChannelOffsset += response_items;
        UserLiveFeedobj_loadDataPrepare();
        UserLiveFeedobj_loadChannels();
    } else { // end
        UserLiveFeed_followerChannels = UserLiveFeed_followerChannels.slice(0, -1);
        UserLiveFeedobj_loadDataPrepare();
        UserLiveFeedobj_loadChannelUserLive();
    }
}

function UserLiveFeedobj_loadChannelUserLive() {
    var theUrl = Main_kraken_api + 'streams/';

    if (UserLiveFeed_token) {
        theUrl += 'followed?';
    } else {
        theUrl += '?channel=' + encodeURIComponent(UserLiveFeed_followerChannels) + '&';
    }
    theUrl += 'limit=100&offset=0&stream_type=all' + Main_TwithcV5Flag;

    UserLiveFeedobj_loadErrorCallback = UserLiveFeedobj_loadChannelUserLive;
    UserLiveFeedobj_loadChannelUserLiveGet(theUrl);
}

function UserLiveFeedobj_loadChannelUserLiveGet(theUrl) {
    var xmlHttp;

    if (Main_IsNotBrowser && UserLiveFeed_isFeedShow()) {
        xmlHttp = Android.mreadUrl(theUrl, UserLiveFeed_loadingDataTimeout, UserLiveFeed_token ? 3 : 2, UserLiveFeed_token);

        if (xmlHttp) UserLiveFeedobj_loadChannelUserLiveGetEnd(JSON.parse(xmlHttp));
        else {
            UserLiveFeedobj_loadDataError();
            return;
        }

    }
    else {
        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, true);
        xmlHttp.timeout = UserLiveFeed_loadingDataTimeout;

        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.setRequestHeader(Main_AcceptHeader, Main_TwithcV5Json);
        if (UserLiveFeed_token) xmlHttp.setRequestHeader(Main_Authorization, UserLiveFeed_token);

        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) UserLiveFeedobj_loadChannelUserLiveGetEnd(xmlHttp);
        };

        xmlHttp.send(null);
    }
}

function UserLiveFeedobj_loadChannelUserLiveGetEnd(xmlHttp) {
    if (xmlHttp.status === 200) {
        UserLiveFeedobj_loadDataSuccess(xmlHttp.responseText);
    } else if (UserLiveFeed_token && (xmlHttp.status === 401 || xmlHttp.status === 403)) { //token expired
        //Token has change or because is new or because it is invalid because user delete in twitch settings
        // so callbackFuncOK and callbackFuncNOK must be the same to recheck the token
        AddCode_refreshTokens(0, 0, UserLiveFeedobj_CheckToken, UserLiveFeedobj_loadDataRefreshTokenError);
    } else {
        UserLiveFeedobj_loadDataError();
    }
}

function UserLiveFeedobj_loadDataRefreshTokenError() {
    if (!AddUser_UsernameArray[0].access_token) UserLiveFeedobj_CheckToken();
    else UserLiveFeedobj_loadDataError();
}

function UserLiveFeedobj_loadDataSuccess(responseText) {

    var response = JSON.parse(responseText).streams,
        response_items = response.length,
        sorting = Settings_Obj_default('live_feed_sort'),
        stream, id, mArray, obj_id,
        doc = document.getElementById(UserLiveFeed_obj[UserLiveFeedobj_UserLivePos].div),
        docside = document.getElementById("side_panel_holder"),
        i = 0;

    //if (response_items < Main_ItemsLimitVideo) UserLiveFeed_dataEnded = true;

    if (!UserLiveFeed_WasLiveidObject[AddUser_UsernameArray[0].name]) {
        UserLiveFeed_WasLiveidObject[AddUser_UsernameArray[0].name] = {};
        UserLiveFeed_CheckNotifycation = false;
    }

    var sorting_type1 = Settings_FeedSort[sorting][0],
        sorting_type2 = Settings_FeedSort[sorting][1],
        sorting_direction = Settings_FeedSort[sorting][2];

    if (sorting_direction) {
        //A-Z
        if (sorting_type1) {
            response.sort(function(a, b) {
                return (a[sorting_type1][sorting_type2] < b[sorting_type1][sorting_type2] ? -1 :
                    (a[sorting_type1][sorting_type2] > b[sorting_type1][sorting_type2] ? 1 : 0));
            });
        } else {
            response.sort(function(a, b) {
                return (a[sorting_type2] < b[sorting_type2] ? -1 :
                    (a[sorting_type2] > b[sorting_type2] ? 1 : 0));
            });
        }
    } else {
        //Z-A
        if (sorting_type1) {
            response.sort(function(a, b) {
                return (a[sorting_type1][sorting_type2] > b[sorting_type1][sorting_type2] ? -1 :
                    (a[sorting_type1][sorting_type2] < b[sorting_type1][sorting_type2] ? 1 : 0));
            });
        } else {
            response.sort(function(a, b) {
                return (a[sorting_type2] > b[sorting_type2] ? -1 :
                    (a[sorting_type2] < b[sorting_type2] ? 1 : 0));
            });
        }
    }

    for (i; i < response_items; i++) {
        stream = response[i];
        id = stream.channel._id;
        if (!UserLiveFeed_idObject[UserLiveFeedobj_UserLivePos][id]) {

            UserLiveFeed_idObject[UserLiveFeedobj_UserLivePos][id] = 1;
            mArray = ScreensObj_LiveCellArray(stream);
            UserLiveFeed_PreloadImgs.push(mArray[0]);

            //Check if was live if not notificate
            if (!UserLiveFeed_WasLiveidObject[AddUser_UsernameArray[0].name][id]) {
                UserLiveFeed_NotifyLiveidObject.push({
                    name: mArray[1],
                    logo: mArray[9],
                    title: Main_ReplaceLargeFont(twemoji.parse(mArray[2])),
                    game: mArray[3],
                    rerun: mArray[8],
                });
            }
            obj_id = UserLiveFeedobj_UserLivePos + '_' + UserLiveFeed_itemsCount[UserLiveFeedobj_UserLivePos];
            UserLiveFeed_LoadImgPush(UserLiveFeedobj_UserLivePos, mArray[0], obj_id);

            if (UserLiveFeed_LastPos[UserLiveFeedobj_UserLivePos] !== null && UserLiveFeed_LastPos[UserLiveFeedobj_UserLivePos] === stream.channel.name)
                UserLiveFeed_FeedPosY[UserLiveFeedobj_UserLivePos] = UserLiveFeed_itemsCount[UserLiveFeedobj_UserLivePos];

            doc.appendChild(
                UserLiveFeed_CreatFeed(
                    obj_id,
                    mArray
                )
            );

            if (UserSidePannel_LastPos[UserLiveFeedobj_UserLivePos] !== null && UserSidePannel_LastPos[UserLiveFeedobj_UserLivePos] === stream.channel.name)
                Sidepannel_PosFeed = UserLiveFeed_itemsCount[UserLiveFeedobj_UserLivePos];

            UserLiveFeed_LoadImgSidePush(mArray[9], UserLiveFeed_side_ids[1] + UserLiveFeed_itemsCount[UserLiveFeedobj_UserLivePos]);
            docside.appendChild(
                UserLiveFeedobj_CreatSideFeed(
                    UserLiveFeed_itemsCount[UserLiveFeedobj_UserLivePos],
                    mArray
                )
            );

            UserLiveFeed_itemsCount[UserLiveFeedobj_UserLivePos]++;
        }
    }

    UserLiveFeed_WasLiveidObject[AddUser_UsernameArray[0].name] = JSON.parse(JSON.stringify(UserLiveFeed_idObject[UserLiveFeedobj_UserLivePos]));

    // doc.appendChild(
    //     UserLiveFeed_CreatFeed(i++,
    //         [
    //             IMG_404_VIDEO,
    //             "ashlynn",
    //             "title",
    //             "game",
    //             "for 1000 Viewers",
    //             "720p30 [EN]",
    //             "ashlynn",
    //             10000000000,
    //             true,
    //             IMG_404_LOGO,
    //             true,
    //             "Since 11:04:36&nbsp;",
    //             "2020-01-25T09:49:05Z",
    //             1000,
    //             35618666]
    //     )
    // );

    UserLiveFeed_loadDataSuccessFinish(true, UserLiveFeedobj_UserLivePos);
    UserLiveFeed_LoadImg(UserLiveFeedobj_UserLivePos);
    UserLiveFeed_LoadImgSide();
    Sidepannel_PreloadImgs();
}

var UserLiveFeedobj_LiveNotificationClearId;
function UserLiveFeedobj_LiveNotification() {
    if (UserLiveFeed_NotifyRunning || !UserLiveFeed_NotifyLiveidObject.length) {
        if (!UserLiveFeed_Notify) UserLiveFeed_NotifyLiveidObject = [];

        return;
    }

    //Reset notifications after 2 times the time it takes just in case imf load and error fail some how
    window.clearTimeout(UserLiveFeedobj_LiveNotificationClearId);
    UserLiveFeedobj_LiveNotificationClearId = window.setTimeout(function() {
        UserLiveFeed_NotifyRunning = false;
        UserLiveFeed_NotifyLiveidObject = [];
    }, ((UserLiveFeed_NotifyTimeout + 1000) * 2 * UserLiveFeed_NotifyLiveidObject.length));

    UserLiveFeed_NotifyRunning = true;
    UserLiveFeedobj_LiveNotificationShow(0);
}

function UserLiveFeedobj_LiveNotificationShow(position) {
    var img = document.getElementById('user_feed_notify_img');

    img.onload = function() {
        this.onload = null;
        this.onerror = null;
        UserLiveFeedobj_LiveNotificationOnload(position);
    };

    img.onerror = function() {
        this.onerror = null;
        this.onload = null;
        this.src = IMG_404_LOGO;
        UserLiveFeedobj_LiveNotificationOnload(position);
    };

    img.src = UserLiveFeed_NotifyLiveidObject[position].logo;
}

var UserLiveFeedobj_LiveNotificationHideId;
function UserLiveFeedobj_LiveNotificationOnload(position) {
    Main_innerHTML('user_feed_notify_name', '<i class="icon-' + (!UserLiveFeed_NotifyLiveidObject[position].rerun ? 'circle" style="color: red;' : 'refresh" style="') + ' font-size: 75%; "></i>' + STR_SPACE + UserLiveFeed_NotifyLiveidObject[position].name);

    Main_textContent('user_feed_notify_game', UserLiveFeed_NotifyLiveidObject[position].game);
    Main_innerHTML('user_feed_notify_title', UserLiveFeed_NotifyLiveidObject[position].title);

    Main_ready(function() {
        Main_RemoveClass('user_feed_notify', 'user_feed_notify_hide');

        window.clearTimeout(UserLiveFeedobj_LiveNotificationHideId);
        UserLiveFeedobj_LiveNotificationHideId = window.setTimeout(function() {
            UserLiveFeedobj_LiveNotificationHide(position);
        }, UserLiveFeed_NotifyTimeout);
    });
}

var UserLiveFeedobj_LiveNotificationShowId;
function UserLiveFeedobj_LiveNotificationHide(position) {
    Main_AddClass('user_feed_notify', 'user_feed_notify_hide');

    if (position < (UserLiveFeed_NotifyLiveidObject.length - 1)) {
        window.clearTimeout(UserLiveFeedobj_LiveNotificationShowId);
        UserLiveFeedobj_LiveNotificationShowId = window.setTimeout(function() {
            UserLiveFeedobj_LiveNotificationShow(position + 1);
        }, 800);
    } else {
        window.clearTimeout(UserLiveFeedobj_LiveNotificationClearId);
        UserLiveFeed_NotifyRunning = false;
        UserLiveFeed_NotifyLiveidObject = [];
    }
}

function UserLiveFeedobj_CreatSideFeed(id, data) {

    var div = document.createElement('div');
    div.setAttribute('id', UserLiveFeed_side_ids[8] + id);
    div.setAttribute(Main_DataAttribute, JSON.stringify(data));
    div.className = 'side_panel_feed';

    div.innerHTML = '<div id="' + UserLiveFeed_side_ids[0] + id +
        '" class="side_panel_div"><div id="' + UserLiveFeed_side_ids[2] + id +
        '" style="width: 100%;"><div id="' + UserLiveFeed_side_ids[3] + id +
        '" style="display: none;">' + data[1] +
        '</div><div class="side_panel_iner_div1"><img id="' + UserLiveFeed_side_ids[1] + id +
        '" class="side_panel_channel_img" onerror="this.onerror=null;this.src=\'' + IMG_404_LOGO +
        '\';"></div><div class="side_panel_iner_div2"><div id="' + UserLiveFeed_side_ids[4] + id +
        '" class="side_panel_new_title">' + Main_ReplaceLargeFont(data[1]) + '</div><div id="' +
        UserLiveFeed_side_ids[5] + id + '" class="side_panel_new_game">' + data[3] +
        '</div></div><div class="side_panel_iner_div3"><div style="text-align: center;"><i class="icon-' +
        (!data[8] ? 'circle" style="color: red;' : 'refresh" style="') +
        ' font-size: 55%; "></i><div style="font-size: 58%;">' + Main_addCommas(data[13]) + '</div></div></div></div></div></div>';

    return div;
}

var UserLiveFeedobj_LiveFeedOldUserName = '';
function UserLiveFeedobj_ShowFeed() {
    UserLiveFeedobj_SetBottomText(4);

    if (AddUser_UserIsSet()) {
        UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_UserLivePos, (UserLiveFeedobj_LiveFeedOldUserName !== AddUser_UsernameArray[0].name));
        UserLiveFeedobj_LiveFeedOldUserName = AddUser_UsernameArray[0].name;
    }
}

function UserLiveFeedobj_ShowFeedCheck(pos, forceRefressh) {
    if (Main_isElementShowing('scene2') && !UserLiveFeed_isFeedShow()) UserLiveFeed_Show();

    if ((!UserLiveFeed_ThumbNull(pos + '_0', UserLiveFeed_ids[0]) || forceRefressh) && !UserLiveFeed_loadingData) UserLiveFeed_StartLoad();
    else {
        Main_RemoveClass(UserLiveFeed_obj[pos].div,
            pos === UserLiveFeedobj_UserLivePos ? 'opacity_zero' : 'hide');
        UserLiveFeed_FeedAddFocus(true, pos);
    }
}

function UserLiveFeedobj_HideFeed() {
    Main_AddClass(UserLiveFeed_obj[UserLiveFeedobj_UserLivePos].div, 'opacity_zero');
}

function UserLiveFeedobj_loadDataBaseLiveSuccess(responseText, pos) {

    var response = JSON.parse(responseText)[UserLiveFeed_obj[pos].StreamType],
        response_items = response.length,
        stream, id, mArray, obj_id,
        doc = document.getElementById(UserLiveFeed_obj[pos].div),
        i = 0;

    //if (response_items < Main_ItemsLimitVideo) UserLiveFeed_dataEnded = true;

    for (i; i < response_items; i++) {
        stream = UserLiveFeed_obj[pos].cell(response[i]);
        id = stream.channel._id;
        if (!UserLiveFeed_idObject[pos][id]) {

            UserLiveFeed_idObject[pos][id] = 1;
            mArray = ScreensObj_LiveCellArray(stream);

            obj_id = pos + '_' + UserLiveFeed_itemsCount[pos];
            UserLiveFeed_LoadImgPush(pos, mArray[0], obj_id);

            if (UserLiveFeed_LastPos[pos] !== null && UserLiveFeed_LastPos[pos] === stream.channel.name)
                UserLiveFeed_FeedPosY[pos] = UserLiveFeed_itemsCount[pos];

            doc.appendChild(
                UserLiveFeed_CreatFeed(
                    obj_id,
                    mArray
                )
            );
            UserLiveFeed_itemsCount[pos]++;
        }
    }

    // doc.appendChild(
    //     UserLiveFeed_CreatFeed(pos + '_' + (i + 1),
    //         [
    //             IMG_404_VIDEO,
    //             "ashlynn",
    //             "title",
    //             "game",
    //             "for 1000 Viewers",
    //             "720p30 [EN]",
    //             "ashlynn",
    //             10000000000,
    //             true,
    //             IMG_404_LOGO,
    //             true,
    //             "Since 11:04:36&nbsp;",
    //             "2020-01-25T09:49:05Z",
    //             1000,
    //             35618666]
    //     )
    // );

    UserLiveFeed_loadDataSuccessFinish(false, pos);
    UserLiveFeed_LoadImg(pos);
}

//Live Start
function UserLiveFeedobj_Live() {
    UserLiveFeedobj_StartDefault(UserLiveFeedobj_LivePos);
    UserLiveFeedobj_loadLive();
}

function UserLiveFeedobj_loadLive() {
    var theUrl = Main_kraken_api + 'streams?limit=100' + (Main_ContentLang !== "" ? ('&broadcaster_language=' + Main_ContentLang) : '') +
        Main_TwithcV5Flag;

    UserLiveFeedobj_loadErrorCallback = UserLiveFeedobj_loadLive;
    BasehttpGet(theUrl, UserLiveFeed_loadingDataTimeout, 2, null, UserLiveFeedobj_loadDataLiveSuccess, UserLiveFeedobj_loadDataError);
}

function UserLiveFeedobj_LiveCell(cell) {
    return cell;
}

function UserLiveFeedobj_loadDataLiveSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseLiveSuccess(responseText, UserLiveFeedobj_LivePos);
}

function UserLiveFeedobj_ShowLive() {
    UserLiveFeedobj_SetBottomText(3);

    UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_LivePos);
}

function UserLiveFeedobj_HideLive() {
    Main_HideElement(UserLiveFeed_obj[UserLiveFeedobj_LivePos].div);
}

//Live end

//Featured Start
function UserLiveFeedobj_Featured() {
    UserLiveFeedobj_StartDefault(UserLiveFeedobj_FeaturedPos);
    UserLiveFeedobj_loadFeatured();
}

function UserLiveFeedobj_loadFeatured() {
    var theUrl = Main_kraken_api + 'streams/featured?limit=100' + (AddUser_UserIsSet() && AddUser_UsernameArray[0].access_token ? '&oauth_token=' +
        AddUser_UsernameArray[0].access_token : '') + Main_TwithcV5Flag;

    UserLiveFeedobj_loadErrorCallback = UserLiveFeedobj_loadFeatured;
    BasehttpGet(theUrl, UserLiveFeed_loadingDataTimeout, 2, null, UserLiveFeedobj_loadDataFeaturedSuccess, UserLiveFeedobj_loadDataError);
}

function UserLiveFeedobj_FeaturedCell(cell) {
    return cell.stream;
}

function UserLiveFeedobj_loadDataFeaturedSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseLiveSuccess(responseText, UserLiveFeedobj_FeaturedPos);
}

function UserLiveFeedobj_ShowFeatured() {
    UserLiveFeedobj_SetBottomText(1);

    UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_FeaturedPos);
}

function UserLiveFeedobj_HideFeatured() {
    Main_HideElement(UserLiveFeed_obj[UserLiveFeedobj_FeaturedPos].div);
}
//Featured end

//Current game Start
function UserLiveFeedobj_CurrentGame() {
    UserLiveFeedobj_StartDefault(UserLiveFeedobj_CurrentGamePos);
    UserLiveFeedobj_loadCurrentGame();
}

function UserLiveFeedobj_loadCurrentGame() {
    var theUrl = Main_kraken_api + 'streams?game=' + encodeURIComponent(Play_data.data[3]) +
        '&limit=100' + (Main_ContentLang !== "" ? ('&broadcaster_language=' + Main_ContentLang) : '') + Main_TwithcV5Flag;

    UserLiveFeedobj_loadErrorCallback = UserLiveFeedobj_loadCurrentGame;
    BasehttpGet(theUrl, UserLiveFeed_loadingDataTimeout, 2, null, UserLiveFeedobj_loadDataCurrentGameSuccess, UserLiveFeedobj_loadDataError);
}

function UserLiveFeedobj_CurrentGameCell(cell) {
    return cell;
}

function UserLiveFeedobj_loadDataCurrentGameSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseLiveSuccess(responseText, UserLiveFeedobj_CurrentGamePos);
}

var UserLiveFeedobj_CurrentGameName = '';
function UserLiveFeedobj_ShowCurrentGame() {
    UserLiveFeedobj_SetBottomText(2);

    UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_CurrentGamePos, (UserLiveFeedobj_CurrentGameName !== Play_data.data[3]));
    UserLiveFeedobj_CurrentGameName = Play_data.data[3];
}

function UserLiveFeedobj_HideCurrentGame() {
    Main_HideElement(UserLiveFeed_obj[UserLiveFeedobj_CurrentGamePos].div);
}
//Current game end

//User Host Start
function UserLiveFeedobj_UserHost() {
    UserLiveFeedobj_StartDefault(UserLiveFeedobj_UserHostPos);
    UserLiveFeedobj_loadUserHost();
}

function UserLiveFeedobj_loadUserHost() {
    var theUrl = 'https://api.twitch.tv/api/users/' + encodeURIComponent(AddUser_UsernameArray[0].name) +
        '/followed/hosting?limit=100';

    UserLiveFeedobj_loadErrorCallback = UserLiveFeedobj_loadUserHost;
    BasehttpHlsGet(theUrl, UserLiveFeed_loadingDataTimeout, 2, null, UserLiveFeedobj_loadDataUserHostSuccess, UserLiveFeedobj_loadDataError);
}

function UserLiveFeedobj_loadDataUserHostSuccess(responseText) {
    var response = JSON.parse(responseText).hosts,
        response_items = response.length,
        stream, id, obj_id,
        doc = document.getElementById(UserLiveFeed_obj[UserLiveFeedobj_UserHostPos].div),
        i = 0;

    //if (response_items < Main_ItemsLimitVideo) UserLiveFeed_dataEnded = true;

    for (i; i < response_items; i++) {
        stream = response[i];
        id = stream.target._id + '' + stream._id;

        if (!UserLiveFeed_idObject[UserLiveFeedobj_UserHostPos][id]) {

            UserLiveFeed_idObject[UserLiveFeedobj_UserHostPos][id] = 1;

            if (UserLiveFeed_LastPos[UserLiveFeedobj_UserHostPos] !== null && UserLiveFeed_LastPos[UserLiveFeedobj_UserHostPos] === stream.target.channel.name)
                UserLiveFeed_FeedPosY[UserLiveFeedobj_UserHostPos] = UserLiveFeed_itemsCount[UserLiveFeedobj_UserHostPos];

            obj_id = UserLiveFeedobj_UserHostPos + '_' + UserLiveFeed_itemsCount[UserLiveFeedobj_UserHostPos];
            UserLiveFeed_LoadImgPush(UserLiveFeedobj_UserHostPos, stream.target.preview_urls.template, obj_id);

            doc.appendChild(
                UserLiveFeed_CreatFeed(
                    obj_id,
                    [
                        stream.target.preview_urls.template,//0
                        stream.display_name + STR_USER_HOSTING + stream.target.channel.display_name,//1
                        stream.target.title, //2
                        stream.target.meta_game,//3
                        STR_FOR.charAt(0).toUpperCase() + STR_FOR.slice(1) +
                        Main_addCommas(stream.target.viewers) + STR_SPACE + STR_VIEWER,//4
                        '',//5 quality
                        stream.target.channel.name,//6
                        '',//7 broadcast id
                        false,//8
                        stream.target.channel.logo,//9
                        '',//10 partner
                        '',//11 stream creat at string
                        '',//12 stream creat at
                        stream.target.viewers,//13
                        stream.target._id//14
                    ],
                    true
                )
            );
            UserLiveFeed_itemsCount[UserLiveFeedobj_UserHostPos]++;
        }
    }

    UserLiveFeed_loadDataSuccessFinish(false, UserLiveFeedobj_UserHostPos);
    UserLiveFeed_LoadImg(UserLiveFeedobj_UserHostPos);
}

var UserLiveFeedobj_HostFeedOldUserName = '';
function UserLiveFeedobj_ShowUserHost() {
    UserLiveFeedobj_SetBottomText(5);

    if (AddUser_UserIsSet()) {
        UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_UserHostPos, (UserLiveFeedobj_HostFeedOldUserName !== AddUser_UsernameArray[0].name));
        UserLiveFeedobj_HostFeedOldUserName = AddUser_UsernameArray[0].name;
    }
}

function UserLiveFeedobj_HideUserHost() {
    Main_HideElement(UserLiveFeed_obj[UserLiveFeedobj_UserHostPos].div);
}
//User Host end

//Base game fun
function UserLiveFeedobj_CreatGameFeed(id, data) {
    var div = document.createElement('div');
    data[6] = data[0];//To make UserLiveFeed_LastPos work

    div.setAttribute('id', UserLiveFeed_ids[8] + id);
    div.setAttribute(Main_DataAttribute, JSON.stringify(data));

    div.className = 'user_feed_thumb_game';
    div.innerHTML = '<div id="' + UserLiveFeed_ids[0] + id + '" class="stream_thumbnail_game_feed"><div class="stream_thumbnail_live_game"><img id="' +
        UserLiveFeed_ids[1] + id + '" class="stream_img" alt="" onerror="this.onerror=null;this.src=\'' +
        IMG_404_GAME + '\';"></div><div id="' +
        UserLiveFeed_ids[2] + id +
        '" class="stream_thumbnail_game_text_holder"><span class="stream_spam_text_holder"><div id="<div id="' +
        UserLiveFeed_ids[3] + id + '" class="stream_info_game_name">' + data[0] + '</div>' +
        (data[1] !== '' ? '<div id="' + UserLiveFeed_ids[4] + id +
            '"class="stream_info_live" style="width: 100%; display: inline-block;">' + data[1] +
            '</div>' : '') + '</div></span></div>';

    return div;
}

function UserLiveFeedobj_loadDataBaseGamesSuccess(responseText, pos, type) {
    var response = JSON.parse(responseText)[type],
        response_items = response.length,
        cell, game, obj_id,
        doc = document.getElementById(UserLiveFeed_obj[pos].div),
        i = 0;

    //if (response_items < Main_ItemsLimitVideo) UserLiveFeed_dataEnded = true;
    for (i; i < response_items; i++) {
        cell = response[i];
        game = cell.game;

        if (!UserLiveFeed_idObject[pos][game._id]) {

            UserLiveFeed_idObject[pos][game._id] = 1;

            if (UserLiveFeed_LastPos[pos] !== null && UserLiveFeed_LastPos[pos] === game.name)
                UserLiveFeed_FeedPosY[pos] = UserLiveFeed_itemsCount[pos];

            obj_id = pos + '_' + UserLiveFeed_itemsCount[pos];
            UserLiveFeed_LoadImgPushGame(pos, game.box.template, obj_id);

            doc.appendChild(
                UserLiveFeedobj_CreatGameFeed(
                    obj_id,
                    [
                        game.name,
                        Main_addCommas(cell.channels) + STR_SPACE + STR_CHANNELS + STR_BR + STR_FOR +
                        Main_addCommas(cell.viewers) + STR_SPACE + STR_VIEWER,
                        game._id
                    ]
                )
            );
            UserLiveFeed_itemsCount[pos]++;
        }
    }

    UserLiveFeed_loadDataSuccessFinish(false, pos);
    UserLiveFeed_LoadImg(pos);
}
//Base game fun

//User Games Start
function UserLiveFeedobj_UserGames() {
    UserLiveFeedobj_StartDefault(UserLiveFeedobj_UserGamesPos);
    UserLiveFeedobj_loadUserGames();
}

function UserLiveFeedobj_loadUserGames() {
    var theUrl = 'https://api.twitch.tv/api/users/' + encodeURIComponent(AddUser_UsernameArray[0].name) + '/follows/games/live?limit=200';//follows
    //var theUrl = Main_kraken_api + 'games/top?limit=100';//top

    UserLiveFeedobj_loadErrorCallback = UserLiveFeedobj_loadUserGames;
    BasehttpHlsGet(theUrl, UserLiveFeed_loadingDataTimeout, 2, null, UserLiveFeedobj_loadDataUserGamesSuccess, UserLiveFeedobj_loadDataError);
}

function UserLiveFeedobj_loadDataUserGamesSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseGamesSuccess(responseText, UserLiveFeedobj_UserGamesPos, 'follows');
}

var UserLiveFeedobj_GamesFeedOldUserName = '';
function UserLiveFeedobj_ShowUserGames() {
    UserLiveFeedobj_SetBottomText(6);

    if (AddUser_UserIsSet()) {
        UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_UserGamesPos, (UserLiveFeedobj_GamesFeedOldUserName !== AddUser_UsernameArray[0].name));
        UserLiveFeedobj_GamesFeedOldUserName = AddUser_UsernameArray[0].name;
    }
}

function UserLiveFeedobj_HideUserGames() {
    Main_HideElement(UserLiveFeed_obj[UserLiveFeedobj_UserGamesPos].div);
}
//User Games end

//Current user a game Start
var UserLiveFeedobj_CurrentUserAGameEnable = false;
function UserLiveFeedobj_CurrentUserAGame() {
    UserLiveFeedobj_StartDefault(UserLiveFeedobj_UserAGamesPos);
    UserLiveFeedobj_loadCurrentUserAGame();
}

function UserLiveFeedobj_loadCurrentUserAGame() {
    var theUrl = Main_kraken_api + 'streams?game=' + encodeURIComponent(UserLiveFeedobj_CurrentUserAGameNameEnter) +
        '&limit=100' + (Main_ContentLang !== "" ? ('&broadcaster_language=' + Main_ContentLang) : '') + Main_TwithcV5Flag;

    UserLiveFeedobj_loadErrorCallback = UserLiveFeedobj_loadCurrentGame;
    BasehttpGet(theUrl, UserLiveFeed_loadingDataTimeout, 2, null, UserLiveFeedobj_loadDataCurrentUserGameSuccess, UserLiveFeedobj_loadDataError);
}

function UserLiveFeedobj_CurrentUserGameCell(cell) {
    return cell;
}

function UserLiveFeedobj_loadDataCurrentUserGameSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseLiveSuccess(responseText, UserLiveFeedobj_UserAGamesPos);
}

var UserLiveFeedobj_CurrentUserAGameName = '';
var UserLiveFeedobj_CurrentUserAGameNameEnter = null;
function UserLiveFeedobj_ShowCurrentUserAGame() {
    UserLiveFeedobj_SetBottomText(6);

    UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_UserAGamesPos, (UserLiveFeedobj_CurrentUserAGameName !== UserLiveFeedobj_CurrentUserAGameNameEnter));
    UserLiveFeedobj_CurrentUserAGameName = UserLiveFeedobj_CurrentUserAGameNameEnter;
    Main_IconLoad('icon_feed_back', 'icon-arrow-left', STR_BACK_USER_GAMES + STR_USER + STR_SPACE + STR_GAMES);
    Main_ShowElement('icon_feed_back');
}

function UserLiveFeedobj_HideCurrentUserAGame() {
    Main_HideElement(UserLiveFeed_obj[UserLiveFeedobj_UserAGamesPos].div);
}
//Current user a game end

//Games Start
function UserLiveFeedobj_Games() {
    UserLiveFeedobj_StartDefault(UserLiveFeedobj_GamesPos);
    UserLiveFeedobj_loadGames();
}

function UserLiveFeedobj_loadGames() {
    var theUrl = Main_kraken_api + 'games/top?limit=100';//top

    UserLiveFeedobj_loadErrorCallback = UserLiveFeedobj_loadGames;
    BasehttpHlsGet(theUrl, UserLiveFeed_loadingDataTimeout, 2, null, UserLiveFeedobj_loadDataGamesSuccess, UserLiveFeedobj_loadDataError);
}

function UserLiveFeedobj_loadDataGamesSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseGamesSuccess(responseText, UserLiveFeedobj_GamesPos, 'top');
}

function UserLiveFeedobj_ShowGames() {
    UserLiveFeedobj_SetBottomText(0);

    UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_GamesPos);
}

function UserLiveFeedobj_HideGames() {
    Main_HideElement(UserLiveFeed_obj[UserLiveFeedobj_GamesPos].div);
}
//Games end

//Current a game Start
var UserLiveFeedobj_CurrentAGameEnable = false;
function UserLiveFeedobj_CurrentAGame() {
    UserLiveFeedobj_StartDefault(UserLiveFeedobj_AGamesPos);
    UserLiveFeedobj_loadCurrentAGame();
}

function UserLiveFeedobj_loadCurrentAGame() {
    var theUrl = Main_kraken_api + 'streams?game=' + encodeURIComponent(UserLiveFeedobj_CurrentAGameNameEnter) +
        '&limit=100' + (Main_ContentLang !== "" ? ('&broadcaster_language=' + Main_ContentLang) : '') + Main_TwithcV5Flag;

    UserLiveFeedobj_loadErrorCallback = UserLiveFeedobj_loadCurrentGame;
    BasehttpGet(theUrl, UserLiveFeed_loadingDataTimeout, 2, null, UserLiveFeedobj_loadDataCurrentAGameSuccess, UserLiveFeedobj_loadDataError);
}

function UserLiveFeedobj_CurrentAGameCell(cell) {
    return cell;
}

function UserLiveFeedobj_loadDataCurrentAGameSuccess(responseText) {
    UserLiveFeedobj_loadDataBaseLiveSuccess(responseText, UserLiveFeedobj_AGamesPos);
}

var UserLiveFeedobj_CurrentAGameName = '';
var UserLiveFeedobj_CurrentAGameNameEnter = null;
function UserLiveFeedobj_ShowCurrentAGame() {
    UserLiveFeedobj_SetBottomText(0);

    UserLiveFeedobj_ShowFeedCheck(UserLiveFeedobj_AGamesPos, (UserLiveFeedobj_CurrentAGameName !== UserLiveFeedobj_CurrentAGameNameEnter));
    UserLiveFeedobj_CurrentAGameName = UserLiveFeedobj_CurrentAGameNameEnter;
    Main_IconLoad('icon_feed_back', 'icon-arrow-left', STR_BACK_USER_GAMES + STR_GAMES);
    Main_ShowElement('icon_feed_back');
}

function UserLiveFeedobj_HideCurrentAGame() {
    Main_HideElement(UserLiveFeed_obj[UserLiveFeedobj_AGamesPos].div);
}
//Current a game end

function UserLiveFeedobj_SetBottomText(pos) {
    var i = 0;
    for (i; i < 7; i++)
        Main_RemoveClass('feed_end_' + i, 'feed_end_name_focus');

    Main_AddClass('feed_end_' + pos, 'feed_end_name_focus');

    for (i = 0; i < 6; i++) {
        if (i < pos) {
            Main_RemoveClass('feed_end_icon_' + i, 'feed_end_icon_up');
            Main_AddClass('feed_end_icon_' + i, 'feed_end_icon_down');

            Main_RemoveClass('feed_end_icon_' + i, 'icon-key-down');
            Main_AddClass('feed_end_icon_' + i, 'icon-key-up');
        } else {
            Main_RemoveClass('feed_end_icon_' + i, 'feed_end_icon_down');
            Main_AddClass('feed_end_icon_' + i, 'feed_end_icon_up');

            Main_RemoveClass('feed_end_icon_' + i, 'icon-key-up');
            Main_AddClass('feed_end_icon_' + i, 'icon-key-down');
        }
    }

    Main_textContent('feed_end_0', UserLiveFeedobj_CurrentAGameEnable ? UserLiveFeedobj_CurrentAGameNameEnter : (STR_GAMES));
    Main_textContent('feed_end_2', Play_data.data[3] !== '' ? Play_data.data[3] : STR_NO_GAME);
    Main_innerHTML('feed_end_6', UserLiveFeedobj_CurrentUserAGameEnable ? UserLiveFeedobj_CurrentUserAGameNameEnter : (STR_USER + STR_SPACE + STR_GAMES));

}