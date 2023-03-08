const btnAddPreview = document.getElementById('btn-add-preview');
const listPreview = document.getElementById('preview-list');
const btnRemovePreview = document.getElementById('remove-preview');
const btnSavePreview = document.getElementById('save-preview');
const btnUpdatePreview = document.getElementById('update-preview');
const btnEditPreview = document.getElementById('btn-edit-preview');
const btnLoadAnswer = document.getElementById('btn-load-answer');

const previewCarousel = document.getElementById('preview-carousel')
const pictureModalEl = document.getElementById('picture-modal');

const inputImageName = document.getElementById('image-name');
const inputUrl = document.getElementById('image-link');
const battleLink = document.getElementById('battle-link');

const pictureModal = new bootstrap.Modal(pictureModalEl, {
	backdrop: 'static',
  keyboard: false
});

pictureModalEl.addEventListener('hidden.bs.modal', function (event) {
  clearPreviewModal();
})


btnRemovePreview.addEventListener('click', removePreview);
btnAddPreview.addEventListener('click', addPreview);
btnSavePreview.addEventListener('click', savePreview);
btnUpdatePreview.addEventListener('click', updatePreview);
btnEditPreview.addEventListener('click', editPreview);
btnLoadAnswer.addEventListener('click', loadAnswer);


previewCarousel.addEventListener('slide.bs.carousel', function (e) {
  const keyword = document.getElementById('keyword');
  keyword.value = window.MAXMAKA.previews[e.to]?.name || '';
  keywordInput.type = "password";
})


function loadAnswer () {
  const item = document.querySelector('.carousel-item.active');
  if (item) {
    const index = item.dataset.id;
    const keyword = document.getElementById('keyword');
    keyword.value = window.MAXMAKA.previews[index]?.name || '';
  }
}

function addPreview() {
  btnSavePreview.classList.remove('d-none');
  btnUpdatePreview.classList.add('d-none');
  pictureModal.show();
}

function editPreview () {
  const item = document.querySelector('.carousel-item.active');
  if (!item) return;

  const index = item.dataset.id;
  const preview = window.MAXMAKA.previews[index];

  inputImageName.value = preview.name;
  inputUrl.value = preview.url;
  battleLink.value = preview.battle;
  
  btnSavePreview.classList.add('d-none');
  btnUpdatePreview.classList.remove('d-none');
  pictureModal.show();
}

function clearPreviewModal () {
  inputImageName.value = '';
  inputUrl.value = '';
  battleLink.value = '';
}

function updatePreview() {
  const item = document.querySelector('.carousel-item.active');
  if (!item) return;
  const index = item.dataset.id;
  window.MAXMAKA.previews[index] =  {
    name: inputImageName.value,
    url: inputUrl.value,
    battle: battleLink.value,
  };

  pictureModal.hide();
  
  saveState();
  loadPreview();

}

function savePreview () {
  let url = inputUrl.value;
  let name = inputImageName.value.trim();
  let battle =  battleLink.value;
  if (!url) return;

  window.MAXMAKA.previews = [
    ...window.MAXMAKA.previews,
    {
      url,
      name,
      battle,
    }
  ];

  pictureModal.hide();
  saveState();
  loadPreview();
}

function loadPreview () {
  listPreview.innerHTML = '';

  const previews =  window.MAXMAKA.previews;

  previews.forEach((i, index) => {
    const item = document.createElement('div');
    const label = document.createElement('span');
    const link = document.createElement('a');

    label.classList.add('preview-label', 'bg-dark', 'text-primary', 'p-1');
    label.innerText = `${index + 1}/${previews.length}`;
    item.classList.add('carousel-item');
    if(index === 0) item.classList.add('active');
    
    const img = new Image();
    img.src = i.url;
    
    link.setAttribute('href', i.battle); 
    link.setAttribute('target', '_blank'); 
    link.classList.add('preview-battle-link', 'bg-dark', 'text-primary', 'p-1', 'small');
    link.innerText = 'View Battle';

    item.dataset.id=index;
    item.append(label);
    item.append(img);
    item.append(link);
    listPreview.append(item);
  })

  // load answer
  loadAnswer();
}

function removePreview() {
  if (!confirm('This will remove the current preview')) return;
  const item = document.querySelector('.carousel-item.active');
  
  if (!item) return;
  const index = item.dataset.id;
  if (index > -1) {
    window.MAXMAKA.previews.splice(index, 1);
    saveState();
    loadPreview();
  }
}