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

// Function to fetch and display Pokémons in an ascending order based on their ID
function listingPokemons(urlApi) {
  axios({
    method: 'GET',
    url: urlApi
  }).then(response => {
    const { results, next, count } = response.data
    countPokemons.innerText = count

    // Ordena os Pokémons pelo seu ID em ordem crescente
    const orderedResults = results.sort((a, b) => a.id - b.id)

    orderedResults.forEach(pokemon => {
      let urlApiDetails = pokemon.url

      axios({
        method: 'GET',
        url: `${urlApiDetails}`
      }).then(response => {
        const { name, id, sprites, types } = response.data

        const infoCard = {
          nome: name,
          code: id,
          imagePok: sprites.other.dream_world.front_default,
          type: types[0].type.name
        }

        createCardPokemon(
          infoCard.code,
          infoCard.type,
          infoCard.nome,
          infoCard.imagePok
        )
        const cardPokemon = document.querySelectorAll('.js-open-details-pokemon')

        cardPokemon.forEach(card => {
          card.addEventListener('click', openDetailsPokemon)
        })
      })
    })
  })
}
listingPokemons('https://pokeapi.co/api/v2/pokemon/?limit=9&offset=0')

function openDetailsPokemon() {
  document.documentElement.classList.add('open-modal')
  document.documentElement.style.overflow = 'hidden'

  //O this pega onde estou clicando
  let codePokemon = this.getAttribute('code-pokemon')
  let imagePokemon = this.querySelector('.thumb-img')
  let iconTypePokemon = this.querySelector('.info .icon img')
  let namePokemon = this.querySelector('.info h3')
  let codeStringPokemon = this.querySelector('.info span')

  const modalDetails = document.getElementById('js-modal-details')
  const imgPokemonModal = document.getElementById('js-image-pokemon-modal')
  const iconTypePokemonModal = document.getElementById('js-image-type-modal')
  const namePokemonModal = document.getElementById('js-name-pokemon-modal')
  const codePokemonModal = document.getElementById('js-code-pokemon-modal')
  const heightPokemonModal = document.getElementById('js-height-pokemon')
  const weightPokemonModal = document.getElementById('js-weight-pokemon')

  imgPokemonModal.setAttribute('src', imagePokemon.getAttribute('src'))
  modalDetails.setAttribute('type-pokemon-modal', this.classList[2])
  iconTypePokemonModal.setAttribute('src', iconTypePokemon.getAttribute('src'))

  namePokemonModal.textContent = namePokemon.textContent
  codePokemonModal.textContent = codeStringPokemon.textContent

  axios({
    method: 'GET',
    url: `https://pokeapi.co/api/v2/pokemon/${codePokemon}`
  }).then(response => {
    let data = response.data

    let infoPokemon = {
      mainAbilities: primeiraLetraMaiuscula(data.abilities[0].ability.name),
      types: data.types,
      weight: data.weight,
      height: data.height,
      abilities: data.abilities,
      stats: data.stats,
      //Acessando o tipo principal do Pokémon, para pegar todas as fraquezas relacionadas à esse tipo
      urlType: data.types[0].type.url
    }

    function listingTypesPokemon() {
      const areaTypesModal = document.getElementById('js-types-pokemon')

      areaTypesModal.innerText = ''

      let arrayTypes = infoPokemon.types

      arrayTypes.forEach(itemType => {
        let itemList = document.createElement('li')
        areaTypesModal.appendChild(itemList)

        let spanList = document.createElement('span')
        spanList.classList = `tag-type ${itemType.type.name}`
        spanList.textContent = primeiraLetraMaiuscula(itemType.type.name)
        itemList.appendChild(spanList)
      })
    }

    function listingWeaknesses() {
      const areaWeak = document.getElementById('js-area-weak')

      areaWeak.innerHTML = ''

      axios({
        method: 'GET',
        url: `${infoPokemon.urlType}`
      }).then(response => {
        let weaknesses = response.data.damage_relations.double_damage_from

        weaknesses.forEach(itemType => {
          let itemListWeak = document.createElement('li')
          areaWeak.appendChild(itemListWeak)

          let spanList = document.createElement('span')
          spanList.classList = `tag-type ${itemType.name}`
          spanList.textContent = primeiraLetraMaiuscula(itemType.name)
          itemListWeak.appendChild(spanList)
        })
      })
    }

    heightPokemonModal.textContent = `${infoPokemon.height / 10}m`
    weightPokemonModal.textContent = `${infoPokemon.weight / 10}Kg`

    //**************************** FUNCIONALIDADE MOSTRAR TODAS AS HABILIDADES ****************************/

    function showMoreAbilities() {
      const AbilitiesModal = document.getElementById('js-show-more-abilities')
      const divAbility = document.getElementById('div-ability')

      divAbility.innerHTML = ''

      let arrayAbilities = infoPokemon.abilities

      arrayAbilities.forEach(itemAbility => {
        AbilitiesModal.appendChild(divAbility)

        let strongList = document.createElement('strong')
        strongList.classList = 'abilityList'
        strongList.textContent = primeiraLetraMaiuscula(
          itemAbility.ability.name
        )
        divAbility.appendChild(strongList)
      })
    }

    //******************************************************************************************************/

    const statsHp = document.getElementById('js-stats-hp')
    statsHp.style.width = `${infoPokemon.stats[0].base_stat}%`

    const statsAttack = document.getElementById('js-stats-attack')
    statsAttack.style.width = `${infoPokemon.stats[1].base_stat}%`

    const statsDefense = document.getElementById('js-stats-defense')
    statsDefense.style.width = `${infoPokemon.stats[2].base_stat}%`

    const statsSpAttack = document.getElementById('js-stats-sp-attack')
    statsSpAttack.style.width = `${infoPokemon.stats[3].base_stat}%`

    const statsSpDefense = document.getElementById('js-stats-sp-defense')
    statsSpDefense.style.width = `${infoPokemon.stats[4].base_stat}%`

    const statsSpeed = document.getElementById('js-stats-speed')
    statsSpeed.style.width = `${infoPokemon.stats[5].base_stat}%`

    listingTypesPokemon()
    listingWeaknesses()
    showMoreAbilities()
  })
}

