var cutsCount = 0;

var deleteButtonAction = function () { }

function removeBracketedSuffix(str) {
    var match = str.match(/^(.*)\s*\([^)]*\)\s*$/);
    if (match) {
        return match[1].replace(/\s/g, '');
    }
    return str;
}

// Define a mapping of accented characters to their unaccented equivalents
const accentMap = {
    'á': 'a',
    'ã': 'a',
    'é': 'e',
    'í': 'i',
    'ó': 'o',
    'õ': 'o',
    'ú': 'u',
    'ç': 'c'
};

// Modify the 'matchMcNames' function to normalize the strings without 'unorm' library
function matchMcNames(str1, str2) {
    // Remove all non-alphanumeric characters and spaces, and normalize the strings
    str1 = removeBracketedSuffix(str1).replace(/[^0-9a-zA-Záãéíóõúç]/g, '').toLowerCase();
    str2 = removeBracketedSuffix(str2).replace(/[^0-9a-zA-Záãéíóõúç]/g, '').toLowerCase();

    // Replace any accented characters with their unaccented equivalents
    for (let [accented, unaccented] of Object.entries(accentMap)) {
        const pattern = new RegExp(accented, 'g');
        str1 = str1.replace(pattern, unaccented);
        str2 = str2.replace(pattern, unaccented);
    }

    // Compare the two normalized strings
    return str1 === str2;
}


function addBattleButtonClicked() {
    var savedDiv = getStoredObject("NewBattle");
    var newBattle = savedDiv.cloneNode(true);
    newBattle.style.display = "block";
    var allVideosDiv = document.getElementById("AllVideosFromBattle");
    allVideosDiv.appendChild(newBattle);


    var addMcButton = newBattle.querySelector("#AddMc");
    var namesInput = newBattle.querySelector("#McNamesInput");
    var mcsInBattle = newBattle.querySelector("#McsInBattle");
    addMcButton.addEventListener("click", function () {

        var name = namesInput.value;
        for (var [key, value] of Object.entries(allMcNames)) {
            if (matchMcNames(name, value)) {
                name = value;
                break;
            }
        }

        addMcNameToList(name, newBattle);

        namesInput.value = "";

        // refresh cuts
        refreshMcHighlightLists(newBattle);
    });

    var addCutButton = newBattle.querySelector("#AddCut");
    addCutButton.addEventListener("click", function () {
        var videoCut = getStoredObject("VideoCut");
        var newCut = videoCut.cloneNode(true);
        newCut.style.display = "block";

        var timingsFrom = newCut.querySelector("#TimingsFrom");
        if (timingsFrom.childNodes.length == 1) {
            var minutesTimes = createNumberDropdown(60, "min");
            var secondsTimes = createNumberDropdown(60, "sec");
            timingsFrom.appendChild(minutesTimes);
            timingsFrom.appendChild(secondsTimes);
        }

        var timingsTo = newCut.querySelector("#TimingsTo");
        if (timingsTo.childNodes.length == 1) {
            minutesTimes = createNumberDropdown(60, "min");
            secondsTimes = createNumberDropdown(60, "sec");
            timingsTo.appendChild(minutesTimes);
            timingsTo.appendChild(secondsTimes);
        }

        // this adds the cut as child of AllVideoCuts 
        // some stuff needs to happen only after this
        var allVideoCuts = newBattle.querySelector("#AllVideoCuts");
        allVideoCuts.appendChild(newCut);

        var cutTags = newCut.querySelector("#CutTags");
        addTagsToCut(newBattle, newCut, cutTags);


        var highlightList = newCut.querySelector("#McHighlightList");
        highlightList.innerHTML = "";
        refreshMcHighlightLists(newBattle);

        var deleteCut = newCut.querySelector("#DeleteCut");
        deleteCut.addEventListener("click", function () {
            deleteButtonAction = function () {
                allVideoCuts.removeChild(newCut);
                refreshTagsFromBattle(newBattle);
                deleteButtonAction = function () { };
            }
        });

    });

    var deleteBattle = newBattle.querySelector("#DeleteBattle");
    deleteBattle.addEventListener("click", function () {
        deleteButtonAction = function () {
            allVideosDiv.removeChild(newBattle);
            refreshTagsFromBattle(newBattle);
            deleteButtonAction = function () { };
        }
    });

    var mcsList = [];
    for (var [key, value] of Object.entries(allMcNames)) {
        mcsList.push(value);
    }
    autocomplete(namesInput, mcsInBattle, mcsList);
    refreshTagsFromBattle(newBattle);
}


