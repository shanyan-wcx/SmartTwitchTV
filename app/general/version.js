/*
 * Copyright (c) 2017-2021 Felipe de Leon <fglfgl27@gmail.com>
 *
 * This file is part of SmartTwitchTV <https://github.com/fgl27/SmartTwitchTV>
 *
 * SmartTwitchTV is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SmartTwitchTV is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with SmartTwitchTV.  If not, see <https://github.com/fgl27/SmartTwitchTV/blob/master/LICENSE>.
 *
 */

//Spacing for release maker not trow errors from jshint
var version = {
    VersionBase: '3.0',
    publishVersionCode: 329,//Always update (+1 to current value) Main_version_java after update publishVersionCode or a major update of the apk is released
    ApkUrl: 'https://github.com/fgl27/SmartTwitchTV/releases/download/329/SmartTV_twitch_3_0_329.apk',
    WebVersion: 'December 04 2021',
    WebTag: 605,//Always update (+1 to current value) Main_version_web after update Main_minversion or a major update of the web part of the app
    changelog: [
        {
            title: "Web Version December 04 2021",
            changes: [
                "Minor improve to screen aspect ratio, only improves on some devices that have issues, if you didn't had an screen size/aspect ratio  issue before and now you have please inform, contact inf in the about of the app"
            ]
        },
        {
            title: "Web Version September 12 2021",
            changes: [
                "Allow to control audio and volumes for all types of players"
            ]
        },
        {
            title: "Web Version August 28 2021",
            changes: [
                "General improves and bug fixes",
                "Add minimal support for Browsers, allowing the app to work on any device that has a working Web Browsers",
                "Acess using the link https://fgl27.github.io/SmartTwitchTV/release/index.html",
                "Not all Browsers may support the app",
                "The Browsers support is limited, the limitation is on the player and chat, there isn't support for Picture in Picture mode, Multistream or Previews",
                "The chat that shows in the Live player will logging with the same user that you have looged in on the Twitch official site on that Browser",
                "The Browsers support mouse input, clicks, mouse wheel and mouse hover",
                "One click selects, two will open a Live, VOD or Clip",
                "To show the in player preview, place the mouse on the top-center of the screen and use the mouse wheel, UP shows, Down hide",
                "Place the mouse over the preview and use the wheel to scroll throw the content",
            ]
        },
        {
            title: "Apk Version 3.0.329",
            changes: [
                "Fix channels on the home screen not showing content"
            ]
        },
        {
            title: "Apk Version 3.0.328",
            changes: [
                "Fix minor player regression"
            ]
        },
        {
            title: "Apk Version 3.0.327 and Web Version August 10 2021",
            changes: [
                "Add settings Chat option to Highlight messages from the streamer and mods",
                "Add player bottom controls option to show all player controls",
                "General improves and bug fixes"
            ]
        },
        {
            title: "Apk Version 3.0.326 and Web Version August 07 2021",
            changes: [
                "General improves and bug fixes"
            ]
        },
        {
            title: "Web Version July 22 2021",
            changes: [
                "General improves and bug fixes"

            ]
        }
    ]
};
