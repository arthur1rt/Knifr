var validationErrors = [];
var validationWarnings = [];

function validateAllData(dataJson) {
    validationErrors = [];
    validationWarnings = [];

    validateBattleInfo(dataJson);
    validateVideosLinks(dataJson);
    validateCutsKeyframes(dataJson);
    validateCutsTags(dataJson);
    validateVideoMcs(dataJson);

    function addSection(modal, title, list, color, addSeparator) {
        var titleDiv = document.createElement("div");
        titleDiv.setAttribute("style", "color: " + color + "; font-weight: bold;");
        titleDiv.innerHTML = title;

        var div = document.createElement("div");
        div.setAttribute("style", "color: " + color + "; margin-top:15px;");
        div.innerHTML = title + "<br><br>";

        var allMessages = "";
        for (var i = 0; i < list.length; i++) {
            allMessages += (i + 1) + ". " + list[i] + "<br><br>";
        }
        div.innerHTML = allMessages;

        if (addSeparator) {
            var separatorDiv = document.createElement("div");
            separatorDiv.setAttribute("style", "border-top: 1px solid #e3e3e3; padding-top: 15px;");
            modal.querySelector(".modal-body").appendChild(separatorDiv);
        }

        if (titleDiv.innerHTML != "")
            modal.querySelector(".modal-body").appendChild(titleDiv);
        if (div.innerHTML != "")
            modal.querySelector(".modal-body").appendChild(div);
    }


    var modal = document.getElementById("DownloadModal");
    modal.querySelector(".modal-body").innerHTML = "";

    var buttonIsOn = true;
    if (validationErrors.length > 0) {
        addSection(modal, "[ERROR] -> Corrija os seguintes items", validationErrors, "red", false)
        buttonIsOn = false;
    }

    if (validationWarnings.length > 0) {
        addSection(modal, "[WARNING] -> Analise os seguintes items", validationWarnings, "#ff9100", validationErrors.length > 0)
    }

    if (validationErrors.length == 0) {
        addSection(modal, "[SUCCESS] Tudo certo para o Download! :)", "", "green", validationWarnings.length > 0)

        downloadJsonAction = function () {
            var name = dataJson['battleInfo']['name'].substring(0, dataJson['battleInfo']['name'].length - 4) + "- " + dataJson['battleInfo']['edition'];
            downloadJson(dataJson, name);
        }
    }

    if (buttonIsOn)
        modal.querySelector("#DownloadBtn").removeAttribute("disabled");
    else
        modal.querySelector("#DownloadBtn").setAttribute("disabled", true);

    validationErrors = []
}


function validateVideosLinks(dataJson) {
    var youtubeRegex = /(https?:\/\/)?(www\.)?youtube\.com\//;
    var allVideos = dataJson['allVideos']
    if (Object.keys(allVideos).length == 0) {
        validationErrors.push("Não existem batalhas adicionadas.");
    } else {
        var linksUsados = {};
        for (var video in allVideos) {
            var previouslyUsed = linksUsados.hasOwnProperty(allVideos[video]['youtube']);
            if (previouslyUsed) {
                validationErrors.push("Batalha #" + video.substring(1) + " - YouTube link já ultilizado em Batalha #" + linksUsados[allVideos[video]['youtube']] + ".");
            } else {
                linksUsados[allVideos[video]['youtube']] = video.substring(1)
            }
            if (youtubeRegex.test(decodeURIComponent(allVideos[video]['youtube'])) == false) {
                validationErrors.push("Batalha #" + video.substring(1) + " - YouTube link inválido.");
            }
        }
    }
}

function validateCutsKeyframes(dataJson) {
    var allVideos = dataJson['allVideos']
    for (var video in allVideos) {
        if (Object.keys(allVideos[video]['allCuts']).length == 0) {
            validationErrors.push("Batalha #" + video.substring(1) + " - Não existem cortes adicionados.");
        } else {
            var allIntervals = []
            for (var cut in allVideos[video]['allCuts']) {
                var timeFrom = allVideos[video]['allCuts'][cut]['keyframes']['from']
                var timeTo = allVideos[video]['allCuts'][cut]['keyframes']['to']

                if (containsOnlyNumbers(timeFrom['sec'], true) == false || containsOnlyNumbers(timeTo['sec'], true) == false) {
                    validationErrors.push("Batalha #" + video.substring(1) + " - Corte #" + cut.substring(4) + " - Tempos de corte inválidos.");
                } else {
                    var from = parseInt(timeFrom['sec'])
                    var to = parseInt(timeTo['sec'])
                    allIntervals.push([from, to])

                    if (from >= to) {
                        validationErrors.push("Batalha #" + video.substring(1) + " - Corte #" + cut.substring(4) + " - Tempos de corte inválidos. Tempo 'Até' deve acabar antes de 'De'.");
                    } else if (from >= to - 7) {
                        validationErrors.push("Batalha #" + video.substring(1) + " - Corte #" + cut.substring(4) + " - Corte possui baixa duração.");
                    }
                }
            }

            intersections = findIntersectingIntervals(allIntervals);
            for (var i in intersections) {
                intersection = intersections[i];
                validationWarnings.push("Batalha #" + video.substring(1) + " - Corte #" + intersection[0] + " e Corte #" + intersection[1] + "- Tempos do corte se cruzam.");
            }
        }
    }
}

