function autocomplete(inp, ignore, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);


        // finds all words matching the typed letters
        var allWordsSelected = []
        for (i = 0; i < arr.length; i++) {
            /*check if the item contains the text field value:*/

            var considerWord = false;
            // check for words that have the letters somewhere else in the text
            for (j = 0; j < val.length; j++) {
                considerWord = arr[i].toUpperCase().indexOf(val[j].toUpperCase()) !== -1;
                if (!considerWord) break;
            }

            if (considerWord) {
                allWordsSelected.push(arr[i]);
            }
        }

        wordsToIgnore = ignore.querySelectorAll("#McName")
        allWordsSelected = sortWordsByMatch(allWordsSelected, val);
        for (i = 0; i < wordsToIgnore.length; i++) {
            word = wordsToIgnore[i].querySelector("#McNameText").innerHTML;
            index = allWordsSelected.indexOf(word);
            if (index >= 0) {
                allWordsSelected.splice(index, 1);
            }
        }

        for (i = 0; i < allWordsSelected.length; i++) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*highlight the matching letters:*/
            b.innerHTML = highlightMatch(allWordsSelected[i], val);
            /*insert an input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + allWordsSelected[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function (e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
        }
    });

    function highlightMatch(text, searchTerm) {
        /*initialize the result string*/
        var result = "";
        /*iterate through each character in the text*/
        for (var i = 0; i < text.length; i++) {
            var char = text[i];
            /*if the character is present in the search term, highlight it*/
            if (searchTerm.toUpperCase().indexOf(char.toUpperCase()) !== -1) {
                result += "<strong>" + char + "</strong>";
            } else {
                result += char;
            }
        }
        return result;
    }


    function sortWordsByMatch(allWords, typedWord) {
        var matches = [];
        /*calculate the score for each word*/
        for (var i = 0; i < allWords.length; i++) {
            var score = getMatchScore(typedWord, allWords[i]);
            /*add the word to the array with its score*/
            if (score > 0) {
                matches.push({
                    text: allWords[i],
                    score: score
                });
            }
        }
        /*sort the matches by score*/
        matches.sort(function (a, b) {
            return b.score - a.score;
        });
        /*create a new array with the sorted words*/
        var sortedWords = [];
        for (var i = 0; i < matches.length; i++) {
            sortedWords.push(matches[i].text);
        }
        /*add the non-matching words to the end of the array*/
        for (var i = 0; i < allWords.length; i++) {
            if (matches.findIndex(match => match.text === allWords[i]) === -1) {
                sortedWords.push(allWords[i]);
            }
        }
        return sortedWords;
    } function sortWordsByMatch(allWords, typedWord) {
        var matches = [];
        /*calculate the score for each word*/
        for (var i = 0; i < allWords.length; i++) {
            var score = getMatchScore(typedWord, allWords[i]);
            /*add the word to the array with its score*/
            if (score > 0) {
                matches.push({
                    text: allWords[i],
                    score: score
                });
            }
        }
        /*sort the matches by score*/
        matches.sort(function (a, b) {
            return b.score - a.score;
        });
        /*create a new array with the sorted words*/
        var sortedWords = [];
        for (var i = 0; i < matches.length; i++) {
            sortedWords.push(matches[i].text);
        }
        /*add the non-matching words to the end of the array*/
        for (var i = 0; i < allWords.length; i++) {
            if (matches.findIndex(match => match.text === allWords[i]) === -1) {
                sortedWords.push(allWords[i]);
            }
        }
        return sortedWords;
    }

    function getMatchScore(typedWord, word) {
        /*initialize the score to 0*/
        var score = 0;
        /*get the index of the first letter of the typed word in the word*/
        var index = word.toLowerCase().indexOf(typedWord.toLowerCase());
        /*if the typed word is not present in the word, return 0*/
        if (index === -1) {
            return 0;
        }
        /*give extra points if the typed word is at the beginning of the word*/
        if (index === 0) {
            score += 2;
        }
        /*iterate through each letter in the typed word*/
        for (var i = 0; i < typedWord.length; i++) {
            var typedChar = typedWord.charAt(i);
            /*get the index of the typed character in the word*/
            var charIndex = word.toLowerCase().indexOf(typedChar.toLowerCase(), index);
            /*if the typed character is not present in the word, return 0*/
            if (charIndex === -1) {
                return 0;
            }
            /*give extra points if the typed character is at the right position*/
            if (charIndex === index + i) {
                score += 1;
            }
        }
        return score;
    }

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

