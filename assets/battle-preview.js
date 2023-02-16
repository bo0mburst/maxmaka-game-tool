const btnAddPreview = document.getElementById('btn-add-preview');
const listPreview = document.getElementById('preview-list');
const btnRemovePreview = document.getElementById('remove-preview');

btnRemovePreview.addEventListener('click', removePreview);
btnAddPreview.addEventListener('click', addPreview);

// function addPreview (e) {
//   if(!e.target.value) return;

//   const files  = e.target.files;
//   if (FileReader && files && files.length) {
//     const reader = new FileReader();
    
//     const img = new Image();
    
//     reader.onload = (event)=> {
//       img.src = event.target.result;
//       window.MAXMAKA.previews = [...window.MAXMAKA.previews, img.src];
//       saveState();
//       loadPreview();
//     };
    
//     reader.readAsDataURL(files[0]);
//   }
// }

function addPreview () {
  const url = prompt('Enter image url\nexample:\n https://d36mxiodymuqjm.cloudfront.net/website/home/thumb_battle.png')
  if (!url) return;
  window.MAXMAKA.previews = [...window.MAXMAKA.previews, url];
  saveState();
  loadPreview();
}

function loadPreview () {
  listPreview.innerHTML = '';

  const previews =  window.MAXMAKA.previews;

  previews.forEach((i, index) => {
    const item = document.createElement('div');
    const label = document.createElement('span');
    label.classList.add('preview-label', 'bg-dark', 'text-primary', 'p-1');
    label.innerText = `${index + 1}/${previews.length}`;
    item.classList.add('carousel-item');
    if(index === 0) item.classList.add('active');
    const img = new Image();
    img.src = i;
    item.dataset.id=index;
    item.append(label);
    item.append(img);
    listPreview.append(item);
  })
}

function removePreview() {
  if (!confirm('This will remove the current preview')) return;
  const item = document.querySelector('.carousel-item.active');
  const index = item.dataset.id;
  if (index > -1) {
    window.MAXMAKA.previews.splice(index, 1);
    saveState();
    loadPreview();
  }
}