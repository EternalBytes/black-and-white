package main

import (
	"bytes"
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(writer http.ResponseWriter, request *http.Request) {
		origin := request.Header.Get("origin")
		writer.Header().Set("Access-Control-Allow-Origin", origin)
		if request.Method == http.MethodPost {
			var err1 = request.ParseMultipartForm(32 << 20)
			if err1 != nil {
				writer.WriteHeader(http.StatusBadRequest)
			}

			image1, _, err2 := request.FormFile("imagem")
			if err2 != nil {
				writer.WriteHeader(http.StatusBadRequest)
			}

			// VERIFICAR TIPO DE ARQUIVO
			var imgBuffer = bytes.NewBuffer(nil)

			_, errB := imgBuffer.ReadFrom(image1)
			image1.Close()
			if errB != nil {
				writer.WriteHeader(http.StatusInternalServerError)
				return
			}

			fileType := http.DetectContentType(imgBuffer.Bytes()[:512])

			if fileType == "image/jpeg" {
				img, _, err3 := image.Decode(bytes.NewReader(imgBuffer.Bytes()))
				if err3 != nil {
					writer.WriteHeader(http.StatusInternalServerError)
					return
				}

				// Create a new grayscale image with the same dimensions as the original image
				grayImg := image.NewGray(img.Bounds())

				// Convert each pixel to grayscale
				for y := img.Bounds().Min.Y; y < img.Bounds().Max.Y; y++ {
					for x := img.Bounds().Min.X; x < img.Bounds().Max.X; x++ {
						// Get the original color of the pixel
						originalColor := img.At(x, y)
						// Convert the color to grayscale
						grayColor := color.GrayModel.Convert(originalColor).(color.Gray)
						// Set the grayscale color for the corresponding pixel in the new image
						grayImg.Set(x, y, grayColor)
					}
				}
				imgBuffer.Reset()
				err4 := jpeg.Encode(imgBuffer, grayImg, nil)
				if err4 != nil {
					writer.WriteHeader(http.StatusInternalServerError)
					return
				}

				writer.WriteHeader(http.StatusOK)
				writer.Header().Set("Content-Type", "image/jpeg")
				writer.Header().Set("Content-Disposition", "attachment")
				_, errW := writer.Write(imgBuffer.Bytes())
				if errW != nil {
					writer.WriteHeader(http.StatusInternalServerError)
				}
				imgBuffer.Reset()
				return
			} else {
				writer.Header().Set("Content-Type", "text/html; charset=utf-8")
				fmt.Fprintln(writer, "<h1>O tipo do arquivo deve ser .jpg ou .jpeg</h1>")
				return
			}
		} else {
			writer.Header().Set("Content-Type", "text/html; charset=utf-8")
			fmt.Fprintln(writer, "<h1>O método http deve ser POST</h1>")
			return
		}
	})

	log.Fatalln(http.ListenAndServe(":3000", nil))
}
