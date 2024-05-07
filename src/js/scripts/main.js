// scripts do slide principal
// https://swiperjs.com

var slide_hero = new Swiper('.slide-hero', {
  pagination: {
    el: '.slide-hero .main-area .area-explore .swiper-pagination'
  },
  effect: 'fade',
  autoplay: { delay: 4e3, disableOnInteraction: !1 },
  keyboard: { enabled: !0 }
})

//*********************************************************//

const cardPokemon = document.querySelectorAll('.js-open-details-pokemon')
const btnCloseModal = document.querySelector('.js-close-modal-details-pokemon')
const countPokemons = document.getElementById('js-count-pokemons')

cardPokemon.forEach(card => {
  card.addEventListener('click', openDetailsPokemon)
})

if (btnCloseModal) {
  btnCloseModal.addEventListener('click', closeDetailsPokemon)
}

//Referente à exibição da lista dos tipos de Pokémon para o Mobile

const btnDropdownSelect = document.querySelector('.js-open-select-custom')

btnDropdownSelect.addEventListener('click', () => {
  btnDropdownSelect.parentElement.classList.toggle('active')
})

const areaPokemons = document.getElementById('js-list-pokemons')

function primeiraLetraMaiuscula(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function createCardPokemon(code, type, nome, imagePok) {
  let card = document.createElement('button')

  //Adicionando três classes ao card
  card.classList = `card-pokemon js-open-details-pokemon ${type}`
  card.setAttribute('code-pokemon', code)
  areaPokemons.appendChild(card)

  //Div imagem
  let image = document.createElement('div')
  image.classList = 'image'
  card.appendChild(image)

  //Elemento img
  let imageSrc = document.createElement('img')
  imageSrc.className = 'thumb-img'
  imageSrc.setAttribute('src', imagePok)
  image.appendChild(imageSrc)

  //Div info
  let infoCardPokemon = document.createElement('div')
  infoCardPokemon.classList = 'info'
  card.appendChild(infoCardPokemon)

  //Div text
  let infoTextPokemon = document.createElement('div')
  infoTextPokemon.classList = 'text'
  infoCardPokemon.appendChild(infoTextPokemon)

  //Span code
  let codePokemon = document.createElement('span')
  codePokemon.textContent =
    code < 10 ? `#00${code}` : code < 100 ? `#0${code}` : `#${code}`
  infoTextPokemon.appendChild(codePokemon)

  //Nome do Pokémon
  let namePokemon = document.createElement('h3')
  namePokemon.textContent = primeiraLetraMaiuscula(nome)
  infoTextPokemon.appendChild(namePokemon)

  //Criando a div para o icon
  let areaIcon = document.createElement('div')
  areaIcon.classList = 'icon'
  infoCardPokemon.appendChild(areaIcon)

  //Imagem do tipo
  let imgType = document.createElement('img')
  imgType.setAttribute('src', `src/img/icon-types/${type}.svg`)
  areaIcon.appendChild(imgType)
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to fetch and display Pokémons in an ascending order based on their ID
async function listingPokemons(urlApi) {
  try {
    const response = await axios.get(urlApi);
    await delay(1300); // Atraso de 1.3 segundos
    const { results, next, count } = response.data;
    countPokemons.innerText = count;

    results.sort((a, b) => a.id - b.id).forEach(async pokemon => {
      const detailsResponse = await axios.get(pokemon.url);
      const { name, id, sprites, types } = detailsResponse.data;

      createCardPokemon(
        id,
        types[0].type.name,
        name,
        sprites.other.dream_world.front_default
      );

      document.querySelectorAll('.js-open-details-pokemon').forEach(card => {
        card.addEventListener('click', openDetailsPokemon);
      });
    });
  } catch (error) {
    console.error('Failed to fetch and list Pokémon:', error);
  }
}
listingPokemons('https://pokeapi.co/api/v2/pokemon/?limit=9&offset=0')

async function openDetailsPokemon() {
  document.documentElement.classList.add('open-modal');
  document.documentElement.style.overflow = 'hidden';

  const codePokemon = this.getAttribute('code-pokemon');

  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${codePokemon}`);
    await delay(1300); // Atraso de 1.3 segundos
    const { abilities, types, weight, height, stats } = response.data;

    updatePokemonModal(this, {
      name: this.querySelector('.info h3').textContent,
      imageSrc: this.querySelector('.thumb-img').getAttribute('src'),
      typeIconSrc: this.querySelector('.info .icon img').getAttribute('src'),
      code: this.querySelector('.info span').textContent,
      mainAbilities: abilities[0].ability.name,
      types,
      weight,
      height,
      stats
    });
  } catch (error) {
    console.error('Failed to fetch Pokémon details:', error);
  }
}

function closeDetailsPokemon() {
  document.documentElement.classList.remove('open-modal')
  document.documentElement.style.overflow = 'auto'
}

function updatePokemonModal(triggerElement, data) {
  const { name, imageSrc, typeIconSrc, code, mainAbilities, types, weight, height, stats } = data;
  const modal = document.getElementById('js-modal-details');

  modal.querySelector('#js-image-pokemon-modal').setAttribute('src', imageSrc);
  modal.querySelector('#js-image-type-modal').setAttribute('src', typeIconSrc);
  modal.querySelector('#js-name-pokemon-modal').textContent = name;
  modal.querySelector('#js-code-pokemon-modal').textContent = code;
  // Update additional modal fields as needed...
}

// Listando todos os tipos de Pokémon

const areaTypes = document.getElementById('js-type-area')
const areaTypesMobile = document.querySelector('.dropdown-select')

axios({
  method: 'GET',
  url: 'https://pokeapi.co/api/v2/type'
}).then(response => {
  const { results } = response.data
  //Pegando o index porque é referente à posição de cada tipo
  results.forEach((type, index) => {
    if (index < 18) {
      let itemType = document.createElement('li')

      areaTypes.appendChild(itemType)

      let buttonType = document.createElement('button')
      buttonType.classList = `type-filter ${type.name}`
      //+1 Porque o id não começa do 0 e sim do 1
      buttonType.setAttribute('code-type', index + 1)
      itemType.appendChild(buttonType)

      let iconType = document.createElement('div')
      iconType.classList = 'icon'
      buttonType.appendChild(iconType)

      let srcType = document.createElement('img')
      srcType.setAttribute('src', `src/img/icon-types/${type.name}.svg`)
      iconType.appendChild(srcType)

      let nameType = document.createElement('span')
      nameType.textContent = primeiraLetraMaiuscula(type.name)
      buttonType.appendChild(nameType)

      //******************* Preenchimento do select MOBILE dos tipos *******************

      let itemTypeMobile = document.createElement('li')
      areaTypesMobile.appendChild(itemTypeMobile)

      let buttonTypeMobile = document.createElement('button')
      buttonTypeMobile.classList = `type-filter ${type.name}`
      buttonTypeMobile.setAttribute('code-type', index + 1)
      itemTypeMobile.appendChild(buttonTypeMobile)

      let iconTypeMobile = document.createElement('div')
      iconTypeMobile.classList = 'icon'
      buttonTypeMobile.appendChild(iconTypeMobile)

      let srcTypeMobile = document.createElement('img')
      srcTypeMobile.setAttribute('src', `src/img/icon-types/${type.name}.svg`)
      iconTypeMobile.appendChild(srcTypeMobile)

      let nameTypeMobile = document.createElement('span')
      nameTypeMobile.textContent = primeiraLetraMaiuscula(type.name)
      buttonTypeMobile.appendChild(nameTypeMobile)

      const allTypes = document.querySelectorAll('.type-filter')

      allTypes.forEach(btn => {
        btn.addEventListener('click', filterByTypes)
      })
    }
  })
})

//*********** Funcionalidade do LOAD MORE ***********/

const btnLoadMore = document.getElementById('js-btn-load-more');
let countPagination = 10;

// Promisify setTimeout to use with async/await
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function showMorePokemon() {
  const apiUrl = `https://pokeapi.co/api/v2/pokemon/?limit=9&offset=${countPagination}`;

  try {
    const response = await axios.get(apiUrl);
    const pokemonPromises = response.data.results.map(pokemon => axios.get(pokemon.url));

    // Wait for 1.3 seconds before continuing
    await delay(1300);

    const pokemonDetails = await Promise.all(pokemonPromises);
    const sortedPokemons = pokemonDetails.sort((a, b) => a.data.id - b.data.id);

    sortedPokemons.forEach(detailResponse => {
      const { name, id, sprites, types } = detailResponse.data;
      createCardPokemon(
        id,
        types[0].type.name,
        name,
        sprites.other.dream_world.front_default
      );
    });

    countPagination += 9; // Update the pagination offset
  } catch (error) {
    console.error('Failed to load more Pokémon:', error);
    // Optionally, update the UI to show an error message
  }
}

btnLoadMore.addEventListener('click', showMorePokemon);

/********************** FUNÇÃO PARA FILTRAR OS POKÉMONS POR TIPO **********************/

// Function to filter and display Pokémons by type in ascending order by their ID
function filterByTypes() {
  let idPokemon = this.getAttribute('code-type')

  const areaPokemons = document.getElementById('js-list-pokemons')
  const btnLoadMore = document.getElementById('js-btn-load-more')

  const allTypes = document.querySelectorAll('.type-filter')

  areaPokemons.innerHTML = ''
  btnLoadMore.style.display = 'none'

  const sectionPokemons = document.querySelector('.s-all-info-pokemons')

  const topSection = sectionPokemons.offsetTop

  window.scrollTo({
    top: topSection + 288,
    behavior: 'smooth'
  })

  allTypes.forEach(type => {
    type.classList.remove('active')
  })

  this.classList.add('active')

  if (idPokemon) {
    axios({
      method: 'GET',
      url: `https://pokeapi.co/api/v2/type/${idPokemon}`
    }).then(response => {
      const { pokemon } = response.data

      // Ordena os Pokémons pelo seu ID, em ordem crescente
      const orderedPokemons = pokemon.map(p => p.pokemon).sort((a, b) => a.id - b.id)

      countPokemons.textContent = orderedPokemons.length

      orderedPokemons.forEach(pok => {
        const { url } = pok

        axios({
          method: 'GET',
          url: `${url}`
        }).then(response => {
          const { name, id, sprites, types } = response.data

          const infoCard = {
            nome: name,
            code: id,
            imagePok: sprites.other.dream_world.front_default,
            type: types[0].type.name
          }

          if (infoCard.imagePok) {
            createCardPokemon(
              infoCard.code,
              infoCard.type,
              infoCard.nome,
              infoCard.imagePok
            )
          }

          const cardPokemon = document.querySelectorAll('.js-open-details-pokemon')

          cardPokemon.forEach(card => {
            card.addEventListener('click', openDetailsPokemon)
          })
        })
      })
    })
  } else {
    areaPokemons.innerHTML = ''

    listingPokemons('https://pokeapi.co/api/v2/pokemon/?limit=9&offset=0')

    btnLoadMore.style.display = 'block'
  }
}

/********************** FUNCIONALIDADE DO SEARCH **********************/

const btnSearch = document.getElementById('js-btn-search')
btnSearch.disabled = true

const inputSearch = document.getElementById('js-input-search')

addEventListener('input', () => {
  let conteudo = inputSearch.value
  if (conteudo !== null && conteudo !== '') {
    btnSearch.disabled = false
  } else {
    btnSearch.disabled = true
  }
})

btnSearch.addEventListener('click', searchPokemon)

inputSearch.addEventListener('keyup', event => {
  if (event.key === 'Enter' && inputSearch.value.length > 0) {
    searchPokemon()
  }
})

function searchPokemon() {
  let valueInput = inputSearch.value.toLowerCase()
  const typeFilter = document.querySelectorAll('.type-filter')

  //Quando pesquisar, irá tirar o active de todos os icones tipos
  typeFilter.forEach(type => {
    type.classList.remove('active')
  })

  axios({
    method: 'GET',
    url: `https://pokeapi.co/api/v2/pokemon/${valueInput}`
  })
    .then(response => {
      areaPokemons.innerHTML = ''
      btnLoadMore.style.display = 'none'
      countPokemons.textContent = 1

      const { pokemon } = response.data

      // Ordena os Pokémons pelo seu ID
      const orderedPokemons = pokemon.sort((a, b) => a.id - b.id)

      const { name, id, sprites, types } = orderedPokemons[0]

      const infoCard = {
        nome: name,
        code: id,
        imagePok: sprites.other.dream_world.front_default,
        type: types[0].type.name
      }

      if (infoCard.imagePok) {
        createCardPokemon(
          infoCard.code,
          infoCard.type,
          infoCard.nome,
          infoCard.imagePok
        )
      }

      const cardPokemon = document.querySelectorAll('.js-open-details-pokemon')

      cardPokemon.forEach(card => {
        card.addEventListener('click', openDetailsPokemon)
      })
    })
    .catch(error => {
      if (error.response) {
        areaPokemons.innerHTML = ''
        btnLoadMore.style.display = 'none'
        countPokemons.textContent = 0

        const sectionPokemons = document.querySelector('.s-all-info-pokemons')
        const topSection = sectionPokemons.offsetTop

        window.scrollTo({
          top: topSection + 288,
          behavior: 'smooth'
        })

        const divConteudoErro = document.createElement('div')
        divConteudoErro.className = 'conteudo-erro'
        areaPokemons.appendChild(divConteudoErro)

        const spanErro = document.createElement('span')
        divConteudoErro.appendChild(spanErro)

        const textoErro = document.createElement('h2')
        textoErro.textContent =
          'Não foi encontrado nenhum resultado com esta pesquisa!'
        textoErro.className = 'text-erro'
        spanErro.appendChild(textoErro)

        const imgErro = document.createElement('img')
        imgErro.setAttribute('src', 'src/img/sad-pikachu.png')
        imgErro.className = 'imgErro'
        spanErro.appendChild(imgErro)
      }
    })
}
