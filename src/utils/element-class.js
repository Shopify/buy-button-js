export function addClassToElement(className, element) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    element.className += ` ${className}`;
  }
}

export function removeClassFromElement(className, element) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    element.className = element.className.replace(className, '' );
  }
}
