
function parseTemplateString(string, replacements) {
  return string.replace(/\${.+?}/g, (match) => {
    const key = match.substr(2, match.length - 3).trim();
    return replacements[key];
  });
}

export default parseTemplateString;