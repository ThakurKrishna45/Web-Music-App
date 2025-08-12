console.log("hello");

let currentSong= new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currFolder= folder;
    let a= await fetch(`http://127.0.0.1:5501/${folder}/`);
    let response= await a.text();
    // console.log(response);
    let div=document.createElement("div");
    div.innerHTML=response;
    let as= div.getElementsByTagName("a");
    let songs=[];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUl= document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""
    for (const song of songs) {
        const decodedSongName = decodeURIComponent(song);
        songUl.innerHTML= songUl.innerHTML + `<li>
                        <img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                              <div class="songName"> ${decodedSongName}</div>
                            <div class="songArtist">Song Artist</div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                             <img class="invert" src="img/play.svg" alt="">
                        </div>
                    </li>`;        
    }
    
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
       
        e.addEventListener("click", element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML.trim())
           playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;
}

const playMusic=(track,pause=false)=>{
    // let audio= new Audio("/Songs/"+track);
    currentSong.src=`/${currFolder}/`+ track;
    if(!pause){
        currentSong.play();
         play.src="img/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML=decodeURIComponent(track)
    document.querySelector(".songTime").innerHTML="00:00 / 00:00"

}




async function displayAlbums() {
    console.log("Displaying albums");

    let a = await fetch(`http://127.0.0.1:5501/Songs/`);
    let response = await a.text();

    // Use DOMParser to correctly parse HTML instead of innerHTML
    let parser = new DOMParser();
    let doc = parser.parseFromString(response, "text/html");

    let anchors = doc.querySelectorAll("a");
    let cardContainer = document.querySelector(".cardContainer");

    anchors.forEach(e => {
        let href = e.getAttribute("href"); // Get relative URL, not absolute
        if (href && href.startsWith("/Songs") && !href.includes(".htaccess")) {
            console.log(e); // Debugging

            // Extract folder name correctly
            let folder = href.split("/").filter(Boolean).pop();

            // Fetch metadata from info.json
            if (folder && folder !== "Songs") {
            fetch(`http://127.0.0.1:5501/Songs/${folder}/info.json`)
                .then(res => res.json())
                .then(response => {
                    cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                        stroke-linejoin="round" />
                                </svg>
                            </div>
                            <img src="/Songs/${folder}/cover.jpg" alt="">
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>`;
                })
                // .catch(err => console.warn(`info.json missing for ${folder}`, err));
        }
    }
    });

  
    document.querySelector(".cardContainer").addEventListener("click", async (event) => {
        const card = event.target.closest(".card");
        if (card) {
            const folder = card.dataset.folder;
            if (!folder) return;
            
            try {
                const songs = await getSongs(`Songs/${folder}`);
                console.log("Fetched Songs:", songs);
                playMusic(songs[0])
                // Handle songs (e.g., update UI)
            } catch (error) {
                console.error("Error fetching songs:", error);
            }
        }
    });
}









async function main(){
  

    songs= await getSongs("Songs/ncs")
    // console.log(songs)
    playMusic(songs[0],true)
    await displayAlbums()

    

    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src="img/pause.svg"
        }else{
            currentSong.pause();
            play.src="img/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songTime").innerHTML=`${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left= (currentSong.currentTime/currentSong.duration)*100 + "%";
    })

    currentSong.addEventListener("ended", () => {
        console.log("Song ended, playing next...");
    
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]); // Loop back to the first song when reaching the end
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0";
    })

    document.querySelector("#cross").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%";
    })

    prev.addEventListener("click",()=>{
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }else{
            playMusic(songs[index])
        }
    })

    next.addEventListener("click",()=>{
        currentSong.pause();
        console.log("Next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }else{
            playMusic(songs[index])
        }
    })
    range.addEventListener("change",(e)=>{
        console.log(e)
        currentSong.volume = parseInt(e.target.value) / 100;
    })


}
main(); 
