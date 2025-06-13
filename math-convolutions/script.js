const upload = document.getElementById("upload");
    const canvasOriginal = document.getElementById("original");
    const canvasFiltered = document.getElementById("filtered");
    const ctxOriginal = canvasOriginal.getContext("2d");
    const ctxFiltered = canvasFiltered.getContext("2d");

    let originalImage = null;
    let currentImageData = null;

    upload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const img = new Image();
      img.onload = () => {
        // Redimensionar proporcionalmente para caber em 500x500
        const scale = Math.min(500 / img.width, 500 / img.height);
        const width = img.width * scale;
        const height = img.height * scale;

        canvasOriginal.width = canvasFiltered.width = width;
        canvasOriginal.height = canvasFiltered.height = height;

        ctxOriginal.drawImage(img, 0, 0, width, height);
        ctxFiltered.drawImage(img, 0, 0, width, height);

        originalImage = ctxOriginal.getImageData(0, 0, width, height);
        currentImageData = ctxFiltered.getImageData(0, 0, width, height);
      };
      img.src = URL.createObjectURL(file);
    });

    function applyFilter(type) {
      let kernel;
      if (type === "meanblur") {
        kernel = [
          [1, 1, 1],
          [1, 1, 1],
          [1, 1, 1],
        ];
      } else if (type === "sharpen") {
        kernel = [
          [0, -1, 0],
          [-1, 5, -1],
          [0, -1, 0],
        ];
      } else if (type === "edge") {
        kernel = [
          [-1, -1, -1],
          [-1, 8, -1],
          [-1, -1, -1],
        ];
      } else if (type === "emboss") {
        kernel = [
          [-2, -1, 0],
          [-1, 1, 1],
          [0, 1, 2],
        ];
      } else if (type === "gaussian") {
        kernel = [
          [1, 2, 1],
          [2, 4, 2],
          [1, 2, 1],
        ];
      }

      // Normalizar kernel se "Travar brilho" estiver marcada
      if (document.getElementById("lockBrightness") && document.getElementById("lockBrightness").checked) {
        let sum = kernel.flat().reduce((a, b) => a + b, 0);
        if (sum !== 0 && sum !== 1) {
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              kernel[i][j] /= sum;
            }
          }
        }
      }

      if (!document.getElementById("stacking").checked) {
        currentImageData = new ImageData(
          new Uint8ClampedArray(originalImage.data),
          originalImage.width,
          originalImage.height
        );
      }
      const newData = convolute(currentImageData, kernel);
      currentImageData = newData;
      ctxFiltered.putImageData(newData, 0, 0);
    }

    function applyCustomFilter() {
      const kernel = [];
      for (let i = 0; i < 3; i++) {
        const row = [];
        for (let j = 0; j < 3; j++) {
          const val = document.getElementById(`m${i}${j}`).value;
          row.push(eval(val)); // cuidado com segurança, só em ambiente confiável
        }
        kernel.push(row);
      }

      // Normalizar kernel se "Travar brilho" estiver marcada
      if (document.getElementById("lockBrightness").checked) {
        let sum = kernel.flat().reduce((a, b) => a + b, 0);
        if (sum !== 0 && sum !== 1) {
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              kernel[i][j] /= sum;
            }
          }
        }
      }

      if (!document.getElementById("stacking").checked) {
        currentImageData = new ImageData(
          new Uint8ClampedArray(originalImage.data),
          originalImage.width,
          originalImage.height
        );
      }
      const newData = convolute(currentImageData, kernel);
      currentImageData = newData;
      ctxFiltered.putImageData(newData, 0, 0);
    }

    function convolute(imageData, kernel) {
      const { width, height, data } = imageData;
      const output = new ImageData(width, height);
      const getPixel = (x, y, c) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return 0;
        return data[(y * width + x) * 4 + c];
      };
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          for (let c = 0; c < 3; c++) {
            let sum = 0;
            for (let ky = 0; ky < 3; ky++) {
              for (let kx = 0; kx < 3; kx++) {
                const px = x + kx - 1;
                const py = y + ky - 1;
                sum += kernel[ky][kx] * getPixel(px, py, c);
              }
            }
            output.data[(y * width + x) * 4 + c] = Math.min(Math.max(sum, 0), 255);
          }
          output.data[(y * width + x) * 4 + 3] = 255; // Alpha
        }
      }
      return output;
    }

    function resetFilters() {
      if (originalImage) {
        currentImageData = new ImageData(
          new Uint8ClampedArray(originalImage.data),
          originalImage.width,
          originalImage.height
        );
        ctxFiltered.putImageData(currentImageData, 0, 0);
      }
    }