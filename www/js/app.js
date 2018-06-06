// App logic.
window.myApp = {};

document.addEventListener('init', function(event) {
  var page = event.target;
  let receitas = myApp.services.data.lerReceitas();

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  // Fill the lists with initial data when the pages we need are ready.
  // This only happens once at the beginning of the app.
  // if (page.id === 'menuPage' || page.id === 'pendingTasksPage') {
    if (//document.querySelector('#menuPage')
      /*&&*/ document.querySelector('#categoriasPage')
      && !document.querySelector('#categoriasPage ons-list-item')
    ) {
      if (!receitas) {
        receitas = myApp.services.dummyReceitas;
        myApp.services.data.salvarReceitas(receitas);
      } 
      myApp.services.categorias.atualizar();
    }
  // }
});


function getReceitasJson(callback) {
  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType('application/json');
  xhr.open('GET', 'receitas.json', true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      callback(xhr.responseText);
    }
  }
  xhr.send(null);
  
}