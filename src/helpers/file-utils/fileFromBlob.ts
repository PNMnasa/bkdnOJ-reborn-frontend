const fileFromBlob = async (blob: Blob, name = "file.csv"): Promise<void> => {
  const a = document.createElement("a");
  a.download = name;
  a.href = URL.createObjectURL(blob);
  a.addEventListener("click", () => {
    setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
  });
  a.click();
};
export default fileFromBlob;
