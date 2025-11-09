// scripts.js - LÓGICA FINAL DAS FERRAMENTAS MARTECH

// ===============================================
// 1. LÓGICA DO GERADOR DE CÓDIGO COOKIE
// ===============================================

function generateCode() {
  // Função utilitária para pegar o valor do input ou o placeholder como fallback
  const getValue = (id, placeholder) => {
    const inputElement = document.getElementById(id);
    return inputElement ? (inputElement.value.trim() || placeholder) : placeholder;
  };

  const outputCodeElement = document.getElementById('outputCode');
  if (!outputCodeElement) return;

  const name = getValue('cookieName', 'user_segment');
  const value = getValue('cookieValue', 'default_value');
  const daysInput = document.getElementById('expireDays') ? document.getElementById('expireDays').value.trim() : '30';
  const days = daysInput || '30';
  const path = getValue('cookiePath', '/');
  const domain = document.getElementById('cookieDomain') ? document.getElementById('cookieDomain').value.trim() : '';

  if (!name) {
    outputCodeElement.value = '// Erro: O Nome do Cookie é obrigatório.';
    return;
  }

  // 1. Geração da string de Expiração (expires)
  let expires = "";
  if (days && parseInt(days) > 0) {
    const date = new Date();
    date.setTime(date.getTime() + (parseInt(days) * 24 * 60 * 60 * 1000));
    expires = `; expires=\${date.toUTCString()}`;
  }

  // 2. Geração das strings de Path e Domain
  const domainConfig = domain ? `; domain=\${domain}` : '';

  // 3. Montagem do Código Final
  const generatedCode = `
/**
* Funções de Gerenciamento de Cookies (Otimizado para Tag Managers)
* Gerado em \${new Date().toLocaleDateString('pt-BR')}
*/

// 1. SET COOKIE
function setCookie(name, value, days) {
  const expDays = days || \${days}; 
  let expires = "";
  if (expDays && parseInt(expDays) > 0) {
      const date = new Date();
      date.setTime(date.getTime() + (parseInt(expDays) * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
  }
  
  const pathConfig = "; path=${path}";
  const domainConfig = "${domainConfig}";

  document.cookie = name + "=" + (value || "") + expires + pathConfig + domainConfig;
}

// 2. GET COOKIE
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length, c.length);
      }
  }
  return null; 
}

// 3. DELETE COOKIE
function deleteCookie(name) {
  document.cookie = name + "=; Max-Age=-99999999; path=${path}${domainConfig}";
}

/* Exemplo de Uso (Valores padrão: Nome='${name}', Valor='${value}', Dias=${days}) */
// setCookie('${name}', '${value}', ${days});
// const segment = getCookie('${name}');
// deleteCookie('${name}');
`;
  outputCodeElement.value = generatedCode.trim();
}

// ===============================================
// 2. LÓGICA DO BOTÃO COPIAR
// ===============================================

function copyCode() {
  const codeField = document.getElementById('outputCode');
  const copyButton = document.querySelector('.copy-button');

  if (!codeField || !copyButton) return;

  codeField.select();
  codeField.setSelectionRange(0, 99999);

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) { console.error('Erro ao copiar: ', err); }

  if (success) {
    const originalText = copyButton.textContent;
    copyButton.textContent = "✅ Código copiado!";
    copyButton.style.backgroundColor = '#4CAF50';
    copyButton.disabled = true;

    setTimeout(() => {
      copyButton.textContent = originalText;
      copyButton.style.backgroundColor = '';
      copyButton.disabled = false;
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      } else if (document.selection) {
        document.selection.empty();
      }
    }, 2500);
  } else {
    alert("Erro ao copiar o código. Por favor, selecione e copie manualmente.");
  }
}

// ===============================================
// 3. LÓGICA DO VALIDADOR DE REGEX
// ===============================================

