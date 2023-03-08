var downloadJsonAction = function () { }

function exportAllData() {
    var dataJson = {};

    // BATTLE INFO
    dataJson['battleInfo'] = {
        'nameId': document.getElementById("AllBattleNames").value,
        'edition': document.getElementById("EditionNumber").value.trim(),
        'day': document.getElementById("BattleDay").value,
        'month': document.getElementById("BattleMonth").value,
        'year': document.getElementById("BattleYear").value
    }

    // EVERY VIDEO INFO
    var allBattles = document.getElementById("AllVideosFromBattle").querySelectorAll("#NewBattle");
    var allBattlesInfo = {};
    for (var i = 0; i < allBattles.length; i++) {
        battle = allBattles[i];

        var videoId = "v" + getVideoId(battle, false);

        // EVERY CUT INFO
        var allVideoCuts = battle.querySelector("#AllVideoCuts").querySelectorAll("#VideoCut");
        var allCutsInfo = {};
        for (var j = 0; j < allVideoCuts.length; j++) {
            var cut = allVideoCuts[j];

            var timeFrom = cut.querySelector("#TimingsFrom").querySelectorAll("select");
            var timeTo = cut.querySelector("#TimingsTo").querySelectorAll("select");

            var allHighlights = cut.querySelector("#McHighlightList").querySelectorAll("#McNameTag");
            var highlightsSelected = []
            for (var k = 0; k < allHighlights.length; k++) {
                if (allHighlights[k].querySelector("input").checked) {
                    highlightsSelected.push(getMcId(allHighlights[k].querySelector("label").innerHTML))
                }
            }

            var allTags = cut.querySelector("#VideoCutTags").querySelectorAll("#NameTag");
            var tagsSelected = []
            for (var k = 0; k < allTags.length; k++) {
                if (allTags[k].querySelector("input").checked) {
                    const selectedTagName = allTags[k].querySelector("label").innerHTML;
                    var selectedTagKey = "";
                    for ([key, value] of Object.entries(allTagNames)) {
                        if (value == selectedTagName) {
                            selectedTagKey = key;
                            break;
                        }
                    }
                    tagsSelected.push(selectedTagKey);
                }
            }


            var cutId = videoId + "_c" + getCutId(battle, cut, false);
            allCutsInfo[cutId] = {
                'keyframes': {
                    'from': {
                        'min': timeFrom[0].value,
                        'sec': timeFrom[1].value
                    },
                    'to': {
                        'min': timeTo[0].value,
                        'sec': timeTo[1].value
                    }
                },
                'highlights': highlightsSelected,
                'tags': tagsSelected

            }
        }

        var allMcs = battle.querySelector("#McsInBattle").querySelectorAll("#McName");
        var mcsInBattle = []
        for (var j = 0; j < allMcs.length; j++) {
            var mcName = allMcs[j].querySelector("#McNameText").innerHTML;
            mcsInBattle.push(getMcId(mcName))
        }

        allBattlesInfo[videoId] = {
            'youtube': battle.querySelector("#YoutubeLink").value.trim(),
            'mcs': mcsInBattle,
            'allCuts': allCutsInfo
        }
    }

    dataJson['allVideos'] = allBattlesInfo;
    validateAllData(dataJson);
}

function getMcId(mcName) {
    for ([key, value] of Object.entries(allMcNames)) {
        if (value === mcName) {
            return key
        }
    }

    return index
}
