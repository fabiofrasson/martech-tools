// scripts.js - VERSÃO FINAL COM EVENTOS POR LINHA

function autoResizeTextarea(element) {
  element.style.height = 'auto';
  element.style.height = (element.scrollHeight) + 'px';
}

// ===============================================
// 1. LÓGICA DO GERADOR DE CÓDIGO COOKIE
// ===============================================

function generateCode() {
  function getVal(id, def) {
    var el = document.getElementById(id);
    return (el && el.value.trim()) ? el.value.trim() : def;
  }

  var output = document.getElementById('outputCode');
  if (!output) return;

  var name = getVal('cookieName', 'user_segment');
  var val = getVal('cookieValue', 'default_value');
  var daysVal = getVal('expireDays', '30');
  var pathVal = getVal('cookiePath', '/');
  var domainVal = getVal('cookieDomain', '');

  if (!name) {
    output.value = '// Erro: O Nome do Cookie é obrigatório.';
    autoResizeTextarea(output);
    return;
  }

  var domainStr = domainVal ? '; domain=' + domainVal : '';

  var code = "";
  code += "// 1. SET COOKIE\n";
  code += "function setCookie(name, value, days) {\n";
  code += "    var d = days || " + daysVal + ";\n";
  code += "    var expires = '';\n";
  code += "    if (d) {\n";
  code += "        var date = new Date();\n";
  code += "        date.setTime(date.getTime() + (d * 24 * 60 * 60 * 1000));\n";
  code += "        expires = '; expires=' + date.toUTCString();\n";
  code += "    }\n";
  code += "    document.cookie = name + '=' + (value || '') + expires + '; path=" + pathVal + "' + '" + domainStr + "';\n";
  code += "}\n\n";

  code += "// 2. GET COOKIE\n";
  code += "function getCookie(name) {\n";
  code += "    var nameEQ = name + '=';\n";
  code += "    var ca = document.cookie.split(';');\n";
  code += "    for(var i=0; i < ca.length; i++) {\n";
  code += "        var c = ca[i];\n";
  code += "        while (c.charAt(0) === ' ') c = c.substring(1, c.length);\n";
  code += "        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);\n";
  code += "    }\n";
  code += "    return null;\n";
  code += "}\n\n";

  code += "// 3. DELETE COOKIE\n";
  code += "function deleteCookie(name) {\n";
  code += "    document.cookie = name + '=; Max-Age=-99999999; path=" + pathVal + domainStr + "';\n";
  code += "}\n\n";

  code += "/* Example */\n";
  code += "// setCookie('" + name + "', '" + val + "', " + daysVal + ");\n";
  code += "// var val = getCookie('" + name + "');\n";
  code += "// deleteCookie('" + name + "');";

  output.value = code;
  autoResizeTextarea(output);
}

// ===============================================
// 2. LÓGICA DO BOTÃO COPIAR
// ===============================================

function copyCode() {
  var codeField = document.getElementById('outputCode');
  var copyButton = document.querySelector('.copy-button');

  if (!codeField || !copyButton) return;

  codeField.select();
  codeField.setSelectionRange(0, 99999);

  try {
    document.execCommand('copy');
    var originalText = copyButton.textContent;
    copyButton.textContent = "✅ Copiado!";
    copyButton.style.backgroundColor = '#4CAF50';
    copyButton.disabled = true;

    setTimeout(function () {
      copyButton.textContent = originalText;
      copyButton.style.backgroundColor = '';
      copyButton.disabled = false;
      if (window.getSelection) window.getSelection().removeAllRanges();
    }, 2500);
  } catch (err) {
    alert("Erro ao copiar.");
  }
}

// ===============================================
// 3. LÓGICA DO VALIDADOR DE REGEX
// ===============================================

