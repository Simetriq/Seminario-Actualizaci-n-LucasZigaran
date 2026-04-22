# Proyectos con TensorFlow.js

Dos herramientas web que usan modelos de IA directamente en el navegador, sin necesidad de un servidor backend.

---

## Proyectos incluidos

### 🧪 Detector de Toxicidad (`toxicidad.html`)
Analiza un texto ingresado por el usuario y lo clasifica en categorías de lenguaje ofensivo (insultos, amenazas, lenguaje obsceno, etc.) usando el modelo **Toxicity** de TensorFlow.js.

**Cómo funciona:**
1. Se carga el modelo `toxicity` con un umbral de confianza (0.85 por defecto).
2. El usuario escribe un texto y presiona "Analizar".
3. El modelo devuelve predicciones por categoría, indicando si el texto es tóxico y con qué porcentaje de confianza.

### 🚛 Detector de Camiones en Imagen (`camion-imagen.html`)
El usuario sube una imagen y el modelo detecta objetos en ella. Si encuentra un camión, dibuja un recuadro rojo y muestra una alerta visual.

**Cómo funciona:**
1. Se carga el modelo **COCO-SSD**, entrenado para detectar 80 tipos de objetos comunes.
2. El usuario sube una imagen desde su dispositivo.
3. El modelo analiza la imagen y devuelve las detecciones con su clase y nivel de confianza.
4. Los camiones (`truck`) se resaltan en rojo; el resto de objetos en azul.

---

## Cómo se usa TensorFlow.js aquí (vía CDN)

En ambos archivos se cargan las librerías directamente desde internet con etiquetas `<script>` en el HTML:

```html
<!-- TensorFlow.js base -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>

<!-- Modelo de toxicidad -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/toxicity"></script>

<!-- Modelo COCO-SSD (detección de objetos) -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd"></script>
```

No hace falta instalar nada. Con abrir el archivo HTML en el navegador es suficiente.

---

## CDN vs. instalación con NPM

| | CDN | NPM |
|---|---|---|
| **Instalación** | Ninguna, solo un `<script>` | `npm install @tensorflow/tfjs` |
| **Requisitos** | Navegador y conexión a internet | Node.js + compilador C++ (Build Tools) |
| **Ideal para** | Aprender, prototipos rápidos, HTML estático | Proyectos grandes con bundler (Webpack, Vite) |
| **Rendimiento** | Depende de la conexión al cargar | El paquete queda local |
| **Complejidad** | Muy baja | Media/alta |

### ¿Por qué se usó CDN en este proyecto?

Al intentar instalar TensorFlow.js con NPM en Windows, el proceso falla si no están instaladas las **C++ Build Tools de Visual Studio**. Esto se debe a que algunas dependencias de TensorFlow requieren compilar código nativo.

Instalar Visual Studio Build Tools solo para un proyecto de aprendizaje es innecesariamente complejo. El CDN resuelve esto por completo: los modelos se descargan automáticamente desde los servidores de jsDelivr cada vez que se abre la página, sin ninguna configuración local.

> Para proyectos de aprendizaje o experimentación, el CDN es la opción más práctica. NPM tiene sentido cuando el proyecto crece y necesita control sobre las versiones, optimización del bundle o uso en un framework como React.

---

## Cómo usar los archivos

1. Descargá los archivos `.html`.
2. Abrí el archivo que quieras con cualquier navegador moderno (Chrome, Firefox, Edge).
3. Esperá a que aparezca el mensaje de modelo cargado.
4. ¡Listo para usar!

> Se necesita conexión a internet la primera vez para descargar los modelos desde el CDN.
