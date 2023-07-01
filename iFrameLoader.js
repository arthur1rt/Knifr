videoPlayer = null;
function onYouTubeIframeAPIReady() {
    // Note: This function must be in the global scope to be seen by the API
    // You need a video ID, not the whole URL, so we'll have to extract that later
    videoPlayer = new YT.Player('VideoPreview', {
        height: '540',
        width: '960',
        videoId: '', // initially empty
    });
}