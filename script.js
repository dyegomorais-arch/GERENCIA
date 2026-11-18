const AREAS = [
  "SALOBO PROJETOS","SALOBO FP&A","SALOBO MINA","SALOBO USINA",
  "SERVIÇOS TECNICOS","SALOBO SSMARE","SALOBO RH"
];

const NOMES_INICIAIS = [
  "ADEILSON RODRIGUES","SCHETTINO","BRUNO DE ALVARENGA SOARES",
  "MARCELO RENATO VEIGA DOS SANTOS","CARLOS ALBERTO RICARTE FILHO",
  "CARLOS ROBERTO PIRES DA SILVA JUNIOR","CELIO ESTEVES BARBOSA JUNIOR",
  "CIARA TALBOT","DARREN HODDER","ELKE SAMANTA FELIX DA SILVA",
  "FELIPE DE SOUZA CARDOSO","FLAVIO THIMOTIO DA SILVA",
  "GUSTAVO ANDRE DE CASTRO ALMEIDA","GUSTAVO DINIZ OLIVEIRA",
  "JOSE HENRIQUE COELHO WANDERLEY COSTA","KLESIO TRINDADE RODRIGUES",
  "MANQIU XU","MARCELO VALE FERREIRA MENEZES","MARIANNA LEITE BARCELOS",
  "NONATO HUGO CAMPELO DA SILVA","PEDRO VITORIANO DA PAIXAO",
  "RODRIGO MARTINS GARROCHO","ROGER PALMER DA SILVA MOURA",
  "VITOR ANACLETO MACHADO","STEFAN GUEORGUIEV"
];

const KEY = "cadastro_diretoria_area_v1";
let dados = {};          // { nome: area | "" }
let filtro = "";         // área filtrada
let busca = "";

function carregar(){
  try{
    const salvo = localStorage.getItem(KEY);
    if(salvo) dados = JSON.parse(salvo);
  }catch(e){ dados = {}; }
  NOMES_INICIAIS.forEach(n => { if(!(n in dados)) dados[n] = ""; });
}
function salvar(){
  try{ localStorage.setItem(KEY, JSON.stringify(dados)); }catch(e){}
}

function opcoesArea(selecionada, comVazio){
  let h = comVazio ? '<option value="">— escolher —</option>' : '';
  AREAS.forEach(a => h += `<option value="${a}"${a===selecionada?' selected':''}>${a}</option>`);
  return h;
}

function montarSelects(){
  const nomes = Object.keys(dados).sort((a,b)=>a.localeCompare(b,'pt-BR'));
  document.getElementById("selNome").innerHTML =
    '<option value="">— escolher nome —</option>' +
    nomes.map(n => `<option value="${n}">${n}${dados[n] ? "  ("+dados[n]+")" : ""}</option>`).join("");
  document.getElementById("selArea").innerHTML = opcoesArea("", true);
}

function montarStats(){
  const cont = {}; AREAS.forEach(a => cont[a]=0);
  let sem = 0;
  Object.values(dados).forEach(a => { if(a) cont[a]++; else sem++; });
  let h = `<div class="chip${filtro===""?' active':''}" data-f="">Todos<b>${Object.keys(dados).length}</b></div>`;
  AREAS.forEach(a => h += `<div class="chip${filtro===a?' active':''}" data-f="${a}">${a}<b>${cont[a]}</b></div>`);
  h += `<div class="chip${filtro==='__sem'?' active':''}" data-f="__sem">Sem área<b>${sem}</b></div>`;
  const el = document.getElementById("stats");
  el.innerHTML = h;
  el.querySelectorAll(".chip").forEach(c => c.onclick = () => { filtro = c.dataset.f; render(); });
}

function montarTabela(){
  let nomes = Object.keys(dados).sort((a,b)=>a.localeCompare(b,'pt-BR'));
  if(filtro === "__sem") nomes = nomes.filter(n => !dados[n]);
  else if(filtro) nomes = nomes.filter(n => dados[n] === filtro);
  if(busca) nomes = nomes.filter(n => n.toLowerCase().includes(busca.toLowerCase()));

  const tb = document.getElementById("tbody");
  if(!nomes.length){
    tb.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#6b7c87;padding:22px">Nenhum registro encontrado.</td></tr>';
    return;
  }
  tb.innerHTML = nomes.map((n,i) => `
    <tr>
      <td>${i+1}</td>
      <td>${n}</td>
      <td>${dados[n] ? `<span class="badge">${dados[n]}</span>` : '<span class="badge none">Sem área</span>'}</td>
      <td><select data-nome="${n}">${opcoesArea(dados[n], true)}</select></td>
      <td><button class="x" data-del="${n}" title="Remover nome da lista">✕</button></td>
    </tr>`).join("");

  tb.querySelectorAll("select").forEach(s => s.onchange = () => {
    dados[s.dataset.nome] = s.value; salvar(); render();
  });
  tb.querySelectorAll("[data-del]").forEach(b => b.onclick = () => {
    if(confirm("Remover " + b.dataset.del + " da lista?")){
      delete dados[b.dataset.del]; salvar(); render();
    }
  });
}

function render(){ montarSelects(); montarStats(); montarTabela(); }

function mensagem(t, tipo){
  const m = document.getElementById("msg");
  m.textContent = t; m.className = "msg " + tipo;
  setTimeout(()=>{ m.textContent=""; }, 3500);
}

document.getElementById("btnSalvar").onclick = () => {
  const nome = document.getElementById("selNome").value;
  const area = document.getElementById("selArea").value;
  if(!nome){ mensagem("Escolha um nome.", "err"); return; }
  if(!area){ mensagem("Escolha a área.", "err"); return; }
  dados[nome] = area; salvar(); render();
  mensagem(nome + " cadastrado(a) em " + area + ".", "ok");
};

document.getElementById("selNome").onchange = e => {
  const n = e.target.value;
  document.getElementById("selArea").value = n && dados[n] ? dados[n] : "";
};

document.getElementById("busca").oninput = e => { busca = e.target.value; montarTabela(); };

document.getElementById("btnCsv").onclick = () => {
  const linhas = ["Nome;Area"];
  Object.keys(dados).sort((a,b)=>a.localeCompare(b,'pt-BR'))
    .forEach(n => linhas.push(`${n};${dados[n]||""}`));
  const blob = new Blob(["\ufeff" + linhas.join("\n")], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "cadastro_diretoria_area.csv";
  a.click();
  URL.revokeObjectURL(a.href);
};

document.getElementById("btnLimpar").onclick = () => {
  if(confirm("Apagar a área de todos os nomes?")){
    Object.keys(dados).forEach(n => dados[n] = "");
    salvar(); render();
  }
};

carregar();
render();
