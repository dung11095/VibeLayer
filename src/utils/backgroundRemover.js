import { removeBackgroundFromImageFile } from '@imgly/background-removal';

export async function removeBg(file) {
  return await removeBackgroundFromImageFile({
    imageFile: file,
    model: 'medium'
  });
}