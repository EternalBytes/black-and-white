const imagem = document.getElementById("imagem");
const btn    = document.getElementById("btn");
const img    = document.getElementById("img");
const link    = document.getElementById("link");

function transform(){
    if(imagem.files[0].type === "image/jpeg" || imagem.files[0].type === "image/jpg"){
        const data = new FormData();
        data.append('imagem', imagem.files[0]);
        //data.append('user', 'hubot')
        fetch('https://southamerica-east1-psyched-runner-391402.cloudfunctions.net/blackAndWhiteGo', {
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
                    link.href = "";
                    link.innerText = "Servidor indisponível...";
                    link.style.backgroundColor = "#D0342C";
                    link.style.display = "block";
                }
            }).then(blob => {
                return URL.createObjectURL(blob);
            }).then(url => {
                link.href = url;
                link.download = "yourImage.jpeg"
                link.innerText = "Baixe sua imagem";
                link.style.display = "block";
                link.style.backgroundColor = "green";
                }).catch(e => console.log(e))
    } else {
        link.style.backgroundColor = "#D0342C";
        link.style.display = "block";
        link.innerText = "O arquivo deve ser .jpg ou .jpeg"
    }
}

btn.addEventListener("click", ()=> {
    if(imagem.value) {
        transform();
    } else {
        link.style.display = "block";
        link.style.backgroundColor = "gray";
        link.style.border = "1px solid red";
        link
        link.innerHTML = "Escolha um arquivo, jpeg ou jpg..."
    }
}, false);