function closeDetailsPokemon() {
  document.documentElement.classList.remove('open-modal')
  document.documentElement.style.overflow = 'auto'
}

// Listando todos os tipo de Pokémon

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

// Obtain the button element to trigger more Pokémon to load
const btnLoadMore = document.getElementById('js-btn-load-more');

// Initialize the pagination offset to load Pokémons beyond the first page
let countPagination = 10;

// Função para criar o atraso
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to fetch Pokémon details
async function fetchPokemonDetails(url) {
  const response = await axios.get(url);
  return response.data;
}

function createPokemonCard(pokemon) {
  const { id, types, name, sprites } = pokemon;
  createCardPokemon(
    id,
    types[0].type.name,
    name,
    sprites.other.dream_world.front_default
  );
}

async function showMorePokemon() {
  const apiUrl = `https://pokeapi.co/api/v2/pokemon/?limit=9&offset=${countPagination}`;

  try {
    // Aguarde o atraso antes de continuar
    await delay(1300);

    const response = await axios.get(apiUrl);
    const detailPromises = response.data.results.map(pokemon =>
      fetchPokemonDetails(pokemon.url));

    // Fetch all Pokémon details concurrently
    const pokemonDetails = await Promise.all(detailPromises);

    // Sort Pokémon by ID after fetching their details
    pokemonDetails.sort((a, b) => a.id - b.id);

    // Create cards for each Pokémon
    pokemonDetails.forEach(createPokemonCard);

    // Update the pagination offset for the next batch of Pokémon
    countPagination += 9;
  } catch (error) {
    console.error('Failed to load more Pokémon:', error);
  }
}

// Add an event listener to the Load More button to fetch more Pokémon on click
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
