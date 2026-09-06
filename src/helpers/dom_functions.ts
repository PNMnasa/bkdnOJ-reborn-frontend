export function addClass(comp: HTMLElement, newClass: string) {
  let classes = comp.className.split(/\s+/);
  classes.push(newClass);
  comp.className = classes.join(" ");
}
export function removeClass(comp: HTMLElement, remClass: string) {
  let classes = comp.className.split(/\s+/);
  classes = classes.filter((cls) => cls !== remClass);
  comp.className = classes.join(" ");
}
