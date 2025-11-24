// --- Parser Logic (all terms generic) ---

// Tokenizer
function tokenize(query) {
  return query.match(/[\w:]+|AND|OR|NOT|\(|\)/gi) || [];
}

// Parser
function parse(tokens) {
  let pos = 0;

  function parseExpression() {
    let nodes = [];
    while (pos < tokens.length) {
      let token = tokens[pos];

      if (token === ")") { pos++; break; }
      if (token === "(") { pos++; nodes.push(parseExpression()); }
      else if (token.toUpperCase() === "AND" || token.toUpperCase() === "OR") { 
        nodes.push(token.toUpperCase()); 
        pos++; 
      }
      else if (token.toUpperCase() === "NOT") { 
        pos++; 
        nodes.push({ NOT: parseExpression() }); 
      }
      else {
        // Generic term
        nodes.push({ value: token });
        pos++;
      }
    }
    return nodes.length === 1 ? nodes[0] : nodes;
  }

  return parseExpression();
}

// Convert AST to natural language
function astToEnglish(ast) {
  if (Array.isArray(ast)) {
    let hasOperator = ast.some(node => node === "AND" || node === "OR");
    let parts = [];
    for (let i = 0; i < ast.length; i++) {
      const node = ast[i];
      if (node === "AND") parts.push("and");
      else if (node === "OR") parts.push("or");
      else parts.push(astToEnglish(node));
    }
    const result = parts.join(" ");
    return hasOperator ? "(" + result + ")" : result;
  } else if (ast.NOT) {
    return "excluding " + astToEnglish(ast.NOT);
  } else if (ast.value) {
    return `"${ast.value}"`;
  } else return "";
}

// Main function
function booleanToEnglish(query) {
  const tokens = tokenize(query);
  const ast = parse(tokens);
  let english = astToEnglish(ast);
  if (english.startsWith("(") && english.endsWith(")")) english = english.slice(1, -1);
  return english;
}

// Live update
const inputEl = document.getElementById("booleanInput");
const outputEl = document.getElementById("englishOutput");

inputEl.addEventListener("input", () => {
  const query = inputEl.value.trim();
  if (!query) outputEl.textContent = "";
  else outputEl.textContent = booleanToEnglish(query);
});