function testRegex() {
  var regexInput = document.getElementById('regexInput');
  var urlInput = document.getElementById('urlInput');
  var statusDiv = document.getElementById('matchStatus');
  var resultArea = document.getElementById('regexResult');

  if (!statusDiv || !resultArea) return;

  var rStr = regexInput ? regexInput.value : '';
  var uStr = urlInput ? urlInput.value : '';

  statusDiv.className = 'match-status';
  resultArea.value = '';

  if (!rStr || !uStr) {
    statusDiv.textContent = 'Insira a Regex e a URL acima para testar.';
    return;
  }

  try {
    var regex = new RegExp(rStr, 'g');
    var matches = [];
    var match;
    while ((match = regex.exec(uStr)) !== null) {
      matches.push(Array.from(match));
    }

    if (matches.length > 0) {
      statusDiv.textContent = "✅ SUCESSO! " + matches.length + " Match(es).";
      statusDiv.classList.add('match-success');
      var output = "Grupos Capturados:\n";
      matches.forEach(function (m, i) {
        output += "\n--- Match " + (i + 1) + " ---\n";
        output += "Match Completo: " + m[0] + "\n";
        for (var j = 1; j < m.length; j++) {
          output += "Grupo " + j + ": " + m[j] + "\n";
        }
      });
      resultArea.value = output;
    } else {
      statusDiv.textContent = '❌ FALHA! Nenhuma correspondência.';
      statusDiv.classList.add('match-failure');
      resultArea.value = '// Nenhum grupo capturado.';
    }
    autoResizeTextarea(resultArea);
  } catch (e) {
    statusDiv.textContent = "⚠️ ERRO na Regex: " + e.message;
    statusDiv.classList.add('match-failure');
    resultArea.value = '// Erro de sintaxe.';
    autoResizeTextarea(resultArea);
  }
}

// ===============================================
// 4. LÓGICA DE S.PRODUCTS (MESTRE-DETALHE E EVENTOS)
// ===============================================

function sProductsBeautifier(str) {
  if (!str || typeof str !== 'string') return '';
  return str.split(',').map(function (entry) {
    if (!entry.trim()) return '';
    var f = entry.split(';');
    while (f.length < 6) f.push('');

    var evars = f[5].trim();
    if (evars) {
      var pairs = evars.split('|');
      var map = {};
      pairs.forEach(function (p) {
        var parts = p.split('=');
        if (parts.length === 2) map[parts[0].trim()] = parts[1].trim();
      });
      evars = Object.keys(map).sort().map(function (k) { return k + '=' + map[k]; }).join('|');
    }
    return [f[0], f[1], f[2], f[3], f[4], evars].join(';');
  }).filter(function (e) { return e !== ''; }).join(',');
}

function parseProductsToJson(str) {
  if (!str) return [];
  return str.split(',').map(function (entry) {
    if (!entry.trim()) return null;
    var f = entry.split(';');
    while (f.length < 6) f.push('');

    var evars = {};
    if (f[5]) {
      f[5].split('|').forEach(function (p) {
        var parts = p.split('=');
        if (parts.length === 2) evars[parts[0].trim()] = parts[1].trim();
      });
    }
    return { category: f[0], productName: f[1], quantity: f[2], price: f[3], events: f[4], eVars: evars };
  }).filter(function (i) { return i !== null; });
}

// Função auxiliar para abrir/fechar a gaveta com animação
function toggleDetail(rowId, btn) {
  var row = document.getElementById(rowId);

  if (row.style.display === 'table-row') {
    row.style.display = 'none';
    btn.classList.remove('expanded');
    btn.closest('tr').style.backgroundColor = 'transparent';
  } else {
    row.style.display = 'table-row';
    btn.classList.add('expanded');
    btn.closest('tr').style.backgroundColor = '#f8fbff';
  }
}

