const gallery = document.querySelector('.listing-gallery');
const photos = Array.from(gallery?.querySelectorAll('a[href]') ?? []);

if (photos.length && typeof HTMLDialogElement !== 'undefined' &&
    typeof HTMLDialogElement.prototype.showModal === 'function') {
  const viewer = document.createElement('dialog');
  viewer.className = 'photo-viewer';
  viewer.setAttribute('aria-label', '照片浏览');
  viewer.innerHTML = `
    <div class="photo-viewer-toolbar">
      <span role="status"></span>
      <button type="button" data-close autofocus>关闭</button>
    </div>
    <div class="photo-viewer-stage"><img alt=""></div>
    <div class="photo-viewer-controls">
      <button type="button" data-previous>上一张</button>
      <button type="button" data-next>下一张</button>
    </div>`;
  document.body.append(viewer);

  const image = viewer.querySelector('img');
  const status = viewer.querySelector('[role="status"]');
  const close = viewer.querySelector('[data-close]');
  const previous = viewer.querySelector('[data-previous]');
  const next = viewer.querySelector('[data-next]');
  const hasMultiplePhotos = photos.length > 1;
  previous.disabled = next.disabled = !hasMultiplePhotos;
  let index = 0;
  let opener;

  function showPhoto(position) {
    index = (position + photos.length) % photos.length;
    image.alt = photos[index].querySelector('img').alt;
    image.src = photos[index].href;
    status.textContent = '第 ' + (index + 1) + ' 张，共 ' + photos.length + ' 张';
  }

  for (const [position, photo] of photos.entries()) {
    photo.setAttribute('aria-haspopup', 'dialog');
    photo.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = photo;
      showPhoto(position);
      viewer.showModal();
    });
  }

  close.addEventListener('click', () => viewer.close());
  previous.addEventListener('click', () => showPhoto(index - 1));
  next.addEventListener('click', () => showPhoto(index + 1));
  viewer.addEventListener('keydown', event => {
    if (!hasMultiplePhotos) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  viewer.addEventListener('click', event => {
    if (event.target === viewer) {
      const bounds = viewer.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
    }
  });
  viewer.addEventListener('close', () => opener?.focus({preventScroll: true}));
}