function addTagsToCut(newBattle, newCut, cutTags) {
    var videoId = getVideoId(newBattle);
    var cutId = videoId + getCutId(newBattle, newCut);

    cutTags.innerHTML = "";
    for ([key, value] of Object.entries(allTagNames)) {
        var name = value;
        var tagId = cutId + name;
        var newTag = createNameTag(name);
        newTag.querySelector("input").id = tagId;
        newTag.querySelector("label").setAttribute("for", tagId);
        cutTags.appendChild(newTag);
    }
}

function getVideoId(battle, includeUnderscore = true) {
    var allVideos = document.getElementById("AllVideosFromBattle").querySelectorAll("#NewBattle");
    var videoId = "";
    for (var i = 0; i < allVideos.length; i++) {
        if (allVideos[i] == battle) {
            videoId += i;
            if (includeUnderscore)
                videoId += "_";
            break;
        }
    }
    return videoId
}

function getCutId(battle, cut, includeUnderscore = true) {
    var allVideoCuts = battle.querySelector("#AllVideoCuts").querySelectorAll("#VideoCut");
    var cutId = "";
    for (var i = 0; i < allVideoCuts.length; i++) {
        if (allVideoCuts[i] == cut) {
            cutId += i;
            if (includeUnderscore)
                cutId += "_";
            break;
        }
    }
    return cutId;
}


function refreshTagsFromBattle(battle) {
    var allVideoCuts = battle.querySelector("#AllVideoCuts");
    var videoId = getVideoId(battle);
    var videoCuts = allVideoCuts.querySelectorAll("#VideoCut");

    //update battle name
    var collapseBattleButton = battle.querySelector("#collapseButton");
    collapseBattleButton.innerHTML = "Batalha #" + (videoId.slice(0, -1));
    collapseBattleButton.setAttribute("href", "#" + videoId);
    var collapseBattleDiv = battle.querySelector(".collapsedContent");
    collapseBattleDiv.setAttribute("id", videoId);

    for (var i = 0; i < videoCuts.length; i++) {
        var cutId = videoId + i + "_";

        // update all McTags IDS
        var highlightList = videoCuts[i].querySelector("#McHighlightList");
        var mcTags = highlightList.querySelectorAll("#McNameTag");
        for (var j = 0; j < mcTags.length; j++) {
            var tagId = cutId + mcTags[j].querySelector("label").innerHTML;
            mcTags[j].querySelector("input").id = tagId;
            mcTags[j].querySelector("label").setAttribute("for", tagId);
        }

        // update all Tags IDS
        var cutTags = videoCuts[i].querySelector("#CutTags");
        for (var j = 0; j < cutTags.length; j++) {
            var tagId = cutId + cutTags[j].querySelector("label").innerHTML;
            cutTags[j].querySelector("input").id = tagId;
            cutTags[j].querySelector("label").setAttribute("for", tagId);
        }

        // update cut name
        var collapseButton = videoCuts[i].querySelector("#collapseButton");
        collapseButton.innerHTML = "Corte #" + (cutId.slice(2, -1));
        collapseButton.setAttribute("href", "#" + cutId);
        var collapseDiv = videoCuts[i].querySelector(".collapsedContent");
        collapseDiv.setAttribute("id", cutId);
    }
}

function refreshMcHighlightLists(newBattle) {
    var allVideoCuts = newBattle.querySelector("#AllVideoCuts");
    var mcsInBattleList = newBattle.querySelector("#McsInBattle");

    // loop all video cuts for this battle
    var videoCuts = allVideoCuts.querySelectorAll("#VideoCut");
    for (var i = 0; i < videoCuts.length; i++) {
        var allTags = getMcsListTags(mcsInBattleList);

        var confirmedIds = []

        var highlightList = videoCuts[i].querySelector("#McHighlightList");
        var mcTags = highlightList.querySelectorAll("#McNameTag");
        if (mcTags == null) continue;

        //check if there is a tag that needs to be removed
        for (var k = 0; k < mcTags.length; k++) {
            var mcName = mcTags[k].querySelector("label").innerHTML;
            var exists = false;
            for (var j = 0; j < allTags.length; j++) {
                exists = allTags[j].querySelector("label").innerHTML == mcName;
                if (exists) {
                    confirmedIds.push(j);
                    break;
                }
            }
            if (!exists) { // name does not exist anymore, remove tag
                highlightList.removeChild(mcTags[k]);
            }
        }

        // confirmedIds has all confirmed tags. add the ones that haven't been confirmed
        for (var j = 0; j < allTags.length; j++) {
            var confirmed = false;
            for (var k = 0; k < confirmedIds.length; k++) {
                confirmed = j == confirmedIds[k];
                if (confirmed) break;
            }
            if (!confirmed) {
                highlightList.appendChild(allTags[j]);
            }
        }
    }

    refreshTagsFromBattle(newBattle);
}


