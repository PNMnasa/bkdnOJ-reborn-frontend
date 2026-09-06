export function setTitle(title: string | null = null) {
  if (!title) title = "bkdnOJ";
  document.title = `${title} | Bách Khoa Đà Nẵng Online Judge (v2)`;
}
