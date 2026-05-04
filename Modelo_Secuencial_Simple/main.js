const EPOCHS = 500;
let model = null;
let trained = false;

// Arreglo para almacenar los valores de loss
let losses = [];
let chart = null;
let chartInitialized = false;

// Build model on load
window.addEventListener('load', () => {
  model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

  // Inicializar gráfica vacía
  initChart();
});

function initChart() {
  const ctx = document.getElementById('lossChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Loss (Error cuadrático medio)',
        data: [],
        borderColor: '#ff8c00',
        backgroundColor: 'rgba(255, 140, 0, 0.1)',
        borderWidth: 2,
        pointRadius: 2,
        pointBackgroundColor: '#ff8c00',
        tension: 0.2,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          title: { display: true, text: 'Épocas', font: { weight: 'bold' } },
          ticks: {
            maxTicksLimit: 10,
            autoSkip: true
          }
        },
        y: {
          title: { display: true, text: 'Loss (MSE)', font: { weight: 'bold' } },
          beginAtZero: true
        }
      },
      plugins: {
        tooltip: { callbacks: { label: (ctx) => `Loss: ${ctx.raw.toFixed(6)}` } },
        legend: { position: 'top' }
      }
    }
  });
  chartInitialized = true;
}

function updateChart(epoch, lossValue) {
  if (!chartInitialized) return;
  // Agregar nuevo punto
  chart.data.labels.push(epoch);
  chart.data.datasets[0].data.push(lossValue);
  // Opcional: limitar cantidad de puntos (EPOCHS)
  chart.update('none'); // actualización suave
}

async function startTraining() {
  if (trained) return;

  const btn = document.getElementById('btnTrain');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Entrenando…';

  setStatus('running', 'Entrenando el modelo, por favor esperá…');

  // Reiniciar arreglo de losses y limpiar gráfica si se vuelve a entrenar
  losses = [];
  if (chartInitialized) {
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();
  }

  const xData = [-6, -5, -4, -3, -2, -1, 0, 1, 2];
  const yData = xData.map(x => 2 * x + 6);

  const xs = tf.tensor2d(xData, [9, 1]);
  const ys = tf.tensor2d(yData, [9, 1]);

  await model.fit(xs, ys, {
    epochs: EPOCHS,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        const loss = logs.loss;
        // Guardar en arreglo
        losses.push(loss);
        // Actualizar UI
        const pct = ((epoch + 1) / EPOCHS) * 100;
        document.getElementById('progressBar').style.width = pct + '%';
        document.getElementById('epochLabel').textContent = `Época: ${epoch + 1} / ${EPOCHS}`;
        document.getElementById('lossLabel').textContent = `Loss: ${loss.toFixed(6)}`;
        // Actualizar gráfica (época empieza en 0, mostramos +1 para que sea más natural)
        updateChart(epoch + 1, loss);
      }
    }
  });

  xs.dispose();
  ys.dispose();

  trained = true;
  setStatus('done', '✅ ¡Entrenamiento completado! El modelo está listo para predecir.');

  btn.innerHTML = '✔ Entrenamiento completado';
  btn.classList.add('done');

  document.getElementById('btnPredict').disabled = false;

  const badge = document.getElementById('modelBadge');
  badge.textContent = '✓ Entrenado';
  badge.classList.remove('untrained');
  badge.classList.add('trained');

  showToast('🎉 Modelo listo para usar');
}

function predict() {
  if (!trained) return;

  const xVal = parseFloat(document.getElementById('xInput').value);
  if (isNaN(xVal)) {
    showToast('⚠ Ingresá un número válido');
    return;
  }

  const result = model.predict(tf.tensor2d([xVal], [1, 1])).dataSync()[0];
  const rounded = parseFloat(result.toFixed(4));

  const box = document.getElementById('resultBox');
  box.classList.add('has-result');

  document.getElementById('resultPlaceholder').style.display = 'none';

  const rv = document.getElementById('resultValue');
  rv.style.display = 'block';
  rv.textContent = rounded;

  document.getElementById('resultFormula').textContent =
    `y = 2 × (${xVal}) + 6  ≈  ${rounded}`;
}

function setStatus(state, text) {
  const dot = document.getElementById('statusDot');
  dot.className = 'status-dot ' + state;
  document.getElementById('statusText').textContent = text;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}