function testRegex() {
  const regexStr = document.getElementById('regexInput') ? document.getElementById('regexInput').value : '';
  const url = document.getElementById('urlInput') ? document.getElementById('urlInput').value : '';
  const statusDiv = document.getElementById('matchStatus');
  const resultArea = document.getElementById('regexResult');

  if (!statusDiv || !resultArea) return;

  statusDiv.className = 'match-status';
  resultArea.value = '';

  if (!regexStr || !url) {
    statusDiv.textContent = 'Insira a Regex e a URL acima para testar.';
    return;
  }

  try {
    const regex = new RegExp(regexStr, 'g');

    let matches = [];
    let match;

    while ((match = regex.exec(url)) !== null) {
      matches.push(Array.from(match));
    }

    if (matches.length > 0) {
      statusDiv.textContent = `✅ SUCESSO! ${matches.length} Match(es) Encontrado(s).`;
      statusDiv.classList.add('match-success');

      let output = "Grupos Capturados:\n";
      matches.forEach((m, index) => {
        output += `\n--- Match ${index + 1} ---\n`;
        output += `Match Completo (Índice 0): ${m[0]}\n`;

        m.slice(1).forEach((group, gIndex) => {
          output += `Grupo Capturado ${gIndex + 1}: ${group}\n`;
        });
      });
      resultArea.value = output;

    } else {
      statusDiv.textContent = '❌ FALHA! Nenhuma correspondência de URL encontrada.';
      statusDiv.classList.add('match-failure');
      resultArea.value = '// Nenhum grupo capturado.';
    }

  } catch (e) {
    statusDiv.textContent = `⚠️ ERRO na Expressão Regular: ${e.message}`;
    statusDiv.classList.add('match-failure');
    resultArea.value = '// Erro de sintaxe na Regex.';
  }
}


// ===============================================
// 4. LÓGICA DE TROCA DE IDIOMA (CORRIGIDA E ROBUSTA)
// ===============================================

function switchLanguage(langCode) {
  const currentURL = window.location.pathname;

  // 1. Regex para remover o prefixo de idioma atual (ex: /en/ ou /es/) e a barra inicial.
  // O /i no final garante que seja case-insensitive.
  const langRegex = /^\/(en|es)\/?/i;
  let baseFileName = currentURL.replace(langRegex, '');

  // 2. Garante que 'baseFileName' não contenha a primeira barra da URL.
  if (baseFileName.startsWith('/')) {
    baseFileName = baseFileName.substring(1);
  }

  // 3. Verifica se o resultado é a raiz ou um diretório vazio.
  // Em muitos casos, se for a raiz, o resultado será vazio ou apenas '/'.
  if (baseFileName === '' || baseFileName === '/') {
    baseFileName = 'index.html';
  }

  let newPath;

  if (langCode === 'pt') {
    // Se for Português, o caminho é a raiz + nome do arquivo.
    newPath = '/' + baseFileName;
  } else {
    // Se for 'en' ou 'es', o caminho é /lang/ + nome do arquivo.
    newPath = `/${langCode}/${baseFileName}`;
  }

  // O .replace(/\/\//g, '/') é uma camada extra de segurança para remover barras duplas
  // caso ainda surjam em algum cenário atípico de navegador/servidor.
  newPath = newPath.replace(/\/\//g, '/');

  // Redireciona o usuário para o novo caminho
  window.location.href = newPath;
}

// ===============================================
// 5. INICIALIZAÇÃO E SELEÇÃO CORRETA DO DROPDOWN
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicialização do Gerador de Cookies
  const cookieGeneratorForm = document.getElementById('cookie-generator-form');
  if (cookieGeneratorForm) {
    document.querySelectorAll('#cookie-generator-form input').forEach(input => {
      input.addEventListener('input', generateCode);
    });
    document.querySelector('button[onclick="generateCode()"]').addEventListener('click', generateCode);
    generateCode();
  }

  // 2. Inicialização do Validador Regex
  const regexInput = document.getElementById('regexInput');
  if (regexInput) {
    testRegex();
  }

  // 3. Define o valor inicial correto para o Seletor de Idioma
  const switcher = document.getElementById('language-switcher');
  if (switcher) {
    const path = window.location.pathname;
    let currentLang = 'pt';

    if (path.includes('/en/')) {
      currentLang = 'en';
    } else if (path.includes('/es/')) {
      currentLang = 'es';
    }

    switcher.value = currentLang;
  }
});