let tipoFortaleza = '';
let tipoArmadura = '';
let modeloFortaleza;
let modeloArmadura;

// Cargar modelos TensorFlow
async function cargarModelos() {
  modeloFortaleza = await tf.loadLayersModel('model/fortaleza/model.json');
  modeloArmadura = await tf.loadLayersModel('model/armadura/model.json');
}
cargarModelos();

// Función para procesar fortaleza
async function procesarFortaleza() {
  const input = document.getElementById('fortalezaImg');
  if(input.files.length===0) return alert("Selecciona una imagen");
  const file = input.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    const tensor = tf.browser.fromPixels(img).resizeNearestNeighbor([224,224]).toFloat().expandDims();
    const pred = modeloFortaleza.predict(tensor);
    const clases = ["inf","range","cav"];
    const index = pred.argMax(1).dataSync()[0];
    tipoFortaleza = clases[index];
    alert("Fortaleza detectada: "+tipoFortaleza.toUpperCase());
  };
}

// Función para procesar armadura
async function procesarArmadura() {
  const input = document.getElementById('armaduraImg');
  if(input.files.length===0) return alert("Selecciona una imagen");
  const file = input.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    const tensor = tf.browser.fromPixels(img).resizeNearestNeighbor([224,224]).toFloat().expandDims();
    const pred = modeloArmadura.predict(tensor);
    const clases = ["inf","range","cav","mixed"];
    const index = pred.argMax(1).dataSync()[0];
    tipoArmadura = clases[index];
    alert("Armadura detectada: "+tipoArmadura.toUpperCase());
  };
}

// Función para calcular ataque
function calcular() {
  if(!tipoFortaleza) return alert("Primero analiza la fortaleza");
  if(!tipoArmadura) return alert("Primero analiza tu armadura");

  const player = document.getElementById("player").value;
  const tropas = document.getElementById("tropas").value;
  let counter = nests[tipoFortaleza].counter;
  let form = nests[tipoFortaleza].formation;
  let selectedHeroes = heroes[player][counter];
  
  let gearBonus = "";
  if(tipoArmadura === counter || tipoArmadura==="mixed")
    gearBonus = "✔ Tu armadura es correcta";
  else
    gearBonus = "⚠ Cambia a set " + counter;

  document.getElementById("resultado").innerHTML = `
    <h2>Resultado</h2>
    Tropas a enviar: ${counter.toUpperCase()} (${tropas.toUpperCase()})<br>
    Formación: ${form}<br><br>
    Héroes recomendados:<br>
    ${selectedHeroes.join("<br>")}
    <br><br>${gearBonus}
  `;
}