function validateCutsTags(dataJson) {
    var allVideos = dataJson['allVideos']
    for (var video in allVideos) {
        for (var cut in allVideos[video]['allCuts']) {
            var videoCut = allVideos[video]['allCuts'][cut]
            var highlights = videoCut['highlights'];
            if (Object.keys(highlights).length < 1) {
                validationErrors.push("Batalha #" + video.substring(1) + " - Corte #" + cut.substring(4) + " - Nenhum MC destaque adicionado.");
            }

            var tags = videoCut['tags'];
            if (Object.keys(tags).length < 1) {
                validationErrors.push("Batalha #" + video.substring(1) + " - Corte #" + cut.substring(4) + " - Nenhuma tag adicionada.");
            }
        }
    }
}

function validateVideoMcs(dataJson) {
    var allVideos = dataJson['allVideos']
    for (var video in allVideos) {
        mcs = allVideos[video]['mcs']

        if (Object.keys(mcs).length < 1) {
            validationErrors.push("Batalha #" + video.substring(1) + " - Nenhum MC adicionado.");
        } else if (Object.keys(mcs).length % 2 == 1) {
            validationWarnings.push("Batalha #" + video.substring(1) + " - Um número ímpar de Mcs foi adicionado à batalha.");
        }

        for (var i in mcs) {
            var hasOnlyIntegers = /^[+-]?\d+$/.test(mcs[i])
            var foundName = hasOnlyIntegers && allMcNames.hasOwnProperty(mcs[i]);
            if (!foundName) {
                validationWarnings.push("Batalha #" + video.substring(1) + " - Mc \"" + mcs[i] + "\" não está presente na lista de mcs reconhecidos pelo sistema. Caso seja um Mc novo, ignore esse aviso.");
            }
        }
    }
}



function validateBattleInfo(dataJson) {
    var name = dataJson['battleInfo']['name']
    var foundName = false;
    for (var key in allBattleNames) {
        if (allBattleNames.hasOwnProperty(key)) {
            var value = allBattleNames[key];
            if (value.toLowerCase() == name.toLowerCase()) {
                dataJson['battleInfo']['name'] = value;
                foundName = true;
                break;
            }
        }
    }
    if (!foundName) {
        validationWarnings.push("'" + name + "' não existe na lista de batalhas.");
    }

    var day = dataJson['battleInfo']['day']
    var month = dataJson['battleInfo']['month']
    var year = dataJson['battleInfo']['year']
    if (containsOnlyNumbers(day) == false || containsOnlyNumbers(month) == false || containsOnlyNumbers(year) == false) {
        validationErrors.push("Data da batalha não especificada.");
    }

    var edition = dataJson['battleInfo']['edition']
    if (containsOnlyNumbers(edition) == false) {
        validationWarnings.push("Edição da batalha não é um número: " + edition + ".");
    }
}

function containsOnlyNumbers(str, allowDecimal = false) {
    if (allowDecimal)
        return /^\d*\.?\d+$/.test(str);

    return /^\d+$/.test(str);
}



function findIntersectingIntervals(intervals) {
    let intersecting = [];

    for (let i = 0; i < intervals.length - 1; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
            let a = intervals[i];
            let b = intervals[j];

            // Check if the intervals intersect and don't share an endpoint
            if (
                (a[0] == b[0] && a[1] == b[1]) || // both are the same
                (a[0] > b[0] && a[1] < b[1]) || // this one is inside the other
                (a[0] < b[0] && a[1] > b[1]) || // the other one is inside this one
                (a[0] < b[0] && a[1] < b[1] && a[1] > b[0]) || // this one is a little inside the other from the right
                (a[0] > b[0] && a[1] > b[1] && a[0] < b[1]) // this one is a little inside the other from the left
            ) {
                intersecting.push([i, j]);
            }
        }
    }

    return intersecting;
}



function downloadJson(json, filename) {
    var jsonString = JSON.stringify(json);
    var jsonBlob = new Blob([jsonString], { type: "application/json" });
    var jsonUrl = URL.createObjectURL(jsonBlob);
    var link = document.createElement("a");
    link.setAttribute("href", jsonUrl);
    link.setAttribute("download", filename + ".knifr");
    link.click();
}