function getMcsListTags(mcsInBattleList) {
    var allTags = [];
    var allNames = mcsInBattleList.querySelectorAll('#McName');
    for (var i = 0; i < allNames.length; i++) {
        var name = allNames[i].querySelector('#McNameText').innerHTML;
        allTags.push(createMcTag(name));

    }
    return allTags;
}

function createMcTag(name) {
    return createTag("McNameTag", name)
}

function createNameTag(name) {
    return createTag("NameTag", name)
}

function createTag(id, name) {
    var nameTag = getStoredObject(id);
    var newTag = nameTag.cloneNode(true);
    newTag.style.display = "block";
    newTag.querySelector("label").innerHTML = name;
    newTag.querySelector("input").checked = false;
    return newTag;
}



function createNumberDropdown(numbers, hidden) {
    // Create a new select element
    var div = document.createElement("div");
    div.setAttribute("style", "margin-left: 5px;");

    var select = document.createElement("select");
    select.setAttribute("id", "NumberDropdownSelector");
    select.setAttribute("class", "form-select form-select-md");
    div.appendChild(select);

    fillNumbersDropdown(select, 0, numbers, hidden);

    // Return the select element
    return div;
}

function fillNumbersDropdown(select, from, to, hidden) {
    // Create options based on the specified number of numbers
    for (var i = from; i <= to; i++) {
        var number = "" + i;
        if (number.length == 1) number = "0" + number;

        // Create a new option element
        var option = document.createElement("option");
        option.setAttribute("value", number);
        // Set the option text to a string representation of the number
        option.textContent = String(number);
        // Add the option to the select element
        select.appendChild(option);
    }

    // Add a hidden option with no value and no text
    var hiddenOption = document.createElement("option");
    hiddenOption.setAttribute("selected", true);
    hiddenOption.setAttribute("hidden", true);
    hiddenOption.innerHTML = hidden;
    select.insertBefore(hiddenOption, select.firstChild);
}

function fillNumbersDropdownWith(select, items, hidden) {
    // Create options based on the specified number of numbers
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        // Create a new option element
        var option = document.createElement("option");
        option.setAttribute("value", i + 1);
        // Set the option text to a string representation of the number
        option.textContent = String(item);
        // Add the option to the select element
        select.appendChild(option);
    }

    // Add a hidden option with no value and no text
    var hiddenOption = document.createElement("option");
    hiddenOption.setAttribute("selected", true);
    hiddenOption.setAttribute("hidden", true);
    hiddenOption.innerHTML = hidden;
    select.insertBefore(hiddenOption, select.firstChild);
}



function addMcNameToList(mcName, newBattle) {
    var mcsInBattleList = newBattle.querySelector("#McsInBattle");
    var mcNameComponent = getStoredObject("McName");
    var newDiv = mcNameComponent.cloneNode(true);
    newDiv.style.display = "block";
    mcsInBattleList.appendChild(newDiv);

    var nameText = newDiv.querySelector("#McNameText");
    nameText.innerHTML = mcName;

    var removeButton = newDiv.querySelector("#RemoveMcName");
    removeButton.addEventListener("click", function () {
        mcsInBattleList.removeChild(newDiv);
        refreshMcHighlightLists(newBattle);
    });
}


function getStoredObject(id) {
    var allFound = document.querySelectorAll("#" + id);
    return allFound[allFound.length - 1];
}


// fill out day month year
fillNumbersDropdown(document.getElementById("BattleDay"), 1, 31, "Dia");
fillNumbersDropdownWith(document.getElementById("BattleMonth"), ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"], "Mês");
fillNumbersDropdown(document.getElementById("BattleYear"), 2014, 2030, "Ano");




var addBattleButton = document.getElementById("AddBattle");
addBattleButton.addEventListener("click", addBattleButtonClicked);


const allBattleNamesSelect = document.getElementById("AllBattleNames");
console.log(allBattleNames)
for ([key, value] of Object.entries(allBattleNames)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = value;
    allBattleNamesSelect.add(option);
}

