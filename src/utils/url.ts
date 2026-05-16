export function urlFromObject(obj: object, blobType: object): string {
  return URL.createObjectURL(
    new Blob([JSON.stringify(obj, null, 2)], blobType),
  );
}

export function revokeAfter(url: string) {
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
