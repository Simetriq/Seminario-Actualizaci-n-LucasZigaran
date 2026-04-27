const EPOCHS = 500;
let model = null;
let trained = false;

// Build model on load
window.addEventListener('load', () => {
  model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
});

async function startTraining() {
  if (trained) return;

  const btn = document.getElementById('btnTrain');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Entrenando…';

  setStatus('running', 'Entrenando el modelo, por favor esperá…');

  // Data for y = 2x + 6, starting at x = -6, 9 samples
  // x: -6,-5,-4,-3,-2,-1,0,1,2  →  y: -6,-4,-2,0,2,4,6,8,10
  const xData = [-6, -5, -4, -3, -2, -1, 0, 1, 2];
  const yData = xData.map(x => 2 * x + 6);

  const xs = tf.tensor2d(xData, [9, 1]);
  const ys = tf.tensor2d(yData, [9, 1]);

  await model.fit(xs, ys, {
    epochs: EPOCHS,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        const pct = ((epoch + 1) / EPOCHS) * 100;
        document.getElementById('progressBar').style.width = pct + '%';
        document.getElementById('epochLabel').textContent = `Época: ${epoch + 1} / ${EPOCHS}`;
        document.getElementById('lossLabel').textContent = `Loss: ${logs.loss.toFixed(6)}`;
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
