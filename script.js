const imagem = document.getElementById("imagem");
const btn    = document.getElementById("btn");
const img    = document.getElementById("img");
const link    = document.getElementById("link");
const modal    = document.getElementById("modal");
const container = document.querySelector(".container");
const closeBtn = document.getElementById("close");
const conatinerModal    = document.getElementById("container-modal");
const loadingCon    = document.getElementById("loading-con");

async function transform(){
    if(imagem.files[0].type === "image/jpeg" || imagem.files[0].type === "image/jpg"){
        const data = new FormData();
        data.append('imagem', imagem.files[0]);
        
        await fetch('https://southamerica-east1-psyched-runner-391402.cloudfunctions.net/blackAndWhiteGo', {
            method: 'POST', 
            body: data
            }).then(res => {
                const reader = res.body.getReader();
                return new ReadableStream({
                    start(controler) {
                        return pump();
                        function pump(){
                            return reader.read().then(({done, value}) => {
                                if(done){
                                    controler.close();
                                    return;
                                }

                                controler.enqueue(value);
                                return pump();
                            }); // return
                        }
                    }, 
                });//END READABLESTREAM
            }).then(stream => {
                return new Response(stream);
            }).then(response => {
                if(response.status === 200){
                    return response.blob();
                } else {
                    loadingCon.style.display = "none";
                    container.style.filter = "blur(15px)";
                    link.style.display = "none";
                    modal.childNodes[3].innerHTML = "Server Temporarily Unavailable!"
                    loadingCon.style.display = "none";
                    conatinerModal.style.display = "block";
                }
            }).then(blob => {
                return URL.createObjectURL(blob);
            }).then(url => {
                link.href = url;
                link.download = "black-and-white" + imagem.files[0].name;
                link.style.display = "block";
                link.style.background = "linear-gradient(rgb(67, 162, 67), green, rgb(67, 162, 67))";
                modal.childNodes[3].innerHTML = "Your image is ready!"
                link.textContent = "Download";
                loadingCon.style.display = "none";
                conatinerModal.style.display = "block";
                }).catch(e => {
                    console.log(e);
                    loadingCon.style.display = "none";
                    container.style.filter = "blur(15px)";
                    link.style.display = "none";
                    modal.childNodes[3].innerHTML = "You should be offline!"
                    link.innerText = "Error..."
                    conatinerModal.style.display = "block";
                });
    } else {
        loadingCon.style.display = "none";
        container.style.filter = "blur(15px)";
        link.style.background = "#D0342C";
        link.style.display = "block";
        modal.childNodes[3].innerHTML = "File must be .jpg or .jpeg!"
        link.innerText = "Error..."
        conatinerModal.style.display = "block";
    }
}

btn.addEventListener("click", async ()=> {
    if(imagem.value) {
        container.style.filter = "blur(15px)";
        loadingCon.style.display = "block";
        conatinerModal.style.display = "block";
       await transform();
    } else {
        loadingCon.style.display = "none";
        container.style.filter = "blur(15px)";
        link.style.display = "none";
        modal.childNodes[3].innerHTML = "Choose a jpeg image!!"
        conatinerModal.style.display = "block";
    }
}, false);

closeBtn.addEventListener("click", function(){
    container.style.filter = "blur(0px)";
    conatinerModal.style.display = "none";
}, false)
