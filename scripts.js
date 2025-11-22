function autoResizeTextarea(element) {
  element.style.height = 'auto';
  element.style.height = (element.scrollHeight) + 'px';
}

function generateCode() {
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
    autoResizeTextarea(outputCodeElement);
    return;
  }

  let expires = "";
  if (days && parseInt(days) > 0) {
    const date = new Date();
    date.setTime(date.getTime() + (parseInt(days) * 24 * 60 * 60 * 1000));
    expires = `; expires=\${date.toUTCString()}`;
  }

  const domainConfig = domain ? `; domain=\${domain}` : '';

  const generatedCode = `
// 1. SET COOKIE
function setCookie(name, value, days) {
  const expDays = days || ${days}; 
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

/* Example (Default values: Name='${name}', Value='${value}', Days=${days}) */
// setCookie('${name}', '${value}', ${days});
// const segment = getCookie('${name}');
// deleteCookie('${name}');
`;
  outputCodeElement.value = generatedCode.trim();
  autoResizeTextarea(outputCodeElement);
}

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

    autoResizeTextarea(resultArea);

  } catch (e) {
    statusDiv.textContent = `⚠️ ERRO na Expressão Regular: ${e.message}`;
    statusDiv.classList.add('match-failure');
    resultArea.value = '// Erro de sintaxe na Regex.';
    autoResizeTextarea(resultArea);
  }
}

function switchLanguage(langCode) {
  const currentURL = window.location.pathname;
  const langRegex = /^\/(en|es)\/?/i;
  let baseFileName = currentURL.replace(langRegex, '');

  if (baseFileName.startsWith('/')) {
    baseFileName = baseFileName.substring(1);
  }

  if (baseFileName === '' || baseFileName === '/') {
    baseFileName = 'index.html';
  }

  let newPath;

  if (langCode === 'pt') {
    newPath = '/' + baseFileName;
  } else {
    newPath = `/${langCode}/${baseFileName}`;
  }

  newPath = newPath.replace(/\/\//g, '/');

  window.location.href = newPath;
}

document.addEventListener('DOMContentLoaded', () => {
  const cookieGeneratorForm = document.getElementById('cookie-generator-form');
  if (cookieGeneratorForm) {
    document.querySelectorAll('#cookie-generator-form input').forEach(input => {
      input.addEventListener('input', generateCode);
    });
    document.querySelector('button[onclick="generateCode()"]').addEventListener('click', generateCode);
    generateCode();
  }

  const regexInput = document.getElementById('regexInput');
  if (regexInput) {
    testRegex();
  }

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