/**
 * Explicit "delete this image" marker sent by admin forms.
 *
 * The CMS deliberately treats a blank image field as "keep the current image"
 * so an empty form field can never wipe a picture by accident. When an admin
 * presses Delete on an uploaded image, the form sends this marker instead, and
 * the server clears the stored image.
 */
export const REMOVE_IMAGE = '__remove_image__';

/** Form side: an emptied image field becomes an explicit delete request. */
export function imageForUpdate(value: string): string {
  return value === '' ? REMOVE_IMAGE : value;
}

/** Server side: true when the admin asked to delete the image. */
export function isRemoveImage(value: unknown): boolean {
  return value === REMOVE_IMAGE;
}