function renderProductsTable(productData) {
  var container = document.getElementById('tableContainer');
  if (!container) return;
  container.innerHTML = '';

  if (!productData || productData.length === 0) {
    container.innerHTML = '<div style="padding: 20px; color: #666; text-align: center;">Nenhum dado válido encontrado.</div>';
    return;
  }

  var wrapper = document.createElement('div');
  wrapper.className = 'table-responsive-container';

  var html = '<table class="data-table">';

  // Cabeçalho
  html += '<thead><tr>';
  html += '<th style="width: 40px;"></th>';
  html += '<th>Produto / Categoria</th>';
  html += '<th>Qtd</th>';
  html += '<th>Preço</th>';
  html += '<th>Eventos</th>';
  html += '</tr></thead>';

  html += '<tbody>';

  var chevronIcon = '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>';

  productData.forEach(function (p, index) {
    var rowId = 'detail-' + index;

    // --- Linha Mestre ---
    html += '<tr style="border-bottom: none;">';
    html += '<td><button class="toggle-btn" onclick="toggleDetail(\'' + rowId + '\', this)">' + chevronIcon + '</button></td>';

    html += '<td><strong>' + (p.productName || 'N/A') + '</strong><br><small style="color:#666">' + (p.category || 'Sem Categoria') + '</small></td>';
    html += '<td>' + p.quantity + '</td>';
    html += '<td>' + p.price + '</td>';

    // AJUSTE DE EVENTOS: Separa por pipe ou vírgula e coloca um por linha
    var eventsFmt = '-';
    if (p.events && p.events.trim() !== '') {
      // Regex que divide por | ou ,
      var evtList = p.events.split(/[|,\,]/).filter(function (e) { return e.trim() !== ''; });

      eventsFmt = evtList.map(function (e) {
        return '<div style="white-space: nowrap; margin-bottom: 2px;">' + e.trim() + '</div>';
      }).join('');
    }

    html += '<td style="vertical-align: top;">' + eventsFmt + '</td>';
    html += '</tr>';

    // --- Linha de Detalhes (eVars) ---
    html += '<tr id="' + rowId + '" class="detail-row">';
    html += '<td colspan="5" style="padding: 0;">';
    html += '<div class="detail-content">';

    var evarKeys = Object.keys(p.eVars).sort();
    if (evarKeys.length > 0) {
      html += '<div style="margin-bottom:8px; font-weight:bold; color:#555;">Variáveis de Conversão (eVars):</div>';
      html += '<div class="evars-grid">';
      evarKeys.forEach(function (key) {
        html += '<div class="evar-item"><span class="evar-key">' + key + ':</span> ' + p.eVars[key] + '</div>';
      });
      html += '</div>';
    } else {
      html += '<div style="color:#999; font-style:italic;">Nenhuma eVar configurada.</div>';
    }

    html += '</div></td></tr>';
  });

  html += '</tbody></table>';
  wrapper.innerHTML = html;
  container.appendChild(wrapper);
}

function processAndPlotProducts() {
  var raw = document.getElementById('rawInput');
  var out = document.getElementById('formattedOutput');
  if (!raw || !out) return;

  var formatted = sProductsBeautifier(raw.value);
  out.value = formatted;
  autoResizeTextarea(out);
  renderProductsTable(parseProductsToJson(formatted));
}

// ===============================================
// 5. INICIALIZAÇÃO
// ===============================================

function switchLanguage(lang) {
  if (typeof BASE_PATH === 'undefined') {
    console.error("BASE_PATH indefinido.");
    return;
  }
  var currentURL = window.location.pathname;

  // Remove partes de idioma (/en/, /es/)
  var langRegex = /^\/(en|es)\/?/i;
  var pathNoLang = currentURL.replace(langRegex, '');

  // Limpa barra inicial
  if (pathNoLang.charAt(0) === '/') pathNoLang = pathNoLang.substring(1);

  // Se vazio, é index
  var file = pathNoLang || 'index.html';

  var newPath = (lang === 'pt') ? BASE_PATH + file : BASE_PATH + lang + '/' + file;
  window.location.href = newPath.replace(/\/\//g, '/');
}

document.addEventListener('DOMContentLoaded', function () {
  // Gerador de Cookie
  var cookieForm = document.getElementById('cookie-generator-form');
  if (cookieForm) {
    var inputs = cookieForm.querySelectorAll('input');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('input', generateCode);
    }
    generateCode();
  }

  // Regex
  if (document.getElementById('regexInput')) testRegex();

  // s.Products
  var rawInput = document.getElementById('rawInput');
  if (rawInput) {
    rawInput.addEventListener('input', processAndPlotProducts);

    var btn = document.querySelector('button[onclick*="processAndPlotProducts"]');
    if (btn) {
      btn.removeAttribute('onclick');
      btn.addEventListener('click', processAndPlotProducts);
    }

    processAndPlotProducts();
  }

  // Language
  var switcher = document.getElementById('language-switcher');
  if (switcher) {
    var p = window.location.pathname;
    if (p.indexOf('/en/') > -1) switcher.value = 'en';
    else if (p.indexOf('/es/') > -1) switcher.value = 'es';
    else switcher.value = 'pt';
  }
});