/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/

myApp.controllers = {

  //////////////////////////
  // Tabbar Page Controller //
  //////////////////////////
  categoriasPage: function(page) {
    // Set button functionality to open/close the menu.
    /*page.querySelector('[component="button/menu"]').onclick = function() {
      document.querySelector('#mySplitter').left.toggle();
    };*/

    // Set button functionality to push 'new_task.html' page.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/new-task"]'), function(element) {
      element.onclick = function() {
        document.querySelector('#myNavigator').pushPage('html/nova_receita.html');
      };

      element.show && element.show(); // Fix ons-fab in Safari.
    });

    // Change tabbar animation depending on platform.
    //page.querySelector('#myTabbar').setAttribute('animation', ons.platform.isAndroid() ? 'slide' : 'none');
  },

  novaReceitaPage: function (page) {
    let categoriaEscolhida = page.data.categoria;
    console.log(categoriaEscolhida);
    let receitaEdit = page.data.receita;
    let listaReceitas = myApp.services.data.lerReceitas();

    if (receitaEdit) {
      page.querySelector('ons-toolbar div.center').textContent = "Editar receita";
      page.querySelector('ons-list-title').textContent = "EDITANDO RECEITA";
      page.querySelector('#title-input').value = receitaEdit.nome;
      page.querySelector('#receita-input').value = receitaEdit.receita;
    }

    document.querySelector('#cat-input select').addEventListener('change', event => {
      if (event.target.value === 'nova') {
        document.querySelector('#nova-cat').classList.remove('hidden');
      } else {
        document.querySelector('#nova-cat').classList.add('hidden');
      }
    });

    for (let categoria in listaReceitas) {
      if (listaReceitas.hasOwnProperty(categoria)) {
        let html = ons.createElement(`
          <option value="${categoria}" ${categoriaEscolhida === categoria ? 'selected' : ''}>
            ${listaReceitas[categoria].nome}
          </option>
        `);
        document.querySelector('#cat-input select').insertAdjacentElement('beforeend', html);
      }
    }

    let sep = ons.createElement(`<option disabled>──────────</option>`);
    let novaCatHtml = ons.createElement(`<option value="nova">Nova categoria</option>`);
    document.querySelector('#cat-input select').insertAdjacentElement('beforeend', sep);
    document.querySelector('#cat-input select').insertAdjacentElement('beforeend', novaCatHtml);

    // Set button functionality to save a new task.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/save-task"]'), function (element) {
      element.onclick = function () {
        let novoTitulo = page.querySelector('#title-input').value;
        let categoria = page.querySelector('#cat-input select').value;
        let novaCat = page.querySelector('#nova-cat-input').value;
        let conteudo = page.querySelector('#receita-input').value;

        if ((novoTitulo && conteudo && categoria !== '0' && categoria !== 'nova') ||
              (novoTitulo && conteudo && categoria === 'nova' && novaCat)) {
                if (receitaEdit) {
                  receitaEdit.categoria = categoriaEscolhida;
                  myApp.services.receitas.editar({
                    nome: novoTitulo,
                    receita: conteudo,
                    receitaAtual: receitaEdit,
                    categoria: categoria === 'nova' ? novaCat : categoria
                  });
                  myApp.services.receitas.atualizarDetalhes({
                    nome: novoTitulo,
                    receita: conteudo
                  });
                } else {
                  myApp.services.receitas.criar(
                    {
                      nome: novoTitulo,
                      receita: conteudo,
                      categoria: categoria === 'nova' ? novaCat : categoria
                    }
                  );
                }

          // Set selected category to 'All', refresh and pop page.
          if (categoriaEscolhida === categoria) {
            myApp.services.receitas.atualizar(categoriaEscolhida);
          }
          myApp.services.categorias.atualizar(categoriaEscolhida);
          document.querySelector('#myNavigator').popPage();

        } else {
          // Show alert if the input title is empty.
          ons.notification.alert('Preencha todas as informações da receita corretamente.');
        }
      };
    });
  },



  receitasPage: page => {
    let element = page.data.element;
    let data = element.data;

    Array.prototype.forEach.call(page.querySelectorAll('[component="button/new-task"]'), function (element) {
      element.onclick = function () {
        document.querySelector('#myNavigator')
          .pushPage('html/nova_receita.html', {
            data: {
              categoria: data.slug
            }
          });
      };

      element.show && element.show(); // Fix ons-fab in Safari.
    });

    document.querySelector('#page-title').textContent = data.nome;
    document.querySelector('#receitasPage ons-list-header').textContent = `RECEITAS DE ${data.nome.toUpperCase()}`;
    
    for (let receita of data.receitas) {
      myApp.services.receitas.mostrar(receita, data.slug);
    }
  },

  detalhesReceitaPage: page => {
    let data = page.data.element.data;

    page.querySelector('#detalhesReceitaPage .container h1').textContent = data.receita.nome;
    page.querySelector('#detalhesReceitaPage .container p').innerHTML = data.receita.receita.replace(/\n/g, '<br/>');    

    Array.prototype.forEach.call(page.querySelectorAll('[component="button/excluir-receita"]'), function (element) {
      element.onclick = function () {
        ons.notification.confirm({
          message: `Deseja mesmo excluir a receita ${data.receita.nome}?`
        }).then(botao => {
          if (botao) {
            myApp.services.receitas.excluir(data.receita, data.categoria);
            myApp.services.categorias.atualizar();
            myApp.services.receitas.atualizar(data.categoria);
            document.querySelector('#myNavigator').popPage();
          }
        });
      }
    });

    Array.prototype.forEach.call(page.querySelectorAll('[component="button/editar-receita"]'), function (element) {
      element.onclick = function () {
        document.querySelector('#myNavigator').pushPage('html/nova_receita.html', {
          data: {
            categoria: data.categoria,
            receita: {
              indice: data.receita.indice,
              nome: page.querySelector('#detalhesReceitaPage .container h1').textContent,
              receita: page.querySelector('#detalhesReceitaPage .container p').innerHTML.replace(/<br>/g, '\n')
            }
          }
        })
      }
    });
  },

  ////////////////////////////////
  // Details Task Page Controller //
  ///////////////////////////////
  detailsTaskPage: function(page) {
    // Get the element passed as argument to pushPage.
    let element = page.data.element;

    // Fill the view with the stored data.
    page.querySelector('#title-input').value = element.data.title;
    page.querySelector('#category-input').value = element.data.category;
    page.querySelector('#description-input').value = element.data.description;
    page.querySelector('#highlight-input').checked = element.data.highlight;
    page.querySelector('#urgent-input').checked = element.data.urgent;

    // Set button functionality to save an existing task.
    page.querySelector('[component="button/save-task"]').onclick = function() {
      var newTitle = page.querySelector('#title-input').value;

      if (newTitle) {
        // If input title is not empty, ask for confirmation before saving.
        ons.notification.confirm(
          {
            title: 'Save changes?',
            message: 'Previous data will be overwritten.',
            buttonLabels: ['Discard', 'Save']
          }
        ).then(function(buttonIndex) {
          if (buttonIndex === 1) {
            // If 'Save' button was pressed, overwrite the task.
            myApp.services.tasks.update(element,
              {
                title: newTitle,
                category: page.querySelector('#category-input').value,
                description: page.querySelector('#description-input').value,
                ugent: element.data.urgent,
                highlight: page.querySelector('#highlight-input').checked
              }
            );

            // Set selected category to 'All', refresh and pop page.
            document.querySelector('#default-category-list ons-list-item ons-radio').checked = true;
            document.querySelector('#default-category-list ons-list-item').updateCategoryView();
            document.querySelector('#myNavigator').popPage();
          }
        });

      } else {
        // Show alert if the input title is empty.
        ons.notification.alert('You must provide a task title.');
      }
    };
  }
};
