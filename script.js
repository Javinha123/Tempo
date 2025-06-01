const resultado = document.getElementById("resultado");
const climaAtual = document.getElementById("climaAtual");
const infoExtra = document.getElementById("infoExtra");
const btnMaisInfo = document.getElementById("btnMaisInfo");
const toggleThemeBtn = document.getElementById("toggleTheme");
const cidadeInput = document.getElementById("cidadeInput");
const btnBuscar = document.getElementById("btnBuscar");
const btnLocalizacao = document.getElementById("btnLocalizacao");

const apiKey = "91e096c942ab4e8aab9232622250106"; // substitua pela sua chave real

let dadosClima = null;

btnBuscar.addEventListener("click", () => buscarClimaPorCidade());
btnLocalizacao.addEventListener("click", () => buscarClimaPorLocalizacao());
btnMaisInfo.addEventListener("click", alternarMaisInfo);
toggleThemeBtn.addEventListener("click", alternarTema);

// Buscar clima por nome da cidade
async function buscarClimaPorCidade() {
  const cidade = cidadeInput.value.trim();
  if (!cidade) {
    mostrarMensagem("Digite o nome de uma cidade.");
    return;
  }
  await buscarClima(cidade);
}

// Buscar clima por coordenadas
async function buscarClimaPorLocalizacao() {
  if (!navigator.geolocation) {
    mostrarMensagem("Geolocalização não suportada pelo navegador.");
    return;
  }
  mostrarMensagem("🔍 Localizando...");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      await buscarClima(`${latitude},${longitude}`);
    },
    () => {
      mostrarMensagem("⚠️ Não foi possível obter sua localização.");
    }
  );
}

// Função principal de busca
async function buscarClima(local) {
  mostrarMensagem("");
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${local}&days=1&lang=pt`;
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error("Cidade não encontrada.");
    const dados = await resposta.json();
    dadosClima = dados;
    exibirClimaAtual(dados);
    prepararMaisInfo();
  } catch (erro) {
    mostrarMensagem(`Erro: ${erro.message}`);
    limparClima();
  }
}

// Mostra clima atual na tela
function exibirClimaAtual(dados) {
  const atual = dados.current;
  const local = `${dados.location.name}, ${dados.location.region}`;
  climaAtual.innerHTML = `
    <img src="https:${atual.condition.icon}" alt="${atual.condition.text}" />
    <p><strong>${Math.round(atual.temp_c)}°C</strong></p>
    <p>${local}</p>
  `;
}

// Alterna botão de "mais informações"
function alternarMaisInfo() {
  const aberto = infoExtra.classList.toggle("open");
  btnMaisInfo.textContent = aberto ? "Menos informações ▲" : "Mais informações ▼";
  infoExtra.hidden = !aberto;
  if (aberto) montarInfoExtra();
}

// Prepara botão de mais info
function prepararMaisInfo() {
  btnMaisInfo.style.display = "inline-block";
  infoExtra.classList.remove("open");
  infoExtra.hidden = true;
  btnMaisInfo.textContent = "Mais informações ▼";
}

// Gera HTML com dados extras
function montarInfoExtra() {
  if (!dadosClima) return;
  const atual = dadosClima.current;
  const forecast = dadosClima.forecast.forecastday[0];
  let horaHtml = "";

  forecast.hour.slice(0, 12).forEach((h) => {
    const hora = new Date(h.time).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
    const temp = Math.round(h.temp_c);
    horaHtml += `
      <div class="hora-item">
        <span>${hora}</span>
        <img src="https:${h.condition.icon}" alt="${h.condition.text}" />
        <strong>${temp}°C</strong>
      </div>
    `;
  });

  infoExtra.innerHTML = `
    <p>Condição: ${atual.condition.text}</p>
    <p>Temperatura mínima: ${Math.round(forecast.day.mintemp_c)}°C</p>
    <p>Temperatura máxima: ${Math.round(forecast.day.maxtemp_c)}°C</p>
    <p>Umidade: ${atual.humidity}%</p>
    <p>Vento: ${atual.wind_kph} km/h</p>
    <div class="previsao-horas">
      <h3>Previsão próximas 12h:</h3>
      <div class="horas-container">${horaHtml}</div>
    </div>
  `;
}

// Alternar tema claro/escuro
function alternarTema() {
  document.body.classList.toggle("dark");
  toggleThemeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

// Exibe mensagem de erro/informação
function mostrarMensagem(msg) {
  resultado.textContent = msg;
}

// Limpa dados visuais quando há erro
function limparClima() {
  climaAtual.innerHTML = "";
  btnMaisInfo.style.display = "none";
  infoExtra.classList.remove("open");
  infoExtra.hidden = true;
}
